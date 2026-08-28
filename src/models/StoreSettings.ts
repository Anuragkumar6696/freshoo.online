import mongoose, { Schema, Document } from "mongoose";
import type { StoreSettings as StoreSettingsT } from "@/context/AppContext";

export interface IStoreSettings extends Document, StoreSettingsT {
  _id: mongoose.Types.ObjectId;
  singleton: "main";
  storeName: string;
  phone: string;
  email: string;
  address: string;
  minOrderAmount: number;
  freeDeliveryAbove: number;
  deliveryRadiusKm: number;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    singleton: { type: String, enum: ["main"], required: true, unique: true, default: "main" },
    openingTime: { type: String, required: true, default: "14:00" },
    closingTime: { type: String, required: true, default: "02:00" },
    isTemporarilyClosed: { type: Boolean, default: false },
    holidayMode: { type: Boolean, default: false },
    storeName: { type: String, default: "Freshoo", trim: true },
    phone: { type: String, default: "+919999999999", trim: true },
    email: { type: String, default: "admin@freshoo.in", lowercase: true, trim: true },
    address: { type: String, default: "Rohini Sector 22, Delhi", trim: true },
    minOrderAmount: { type: Number, default: 149, min: 0 },
    freeDeliveryAbove: { type: Number, default: 299, min: 0 },
    deliveryRadiusKm: { type: Number, default: 5, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id.toString();
        delete r._id;
        delete r.__v;
        delete r.singleton;
        return r;
      },
    },
  }
);

export const StoreSettings =
  (mongoose.models.StoreSettings as mongoose.Model<IStoreSettings>) ||
  mongoose.model<IStoreSettings>("StoreSettings", StoreSettingsSchema);

export default StoreSettings;
