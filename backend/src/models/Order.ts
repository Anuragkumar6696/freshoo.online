import mongoose, { Schema, Document } from "mongoose";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "PREPARING"
  | "READY_FOR_COLLECTION"
  | "COLLECTED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  friendlyId: string; // FRSH-XXXXXX
  userId?: mongoose.Types.ObjectId | null;
  customerName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  isGuestOrder: boolean;

  items: any[]; // CartItem snapshots
  subtotal: number;
  discount: number;
  deliveryFee: number;
  packagingFee: number;
  tax: number;
  total: number;

  address: any; // Address snapshot
  geoLocation?: any;

  paymentMethod: "COD" | "UPI" | "CARD" | "WALLET";
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

  status: OrderStatus;
  instructions?: string;
  adminNotes?: string;

  supplierId?: mongoose.Types.ObjectId;

  couponCode?: string;
  couponDiscount?: number;

  idempotencyKey: string;

  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    friendlyId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    customerName: { type: String, default: null, trim: true },
    customerEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: null, trim: true, index: true },
    guestEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    guestPhone: { type: String, default: null, trim: true, index: true },
    isGuestOrder: { type: Boolean, default: false, index: true },

    items: { type: Schema.Types.Mixed, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    packagingFee: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    address: { type: Schema.Types.Mixed, required: true },
    geoLocation: { type: Schema.Types.Mixed, default: null },

    paymentMethod: {
      type: String,
      required: true,
      enum: ["COD", "UPI", "CARD", "WALLET"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
      default: "PENDING",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "PROCESSING",
        "PREPARING",
        "READY_FOR_COLLECTION",
        "COLLECTED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "CANCELLED",
      ],
      default: "PENDING",
      index: true,
    },

    instructions: { type: String, default: null, trim: true },
    adminNotes: { type: String, default: null, trim: true },

    supplierId: { type: Schema.Types.ObjectId, ref: "Supplier", default: null },

    couponCode: { type: String, default: null, uppercase: true, trim: true },
    couponDiscount: { type: Number, default: 0, min: 0 },

    idempotencyKey: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r.friendlyId;
        r.date = r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString();
        // Normalize: fallback between customer and guest contact details
        r.customerEmail = r.customerEmail || r.guestEmail || null;
        r.customerPhone = r.customerPhone || r.guestPhone || null;
        delete r._id;
        delete r.__v;
        delete r.friendlyId;
        return r;
      },
    },
  }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ customerPhone: 1, createdAt: -1 });
OrderSchema.index({ guestEmail: 1, createdAt: -1 });
OrderSchema.index({ guestPhone: 1, createdAt: -1 });

export const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;