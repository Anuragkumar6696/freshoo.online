import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { jsonErr, jsonOk, unauthorized } from "@/lib/response";
import { getAuthUser, MASTER_ADMIN_EMAILS } from "@/lib/withAuth";
import type { Order as OrderT } from "@/context/AppContext";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const ctx = await getAuthUser();
    if (!ctx) return unauthorized();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(2000, Math.max(1, Number(searchParams.get("limit") || 1000)));
    const status = searchParams.get("status");

    await connectDB();

    const userEmail = (ctx.user.email || ctx.auth.email || "").toLowerCase().trim();
    const userPhone = ctx.user.phone?.trim();

    const isAdmin =
      !!ctx.auth.isAdmin ||
      !!ctx.user.isAdmin ||
      ctx.user.role === "ADMIN" ||
      (ctx.user as any).role === "admin" ||
      (ctx.auth as any).role === "ADMIN" ||
      MASTER_ADMIN_EMAILS.includes(userEmail) ||
      userEmail.endsWith("@freshoo.online") ||
      userEmail.endsWith("@freshoo.in");

    let q: any = {};
    if (isAdmin) {
      // Admin sees ALL orders in database
      if (status) q.status = status;
    } else {
      // Normal customer sees only their personal orders
      const orClauses: any[] = [{ userId: ctx.user._id }];
      if (userEmail) {
        orClauses.push({ customerEmail: userEmail });
        orClauses.push({ guestEmail: userEmail });
      }
      if (userPhone) {
        orClauses.push({ customerPhone: userPhone });
        orClauses.push({ guestPhone: userPhone });
      }
      q = { $or: orClauses };
      if (status) q.status = status;
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
      delete out.adminNotes;
      return out as OrderT;
    });

    const totalSpent = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);

    return jsonOk({
      orders,
      total: orders.length,
      totalSpent,
    });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load your orders", 500);
  }
}
