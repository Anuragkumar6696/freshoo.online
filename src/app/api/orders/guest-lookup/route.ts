import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { jsonErr, jsonOk } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId")?.trim();
    const phone = searchParams.get("phone")?.trim();
    const email = searchParams.get("email")?.trim().toLowerCase();

    if (!orderId && !phone && !email) {
      return jsonErr("Please provide Order ID, phone number, or email to look up your order.", 400);
    }

    const query: any = {};

    if (orderId) {
      query.$or = [{ friendlyId: orderId }, { _id: orderId }];
    }

    if (phone) {
      query.$or = [
        ...(query.$or || []),
        { customerPhone: phone },
        { guestPhone: phone },
      ];
    }

    if (email) {
      query.$or = [
        ...(query.$or || []),
        { customerEmail: email },
        { guestEmail: email },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(20).lean().exec();

    const formatted = orders.map((o: any) => ({
      ...o,
      id: o.friendlyId || o._id.toString(),
      _id: undefined,
      __v: undefined,
      friendlyId: undefined,
    }));

    return jsonOk({ orders: formatted, count: formatted.length });
  } catch (e: any) {
    console.error("Guest lookup error:", e);
    return jsonErr(e?.message || "Failed to lookup orders", 500);
  }
}

