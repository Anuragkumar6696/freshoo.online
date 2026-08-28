import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt?: Date;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["PERCENTAGE", "FIXED"],
    },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    expiresAt: { type: Date },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id.toString();
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

export const Coupon =
  (mongoose.models.Coupon as mongoose.Model<ICoupon>) ||
  mongoose.model<ICoupon>("Coupon", CouponSchema);

export default Coupon;
