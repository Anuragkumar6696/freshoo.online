import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const status = body?.status;

    if (!status) {
      return jsonErr("Order status is required.");
    }

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ friendlyId: id }, { _id: id }] } : { friendlyId: id };

    const updated = await Order.findOneAndUpdate(
      query,
      { $set: { status } },
      { new: true }
    );

    if (!updated) {
      return notFound("Order not found");
    }

    return jsonOk({ order: updated.toJSON(), message: "Order status updated successfully." });
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

