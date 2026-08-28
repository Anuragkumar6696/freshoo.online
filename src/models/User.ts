import mongoose, { Schema, Document } from "mongoose";
import type { Address } from "@/context/AppContext";

export interface IAddress extends Omit<Address, "id"> {
  _id?: mongoose.Types.ObjectId;
  id?: string;
}

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  addresses: IAddress[];
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toPublicJSON: () => {
    id: string;
    name: string;
    email: string;
    phone: string;
    addresses: Address[];
    isAdmin: boolean;
    createdAt: string;
  };
}

const AddressSchema = new Schema<IAddress>(
  {
    tag: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: "Delhi", trim: true },
    pincode: { type: String, required: true, trim: true },
    geoLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      accuracy: { type: Number, default: null },
      addressLabel: { type: String, default: null, trim: true },
      capturedAt: { type: String, default: null, trim: true },
    },
  },
  { _id: true, timestamps: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, select: false },
    addresses: { type: [AddressSchema], default: [] },
    isAdmin: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id.toString();
        delete r._id;
        delete r.__v;
        delete r.passwordHash;
        return r;
      },
    },
  }
);

UserSchema.methods.toPublicJSON = function toPublicJSON() {
  const obj = this.toObject();
  return {
    id: obj._id.toString(),
    name: obj.name,
    email: obj.email,
    phone: obj.phone,
    addresses: (obj.addresses || []).map((a: any) => ({
      id: (a._id || a.id).toString(),
      tag: a.tag,
      addressLine: a.addressLine,
      city: a.city,
      pincode: a.pincode,
      geoLocation: a.geoLocation || null,
    })),
    isAdmin: !!obj.isAdmin,
    createdAt: obj.createdAt,
  };
};

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 });

export const User =
  (mongoose.models.User as mongoose.Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;
