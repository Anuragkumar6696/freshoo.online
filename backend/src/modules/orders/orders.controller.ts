import { Response } from "express";
import mongoose from "mongoose";
import { AuthRequest } from "../../middleware/auth";
import Order from "../../models/Order";
import { successResponse, errorResponse } from "../../utils/response";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Order Placed",
  CONFIRMED: "Order Placed",
  PROCESSING: "Processing",
  PREPARING: "Preparing",
  READY_FOR_COLLECTION: "Ready for Collection",
  COLLECTED: "Collected",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

// Helper: Safely build MongoDB ID match query without triggering CastError
const buildIdQuery = (id: string) => {
  const isObjectId = mongoose.Types.ObjectId.isValid(id);
  return isObjectId ? { $or: [{ friendlyId: id }, { _id: id }] } : { friendlyId: id };
};

// Helper: Standardize response object shape for client UI
const formatOrder = (orderDoc: any) => {
  const orderObj = typeof orderDoc.toObject === "function" ? orderDoc.toObject() : { ...orderDoc };
  const rawDate = orderObj.createdAt || orderObj.date;

  return {
    ...orderObj,
    id: orderObj.friendlyId || (orderObj._id ? orderObj._id.toString() : undefined),
    date: rawDate
      ? new Date(rawDate).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "",
    statusLabel: STATUS_LABELS[orderObj.status] || orderObj.status || "Order Placed",
  };
};

// POST /api/v1/orders - Place order
export const createOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      items,
      address,
      paymentMethod,
      instructions,
      geoLocation,
      isGuest,
      guestDetails,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse(res, "Cart is empty", 400);
    }
    if (!address || !address.addressLine || !address.city || !address.pincode) {
      return errorResponse(res, "Invalid address", 400);
    }
    if (!paymentMethod) {
      return errorResponse(res, "Payment method required", 400);
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );

    const friendlyId = "FRSH-" + Math.floor(100000 + Math.random() * 900000);

    let userId: string | null = null;
    let customerName: string | null = null;
    let customerEmail: string | null = null;
    let customerPhone: string | null = null;

    if (!isGuest && req.user?.userId) {
      userId = req.user.userId;
      customerEmail = (req.user as any)?.email || null;
      customerPhone = (req.user as any)?.phone || null;
      customerName = (req.user as any)?.name || null;
    }

    if (guestDetails) {
      customerName = guestDetails.name || customerName;
      customerEmail = guestDetails.email || customerEmail;
      customerPhone = guestDetails.phone || customerPhone;
    }

    const normalizedEmail = customerEmail ? customerEmail.toLowerCase() : null;

    const createdDoc = await Order.create({
      friendlyId,
      userId: userId || null,
      customerName: customerName || "Guest",
      customerEmail: normalizedEmail,
      customerPhone,
      isGuestOrder: Boolean(isGuest || !userId),
      guestEmail: normalizedEmail,
      guestPhone: customerPhone,
      items,
      address,
      geoLocation: geoLocation || null,
      paymentMethod: (paymentMethod || "COD").toUpperCase(),
      paymentStatus: "PENDING",
      status: "CONFIRMED",
      instructions: instructions || null,
      subtotal,
      discount: 0,
      deliveryFee: 0,
      packagingFee: 0,
      tax: 0,
      total: subtotal,
      idempotencyKey: `${Date.now()}-${Math.random()}`,
    });

    const formattedOrder = formatOrder(createdDoc);

    // Send Brevo notification non-blocking
    void (async () => {
      try {
        const { notifyAdmin } = await import("../../lib/brevo");
        await Promise.allSettled([notifyAdmin(formattedOrder)]);
      } catch (e) {
        console.log("[Brevo] notification error (non-fatal):", e);
      }
    })();

    return successResponse(res, { order: formattedOrder }, "Order placed successfully", 201);
  } catch (err: any) {
    console.error("[Orders] Create error:", err?.stack || err?.message || err);
    return errorResponse(res, `Failed to place order: ${err?.message || "unknown"}`, 500);
  }
};

