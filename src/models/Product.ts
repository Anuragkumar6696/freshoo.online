import mongoose, { Schema, Document } from "mongoose";
import type { Product as ProductT } from "@/context/AppContext";

export interface IProductWeight {
  weight: string;
  price: number;
  originalPrice?: number;
}

export interface IProduct extends Document, Omit<ProductT, "id"> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const WeightSchema = new Schema<IProductWeight>(
  {
    weight: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, index: true },
    category: {
      type: String,
      required: true,
      enum: ["Chicken", "Mutton", "Fish", "Eggs"],
      index: true,
    },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    freshnessBadge: { type: String, default: "Cut After Order", trim: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    weights: { type: [WeightSchema], required: true, validate: (v: any) => Array.isArray(v) && v.length > 0 },
    stock: { type: Number, default: 10, min: 0 },
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

ProductSchema.index({ name: "text", description: "text", category: "text" });

export const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
