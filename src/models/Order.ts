import mongoose, { Schema, Document } from "mongoose";
import type {
  Order as OrderT,
  CartItem,
  GeoLocation,
  Address,
} from "@/context/AppContext";

export type OrderStatus = OrderT["status"];

const ORDER_STATUSES: OrderStatus[] = [
  "Order Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export interface IOrder extends Document, Omit<OrderT, "id"> {
  _id: mongoose.Types.ObjectId;
  // Friendly public order id (FRSH-XXXXXX)
  friendlyId: string;
  // Linkage fields
  userId?: mongoose.Types.ObjectId | null;
  // Guest order lookup
  guestEmail?: string | null;
  guestPhone?: string | null;
  // Admin notes
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Soft geo duplicate of the address subdoc, also stored inside address.geoLocation for frontend compat
  geoLocation: GeoLocation | null;
}

const GeoSchema = new Schema<GeoLocation>(
  {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    accuracy: { type: Number, default: null },
    addressLabel: { type: String, default: null, trim: true },
    capturedAt: { type: String, default: null, trim: true },
  },
  { _id: false }
);

const AddressSchema = new Schema<
  Omit<Address, "id"> & { _id?: mongoose.Types.ObjectId }
>(
  {
    tag: { type: String, enum: ["Home", "Work", "Other"], default: "Home" },
    addressLine: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true, default: "Delhi" },
    pincode: { type: String, required: true, trim: true },
    geoLocation: { type: GeoSchema, default: null },
  },
  { _id: true }
);

const ProductSubSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Chicken", "Mutton", "Fish", "Eggs"],
    },
    description: { type: String, default: "", trim: true },
    image: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    freshnessBadge: { type: String, default: "", trim: true },
    isBestSeller: { type: Boolean, default: false },
    weights: { type: Schema.Types.Mixed, default: [] },
    stock: { type: Number, default: 0 },
  },
  { _id: false }
);

const CartItemSchema = new Schema<Omit<CartItem, "id"> & { _id?: any }>(
  {
    product: { type: ProductSubSchema, required: true },
    selectedWeight: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const OrderSchema = new Schema<IOrder>(
  {
    // Friendly order id (FRSH-XXXXXX)
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
      enum: ["cod", "upi", "card", "wallet"],
      index: true,
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Order Placed",
      index: true,
    },
    geoLocation: { type: GeoSchema, default: null },
    // Redundant customer fields for easier search / guest lookup + frontend compat
    customerEmail: { type: String, default: null, lowercase: true, trim: true, index: true },
    customerPhone: { type: String, default: null, trim: true, index: true },
    customerName: { type: String, default: null, trim: true },
    isGuestOrder: { type: Boolean, default: false, index: true },
    instructions: { type: String, default: null, trim: true },
    adminNotes: { type: String, default: null, trim: true },
    // Database linkage (null for guests)
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

export const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
