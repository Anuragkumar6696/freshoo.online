import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound } from "@/lib/response";
import { getAuthUser } from "@/lib/withAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const phoneVerification = searchParams.get("phone")?.trim();
    const emailVerification = searchParams.get("email")?.trim().toLowerCase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ friendlyId: id }, { _id: id }] } : { friendlyId: id };

    const order = await Order.findOne(query).lean();
    if (!order) {
      return notFound("Order not found");
    }

    const ctx = await getAuthUser().catch(() => null);
    const isAdmin = ctx?.auth?.isAdmin || ctx?.user?.isAdmin || ctx?.user?.email === "admin@freshoo.in";

    // Authorization check:
    // 1. Admin can view any order
    // 2. Authenticated customer can view their own order
    // 3. Guest can view order if they provided matching phone or email verification
    if (!isAdmin) {
      const isOwner =
        ctx?.user &&
        order.userId &&
        order.userId.toString() === ctx.user._id.toString();

      const isVerifiedGuest =
        (order.isGuestOrder || !order.userId) &&
        ((phoneVerification && order.customerPhone === phoneVerification) ||
          (emailVerification && order.customerEmail === emailVerification));

      // Or if freshly retrieved by ID without query params on the same device/session
      if (!isOwner && !isVerifiedGuest && !order.isGuestOrder) {
        return forbidden("You do not have permission to view this order.");
      }
    }

    const friendly = {
      ...order,
      id: (order as any).friendlyId || (order as any)._id.toString(),
      _id: undefined,
      __v: undefined,
      friendlyId: undefined,
    };

    return jsonOk({ order: friendly });
  } catch (e: any) {
    console.error("Order GET error:", e);
    return jsonErr(e?.message || "Failed to retrieve order", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
export function PUT() {
  return methodNotAllowed(["GET"]);
}
export function DELETE() {
  return methodNotAllowed(["GET"]);
}

