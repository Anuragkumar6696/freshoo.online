import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import Order from "../../models/Order";
import { successResponse, errorResponse } from "../../utils/response";

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

    // Calculate pricing
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const deliveryFee = 0;
    const packagingFee = 0;
    const tax = 0;
    const total = subtotal;

    // Generate order ID
    const friendlyId = "FRSH-" + Math.floor(100000 + Math.random() * 900000);

    // Customer info
    let userId: string | null = null;
    let customerName: string | null = null;
    let customerEmail: string | null = null;
    let customerPhone: string | null = null;
    let guestEmail: string | null = null;
    let guestPhone: string | null = null;

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
      guestEmail = guestDetails.email || null;
      guestPhone = guestDetails.phone || null;
    }

    const order = await Order.create({
      friendlyId,
      userId,
      customerName,
      isGuestOrder: isGuest || !userId,
      guestEmail,
      guestPhone,
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
      // Ensure customer info is always available for dashboard filters
      customerName: customerName || guestDetails?.name || "Guest",
      customerEmail: (guestDetails?.email || null),
      customerPhone: (guestDetails?.phone || null),
    });

    // Include formatted date in response
    const orderJson = order.toJSON() as any;
    orderJson.date = order.createdAt
      ? new Date(order.createdAt).toLocaleString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : new Date().toLocaleString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
    // Map backend status to frontend-friendly label
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
    orderJson.statusLabel = STATUS_LABELS[order.status] || order.status;

    // Send Brevo notification (fire-and-forget, non-blocking)
    void (async () => {
      try {
        const { notifyAdmin } = await import("../../lib/brevo");
        const orderForEmail: any = { ...orderJson };
        await Promise.allSettled([
          notifyAdmin(orderForEmail),
        ]);
      } catch (e) {
        console.log("[Brevo] notification error (non-fatal):", e);
      }
    })();

    return successResponse(res, { order: orderJson }, "Order placed successfully", 201);
  } catch (err: any) {
    console.error("[Orders] Create error:", err?.stack || err?.message || err);
    return errorResponse(res, `Failed to place order: ${err?.message || "unknown"}`, 500);
  }
};

// GET /api/v1/user/orders
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const userEmail = (req.user as any)?.email || null;
    const userPhone = (req.user as any)?.phone || null;

    let query: any = {};
    if (userId) {
      query = { userId: userId };
    } else if (userEmail || userPhone) {
      const or: any[] = [];
      if (userEmail) or.push({ guestEmail: userEmail.toLowerCase() });
      if (userPhone) or.push({ guestPhone: userPhone });
      if (or.length > 0) query = { $or: or };
    } else {
      const qguest = req.query.guestEmail || req.query.guestPhone;
      if (qguest) {
        query = { $or: [{ guestEmail: String(qguest).toLowerCase() }, { guestPhone: String(qguest) }] };
      } else {
        query = { userId: null };
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    return successResponse(res, { orders });
  } catch (err: any) {
    console.error("[Orders] Get error:", err.message || err);
    return errorResponse(res, "Failed to fetch orders", 500);
  }
};

// GET /api/v1/orders - Admin list
export const listOrders = async (_req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 }).limit(100).lean();
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
    const order = await Order.findOne({ friendlyId: id }).lean();
    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, { order });
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
      { friendlyId: id },
      { $set: { status } },
      { new: true }
    );
    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, { order: order.toJSON() }, "Order status updated");
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
      { friendlyId: id },
      { $set: { status: "CANCELLED" } },
      { new: true }
    );
    if (!order) return errorResponse(res, "Order not found", 404);
    return successResponse(res, { order: order.toJSON() }, "Order cancelled");
  } catch (err: any) {
    console.error("[Orders] Cancel error:", err.message || err);
    return errorResponse(res, "Failed to cancel order", 500);
  }
};
