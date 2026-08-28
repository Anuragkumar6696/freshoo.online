import { Request, Response } from "express";
import Coupon from "../../models/Coupon";
import { successResponse, errorResponse, validationErrorResponse } from "../../utils/response";

// POST /api/v1/coupons/verify - Verify and calculate discount
export const verifyCoupon = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { code, subtotal } = req.body;

    if (!code || subtotal === undefined) {
      return validationErrorResponse(res, { message: "Code and subtotal are required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return errorResponse(res, "Invalid or expired coupon code", 404);
    }

    if (subtotal < coupon.minOrderAmount) {
      return errorResponse(res, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}`, 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return errorResponse(res, "Coupon usage limit reached", 400);
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    return successResponse(res, {
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountType === "PERCENTAGE" ? coupon.discountValue : 0,
      },
      discount,
    });
  } catch (err: any) {
    console.error("[Coupons] Verify error:", err);
    return errorResponse(res, "Failed to verify coupon", 500);
  }
};
