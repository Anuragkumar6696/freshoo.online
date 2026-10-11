import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { jsonErr, jsonOk, methodNotAllowed, unauthorized } from "@/lib/response";
import { getAuthUser } from "@/lib/withAuth";
import { sendNewOrderAdminNotification, sendOrderCustomerConfirmation } from "@/lib/brevo";
import type { Order as OrderT } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 100)));
    const status = searchParams.get("status");

    const isAdmin = ctx.auth.isAdmin || ctx.user.isAdmin || ctx.user.email === "admin@freshoo.in";

    const q: any = {};
    if (!isAdmin) {
      q.userId = ctx.user._id;
    }
    if (status) {
      q.status = status;
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
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonErr("Your cart is empty.");
    }
    if (!address || !address.addressLine || !address.city || !address.pincode) {
      return jsonErr("Delivery address is incomplete.");
    }
    if (!paymentMethod) {
      return jsonErr("Payment method is required.");
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

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

    // Always prefer explicit details provided at checkout (whether logged in or guest)
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
    });

    const idempotencyKey =
      body?.idempotencyKey ||
      `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

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
      items,
      address,
      geoLocation: geoLocation || null,
      paymentMethod: (paymentMethod || "cod").toLowerCase(),
      status: "Order Placed",
      instructions: instructions || null,
      subtotal,
      discount: 0,
      total: subtotal,
    });

    const jsonOrder = created.toJSON() as unknown as OrderT;

    // Await both Brevo emails before returning so Vercel Serverless doesn't terminate background promises prematurely
    try {
      const results = await Promise.allSettled([
        sendNewOrderAdminNotification(jsonOrder),
        sendOrderCustomerConfirmation(jsonOrder),
      ]);
      console.log("[Brevo] order notification dispatched:", JSON.stringify(results));
    } catch (err) {
      console.warn("[Brevo] order notification failed:", err);
    }

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

