import mongoose, { Schema, Document } from "mongoose";

export interface ICoupon extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  description: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount: number;
  isActive: boolean;
  usageLimit: number;
  usedCount: number;
  validFrom?: Date;
  validUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: "", trim: true },
    discountType: { type: String, enum: ["percent", "fixed"], required: true, default: "percent" },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true, index: true },
    usageLimit: { type: Number, default: 9999, min: 0 },
    usedCount: { type: Number, default: 0, min: 0 },
    validFrom: { type: Date },
    validUntil: { type: Date },
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