// GET /api/v1/user/orders
// GET /api/v1/user/orders
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId || (req.user as any)?.id || (req.user as any)?._id;
    const userEmail = (req.user as any)?.email ? (req.user as any).email.toLowerCase() : null;
    const userPhone = (req.user as any)?.phone || null;
    const isAdmin = (req.user as any)?.isAdmin || (req.user as any)?.role === "ADMIN" || userEmail === "admin@freshoo.in";

    // 🚀 FIX: Agar Admin request kar raha hai, toh saare orders do (No user filter!)
    if (isAdmin) {
      const allOrders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
      const formattedOrders = allOrders.map((order) => formatOrder(order));
      return successResponse(res, { orders: formattedOrders });
    }

    // 🟢 AGAR NORMAL USER HAI, TOH SIRF USKE ORDERS FILTER KARO
    const orConditions: any[] = [];

    if (userId) {
      orConditions.push({ userId });
    }
    if (userEmail) {
      orConditions.push({ customerEmail: userEmail });
      orConditions.push({ guestEmail: userEmail });
    }
    if (userPhone) {
      orConditions.push({ customerPhone: userPhone });
      orConditions.push({ guestPhone: userPhone });
    }

    const qEmail = req.query.email || req.query.guestEmail;
    const qPhone = req.query.phone || req.query.guestPhone;
    const qUserId = req.query.userId;

    if (qUserId) orConditions.push({ userId: String(qUserId) });
    if (qEmail) {
      const normalizedQueryEmail = String(qEmail).toLowerCase();
      orConditions.push({ customerEmail: normalizedQueryEmail });
      orConditions.push({ guestEmail: normalizedQueryEmail });
    }
    if (qPhone) {
      orConditions.push({ customerPhone: String(qPhone) });
      orConditions.push({ guestPhone: String(qPhone) });
    }

    if (orConditions.length === 0) {
      return successResponse(res, { orders: [] });
    }

    const orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
    const formattedOrders = orders.map((order) => formatOrder(order));

    return successResponse(res, { orders: formattedOrders });
  } catch (err: any) {
    console.error("[Orders] Get error:", err.message || err);
    return errorResponse(res, "Failed to fetch orders", 500);
  }
};

// GET /api/v1/orders - Admin list
export const listOrders = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const rawOrders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
    const orders = rawOrders.map((order) => formatOrder(order));

    return successResponse(res, { orders });
  } catch (err: any) {
    console.error("[Orders] List error:", err.message || err);
    return errorResponse(res, "Failed to fetch orders", 500);
  }
};

// GET /api/v1/orders/:id
export const getOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const order = await Order.findOne(buildIdQuery(id)).lean();
    if (!order) return errorResponse(res, "Order not found", 404);

    return successResponse(res, { order: formatOrder(order) });
  } catch (err: any) {
    console.error("[Orders] Get one error:", err.message || err);
    return errorResponse(res, "Failed to fetch order", 500);
  }
};

// PATCH /api/v1/orders/:id/status
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return errorResponse(res, "Status required", 400);

    const order = await Order.findOneAndUpdate(
      buildIdQuery(id),
      { $set: { status } },
      { new: true }
    ).lean();

    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, { order: formatOrder(order) }, "Order status updated");
  } catch (err: any) {
    console.error("[Orders] Update error:", err.message || err);
    return errorResponse(res, "Failed to update order", 500);
  }
};

// DELETE /api/v1/orders/:id
export const cancelOrder = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndUpdate(
      buildIdQuery(id),
      { $set: { status: "CANCELLED" } },
      { new: true }
    ).lean();

    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, { order: formatOrder(order) }, "Order cancelled");
  } catch (err: any) {
    console.error("[Orders] Cancel error:", err.message || err);
    return errorResponse(res, "Failed to cancel order", 500);
  }
};