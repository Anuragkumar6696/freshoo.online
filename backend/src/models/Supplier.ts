import mongoose, { Schema, Document } from "mongoose";

export interface ISupplier extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  openingTime?: string;
  closingTime?: string;
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: String, required: true, trim: true },
    latitude: { type: Number },
    longitude: { type: Number },
    openingTime: { type: String, default: "06:00" },
    closingTime: { type: String, default: "22:00" },
    isActive: { type: Boolean, default: true, index: true },
    notes: { type: String, trim: true },
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

export const Supplier =
  (mongoose.models.Supplier as mongoose.Model<ISupplier>) ||
  mongoose.model<ISupplier>("Supplier", SupplierSchema);

export default Supplier;
