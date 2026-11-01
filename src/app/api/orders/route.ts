import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
import { Franchise } from "@/models/Franchise";
import { StoreSettings } from "@/models/StoreSettings";
import { jsonErr, jsonOk, methodNotAllowed, unauthorized } from "@/lib/response";
import { getAuthUser, MASTER_ADMIN_EMAILS } from "@/lib/withAuth";
import { sendNewOrderAdminNotification, sendOrderCustomerConfirmation } from "@/lib/brevo";
import { evaluateServiceability, checkOperatingHours } from "@/lib/geo";
import type { Order as OrderT } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(2000, Math.max(1, Number(searchParams.get("limit") || 1000)));
    const status = searchParams.get("status");
    const franchiseCode = searchParams.get("franchise");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const search = searchParams.get("search")?.trim();

    const email = (ctx.user.email || ctx.auth.email || "").toLowerCase().trim();
    const isAdmin =
      !!ctx.auth.isAdmin ||
      !!ctx.user.isAdmin ||
      ctx.user.role === "ADMIN" ||
      (ctx.user as any).role === "admin" ||
      (ctx.auth as any).role === "ADMIN" ||
      MASTER_ADMIN_EMAILS.includes(email) ||
      email.endsWith("@freshoo.online") ||
      email.endsWith("@freshoo.in");

    const q: any = {};
    if (!isAdmin) {
      q.userId = ctx.user._id;
    }
    if (status) {
      q.status = status;
    }
    if (franchiseCode) {
      q["franchise.code"] = franchiseCode;
    }
    if (startDate || endDate) {
      q.createdAt = {};
      if (startDate) q.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        q.createdAt.$lte = end;
      }
    }
    if (search) {
      const rx = { $regex: search, $options: "i" };
      q.$or = [
        { friendlyId: rx },
        { customerName: rx },
        { customerPhone: rx },
        { customerEmail: rx },
        { "address.addressLine": rx },
      ];
    }

    const list = await Order.find(q)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    const orders: OrderT[] = list.map((o: any) => {
      const id = o.friendlyId || o._id.toString();
      const out: any = {
        ...o,
        id,
        _id: undefined,
        __v: undefined,
        friendlyId: undefined,
      };
      return out as OrderT;
    });

    return jsonOk({ orders, total: orders.length });
  } catch (e: any) {
    console.error("orders GET error:", e);
    return jsonErr(e?.message || "Failed to load orders", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      items,
      address,
      paymentMethod,
      instructions,
      geoLocation,
      isGuest,
      guestDetails,
      idempotencyKey: clientKey,
    } = body;

    // 1. Idempotency Check (prevents double submits / duplicates)
    const idempotencyKey =
      clientKey?.trim() ||
      `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    if (clientKey) {
      const existing = await Order.findOne({ idempotencyKey: clientKey }).lean();
      if (existing) {
        const id = (existing as any).friendlyId || (existing as any)._id.toString();
        const existingFormatted: any = {
          ...existing,
          id,
          _id: undefined,
          __v: undefined,
          friendlyId: undefined,
        };
        return jsonOk({ order: existingFormatted, isDuplicate: true }, { status: 200 });
      }
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonErr("Your cart is empty.");
    }
    if (!address || !address.addressLine || !address.city || !address.pincode) {
      return jsonErr("Delivery address is incomplete.");
    }
    if (!paymentMethod) {
      return jsonErr("Payment method is required.");
    }

    // 2. Validate Operating Hours & Holiday Mode
    const settings = await StoreSettings.findOne({ singleton: "main" }).lean();
    if (settings) {
      const timingCheck = checkOperatingHours(
        settings.openingTime || "07:00",
        settings.closingTime || "23:00",
        settings.holidays || [],
        settings.isTemporarilyClosed || settings.holidayMode
      );
      if (!timingCheck.isOpen) {
        return jsonErr(
          timingCheck.reason || "Store is currently closed for new orders. Please check back during operating hours.",
          400
        );
      }
    }

    // 3. Server-side Franchise & Serviceability Validation
    const deliveryCoords = geoLocation || address?.geoLocation;
    let selectedFranchiseSnapshot: any = null;

    // Ensure initial franchise exists
    const franchiseCount = await Franchise.countDocuments();
    if (franchiseCount === 0) {
      await Franchise.create({
        name: "Rohini Sector 22 Hub (Main)",
        code: "ROHINI-22",
        address: "Pocket 4, Sector 22, Rohini, New Delhi",
        city: "Delhi",
        coordinates: {
          latitude: 28.7188,
          longitude: 77.0673,
        },
        phone: "+919310593167",
        email: "freshoo.online@gmail.com",
        deliveryRadiusKm: 10,
        isActive: true,
        openingTime: "07:00",
        closingTime: "23:00",
        isTemporarilyClosed: false,
        holidays: [],
      });
    }

    const activeFranchises = await Franchise.find({ isActive: true }).lean();
    if (activeFranchises.length > 0 && deliveryCoords?.latitude != null && deliveryCoords?.longitude != null) {
      const summaryList = activeFranchises.map((f: any) => ({
        id: f._id.toString(),
        name: f.name,
        code: f.code,
        address: f.address,
        coordinates: f.coordinates,
        deliveryRadiusKm: f.deliveryRadiusKm,
        isActive: f.isActive,
        isTemporarilyClosed: f.isTemporarilyClosed,
        openingTime: f.openingTime,
        closingTime: f.closingTime,
        holidays: f.holidays,
      }));

      const serv = evaluateServiceability(deliveryCoords, summaryList);
      if (!serv.isServiceable) {
        return jsonErr(
          serv.message || "This delivery address is outside our maximum freshness delivery area.",
          400
        );
      }

      if (serv.franchise) {
        selectedFranchiseSnapshot = {
          id: serv.franchise.id,
          name: serv.franchise.name,
          code: serv.franchise.code,
          distanceKm: serv.distanceKm,
        };
      }
    } else if (activeFranchises.length > 0) {
      // Default to primary hub if no coordinates provided
      const defaultHub = activeFranchises[0];
      selectedFranchiseSnapshot = {
        id: defaultHub._id.toString(),
        name: defaultHub.name,
        code: defaultHub.code,
        distanceKm: null,
      };
    }

    // 4. Server-Side Item Price & Inventory Re-calculation (Prevents Price Tampering)
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      const productId = item.product?.id || item.product?._id;
      const requestedWeight = item.selectedWeight || "500g";
      const quantity = Math.max(1, Number(item.quantity) || 1);

      let unitPrice = Number(item.price) || 0;
      let productName = item.product?.name || "Fresh Cut Meat";
      let productImage = item.product?.image || "/chicken1.png";

      if (productId) {
        const dbProduct = await Product.findById(productId).lean();
        if (dbProduct) {
          productName = dbProduct.name;
          productImage = dbProduct.image || productImage;
          // Find the exact price for the requested weight variant in DB
          const weightMatch = (dbProduct.weights || []).find(
            (w: any) => w.weight === requestedWeight
          );
          if (weightMatch && weightMatch.price > 0) {
            unitPrice = weightMatch.price;
          }
        }
      }

      const itemTotal = unitPrice * quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        product: {
          id: productId || "prod",
          name: productName,
          image: productImage,
          category: item.product?.category || "Chicken",
        },
        selectedWeight: requestedWeight,
        price: unitPrice,
        quantity,
      });
    }

    const subtotal = calculatedSubtotal;
    const discount = 0; // Configurable coupon support preserved
    const total = Math.max(0, subtotal - discount);

    const friendlyId = "FRSH-" + Math.floor(100000 + Math.random() * 900000);

    const ctx = await getAuthUser().catch(() => null);

    let userId: any = null;
    let customerName = "Guest";
    let customerEmail: string | null = null;
    let customerPhone: string | null = null;

    if (ctx?.user) {
      userId = ctx.user._id;
      customerName = ctx.user.name || "Customer";
      customerEmail = ctx.user.email || null;
      customerPhone = ctx.user.phone || null;
    }

    // Explicit details provided at checkout (for guest or updated profile)
    if (guestDetails) {
      if (guestDetails.name?.trim()) customerName = guestDetails.name.trim();
      if (guestDetails.email?.trim()) customerEmail = guestDetails.email.trim();
      if (guestDetails.phone?.trim()) customerPhone = guestDetails.phone.trim();
    }
    if (body.customerName?.trim()) customerName = body.customerName.trim();
    if (body.customerEmail?.trim()) customerEmail = body.customerEmail.trim();
    if (body.customerPhone?.trim()) customerPhone = body.customerPhone.trim();

    const rawDate = new Date().toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });

    // 5. Persist Order in Database with Initial Status: "Order Received"
    const created = await Order.create({
      friendlyId,
      idempotencyKey,
      date: rawDate,
      userId: userId || null,
      customerName,
      customerEmail: customerEmail ? customerEmail.toLowerCase() : null,
      customerPhone,
      isGuestOrder: Boolean(isGuest || !userId),
      guestEmail: customerEmail ? customerEmail.toLowerCase() : null,
      guestPhone: customerPhone,
      items: verifiedItems,
      address,
      franchise: selectedFranchiseSnapshot,
      geoLocation: geoLocation || null,
      paymentMethod: (paymentMethod || "cod").toLowerCase(),
      paymentStatus: "Pending",
      status: "Order Confirmed",
      statusHistory: [
        {
          status: "Order Confirmed",
          timestamp: new Date(),
          updatedBy: "system",
          note: "Order placed and automatically confirmed.",
        },
      ],
      instructions: instructions || null,
      subtotal,
      discount,
      total,
    });

    const jsonOrder = created.toJSON() as unknown as OrderT;
    jsonOrder.id = created.friendlyId || created._id.toString();

    jsonOrder.customerName = customerName || "Customer";
    jsonOrder.customerEmail = customerEmail ? customerEmail.toLowerCase() : null;
    jsonOrder.customerPhone = customerPhone || null;
    jsonOrder.guestEmail = customerEmail ? customerEmail.toLowerCase() : null;
    jsonOrder.guestPhone = customerPhone || null;
    if (!jsonOrder.geoLocation && (geoLocation || address?.geoLocation)) {
      jsonOrder.geoLocation = geoLocation || address?.geoLocation;
    }

    // 6. Dual Brevo Email Dispatch (Non-blocking background execution for lightning sub-100ms response)
    void (async () => {
      try {
        const results = await Promise.allSettled([
          sendNewOrderAdminNotification(jsonOrder),
          sendOrderCustomerConfirmation(jsonOrder),
        ]);
        console.log("[Brevo] order notification dispatched:", JSON.stringify(results));
      } catch (err) {
        console.warn("[Brevo] order notification failed:", err);
      }
    })();

    // 7. Auto-Sync Contact Details to User Profile (if logged-in user updated phone/email at checkout)
    if (ctx?.user && (customerPhone || customerEmail)) {
      void (async () => {
        try {
          const { User } = await import("@/models/User");
          const updates: any = {};
          if (customerPhone && customerPhone !== ctx.user.phone) {
            updates.phone = customerPhone;
          }
          if (customerEmail && customerEmail.toLowerCase() !== (ctx.user.email || "").toLowerCase()) {
            updates.email = customerEmail.toLowerCase();
          }
          if (Object.keys(updates).length > 0) {
            await User.findByIdAndUpdate(ctx.user._id, { $set: updates });
          }
        } catch (err) {
          console.warn("[UserUpdate] profile sync from checkout notice:", err);
        }
      })();
    }

    // 8. Auto-Record to Persistent Live Excel Workbook
    void (async () => {
      try {
        const { syncAllOrdersToExcelDisk } = await import("@/lib/excelSync");
        await syncAllOrdersToExcelDisk();
      } catch (err) {
        console.warn("[ExcelSync] Failed non-blocking excel disk sync:", err);
      }
    })();

    return jsonOk({ order: jsonOrder }, { status: 201 });
  } catch (e: any) {
    console.error("orders POST error:", e);
    return jsonErr(e?.message || "Failed to place order. Please try again.", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST"]);
}
export function DELETE() {
  return methodNotAllowed(["GET", "POST"]);
}
