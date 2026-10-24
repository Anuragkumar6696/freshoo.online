import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order, PermittedOrderStatus } from "@/models/Order";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let ctx: any;
  try {
    ctx = await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const status = body?.status as PermittedOrderStatus;
    const paymentStatus = body?.paymentStatus;
    const note = body?.note || "Status updated by admin";

    if (!status && !paymentStatus) {
      return jsonErr("Order status or payment status is required.");
    }

    // Specification strictly enforces the two primary order statuses
    const allowedStatuses: PermittedOrderStatus[] = ["Order Received", "Order Confirmed"];
    if (status && !allowedStatuses.includes(status)) {
      return jsonErr(
        `Invalid order status '${status}'. Only 'Order Received' and 'Order Confirmed' are permitted.`,
        400
      );
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ friendlyId: id }, { _id: id }] } : { friendlyId: id };

    const existingOrder = await Order.findOne(query);
    if (!existingOrder) {
      return notFound("Order not found");
    }

    const updateFields: any = {};
    if (status) {
      updateFields.status = status;
    }
    if (paymentStatus) {
      updateFields.paymentStatus = paymentStatus;
    }

    const adminIdentity = ctx?.user?.email || ctx?.user?.name || "Admin";

    const updated = await Order.findOneAndUpdate(
      query,
      {
        $set: updateFields,
        $push: {
          statusHistory: {
            status: status || existingOrder.status,
            timestamp: new Date(),
            updatedBy: adminIdentity,
            note: note,
          },
        },
      },
      { new: true }
    );

    if (!updated) {
      return notFound("Order not found");
    }

    return jsonOk({
      order: updated.toJSON(),
      message: `Order status successfully updated to '${status}'.`,
    });
  } catch (e: any) {
    console.error("order status PATCH error:", e);
    return jsonErr(e?.message || "Failed to update order status", 500);
  }
}

export function GET() {
  return methodNotAllowed(["PATCH"]);
}
export function POST() {
  return methodNotAllowed(["PATCH"]);
}
export function DELETE() {
  return methodNotAllowed(["PATCH"]);
}
