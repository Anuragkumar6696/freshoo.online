import mongoose, { Schema, Document } from "mongoose";
import type {
  Order as OrderT,
  GeoLocation,
  Address,
} from "@/context/AppContext";

export type PermittedOrderStatus = "Order Received" | "Order Confirmed";
export type OrderStatus =
  | "Order Received"
  | "Order Confirmed"
  | "Order Placed"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Order Received",
  "Order Confirmed",
  // Legacy backward-compat:
  "Order Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export interface IStatusHistory {
  status: string;
  timestamp: Date;
  updatedBy?: string;
  note?: string;
}

export interface IOrderFranchise {
  id?: mongoose.Types.ObjectId | null;
  name?: string | null;
  code?: string | null;
  distanceKm?: number | null;
}

export interface IOrder extends Document, Omit<OrderT, "id" | "_id" | "franchise"> {
  _id: mongoose.Types.ObjectId;
  friendlyId: string;
  userId?: mongoose.Types.ObjectId | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  geoLocation: GeoLocation | null;
  idempotencyKey?: string;
  statusHistory: IStatusHistory[];
  franchise?: IOrderFranchise | null;
  paymentStatus: string;
}

const GeoSchema = new Schema<GeoLocation>(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    addressLabel: { type: String, default: null, trim: true },
    capturedAt: { type: String, default: null, trim: true },
    pincode: { type: String, default: null, trim: true },
    locality: { type: String, default: null, trim: true },
    city: { type: String, default: null, trim: true },
    state: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const AddressSchema = new Schema<
  Omit<Address, "id"> & { _id?: mongoose.Types.ObjectId }
>(
  {
    tag: { type: String, default: "Home", trim: true },
    flatSociety: { type: String, default: "", trim: true },
    locality: { type: String, default: "", trim: true },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, default: "Delhi" },
    state: { type: String, default: "Delhi", trim: true },
    pincode: { type: String, required: true, trim: true },
    geoLocation: { type: GeoSchema, default: null },
  },
  { _id: true, strict: false }
);

const CartItemSchema = new Schema(
  {
    product: { type: Schema.Types.Mixed, required: true },
    selectedWeight: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true, strict: false }
);

const StatusHistorySchema = new Schema<IStatusHistory>(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: "system" },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const FranchiseSnapshotSchema = new Schema<IOrderFranchise>(
  {
    id: { type: Schema.Types.ObjectId, ref: "Franchise", default: null },
    name: { type: String, default: null },
    code: { type: String, default: null },
    distanceKm: { type: Number, default: null },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    friendlyId: { type: String, required: true, unique: true, index: true },
    date: { type: String, required: true, trim: true },
    items: { type: [CartItemSchema], required: true, default: [] },
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    discount: { type: Number, required: true, min: 0, default: 0 },
    total: { type: Number, required: true, min: 0, default: 0 },
    address: { type: AddressSchema, required: true },
    paymentMethod: {
      type: String,
      required: true,
      default: "cod",
      trim: true,
      index: true,
    },
    paymentStatus: {
      type: String,
      default: "Pending",
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Order Confirmed",
      index: true,
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: () => [
        {
          status: "Order Confirmed",
          timestamp: new Date(),
          updatedBy: "system",
          note: "Order placed and automatically confirmed",
        },
      ],
    },
    franchise: { type: FranchiseSnapshotSchema, default: null },
    geoLocation: { type: GeoSchema, default: null },
    customerEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: null, trim: true, index: true },
    customerName: { type: String, default: null, trim: true },
    isGuestOrder: { type: Boolean, default: false, index: true },
    instructions: { type: String, default: null, trim: true },
    adminNotes: { type: String, default: null, trim: true },
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
      default: () => `idemp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    guestEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    guestPhone: { type: String, default: null, trim: true, index: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r.friendlyId || (r._id && r._id.toString ? r._id.toString() : String(r._id));
        delete r.friendlyId;
        delete r._id;
        delete r.__v;
        if (r.address && r.address._id) {
          r.address.id = r.address._id.toString();
          delete r.address._id;
        }
        if (r.items) {
          r.items = (r.items || []).map((it: any) => ({
            ...it,
            id: it._id ? `${it.product?.id || "p"}-${it.selectedWeight}` : it.id,
          }));
        }
        return ret;
      },
    },
  }
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ customerEmail: 1, createdAt: -1 });
OrderSchema.index({ customerPhone: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ isGuestOrder: 1, createdAt: -1 });
OrderSchema.index({ "franchise.code": 1, createdAt: -1 });

export const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;