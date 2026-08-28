import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { jsonErr, jsonOk, unauthorized } from "@/lib/response";
import { getAuthUser } from "@/lib/withAuth";
import type { Order as OrderT } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();
    const { searchParams } = new URL(req.url);
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 100)));
    const status = searchParams.get("status");
    await connectDB();
    const q: any = { userId: ctx.user._id };
    if (status) q.status = status;
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
      delete out.adminNotes;
      return out as OrderT;
    });
    const totalSpent = orders.reduce((s, o) => s + o.total, 0);
    return jsonOk({
      orders,
      total: orders.length,
      totalSpent,
    });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load your orders", 500);
  }
}
