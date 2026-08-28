import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Coupon } from "@/models/Coupon";
import { jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const code = (body?.code || "").trim().toUpperCase();
    const subtotal = Number(body?.subtotal || 0);
    if (!code) return jsonErr("Please enter a coupon code");
    if (!subtotal || subtotal <= 0) return jsonErr("Cart is empty");
    await connectDB();

    const now = new Date();
    const coupon = await Coupon.findOne({
      code,
      isActive: true,
      $and: [
        {
          $or: [
            { validFrom: { $exists: false } },
            { validFrom: null },
            { validFrom: { $lte: now } },
          ],
        },
        {
          $or: [
            { validUntil: { $exists: false } },
            { validUntil: { $gte: now } },
            { validUntil: null },
          ],
        },
      ],
    });
    if (!coupon) return jsonErr("This coupon is invalid or expired.", 422);

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
      return jsonErr("This coupon has reached its usage limit.", 422);

    if (coupon.minOrderValue > 0 && subtotal < coupon.minOrderValue)
      return jsonErr(
        `Add ₹${coupon.minOrderValue - subtotal} more to apply this coupon.`,
        422
      );

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(coupon.discountValue, subtotal);
    }
    discount = Math.max(0, discount);

    return jsonOk({
      coupon: { code: coupon.code, discountPercent: coupon.discountType === "percent" ? coupon.discountValue : 0 },
      discount,
      minOrderValue: coupon.minOrderValue,
      description: coupon.description,
    });
  } catch (e: any) {
    return jsonErr(e?.message || "Coupon verification failed", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
