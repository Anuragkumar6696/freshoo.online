import mongoose, { Schema, Document } from "mongoose";

export interface IProductWeight {
  weight: string;
  price: number;
  originalPrice?: number;
}

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  category: "Chicken" | "Mutton" | "Fish" | "Eggs";
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  freshnessBadge: string;
  isBestSeller: boolean;
  weights: IProductWeight[];
  stock: number;
  available: boolean;
  preparationTime?: number; // in minutes
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
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Chicken", "Mutton", "Fish", "Eggs"],
      index: true,
    },
    description: { type: String, required: true, trim: true },
    image: { type: String, default: "/images/default-product.jpg", trim: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    freshnessBadge: { type: String, default: "Cut After Order", trim: true },
    isBestSeller: { type: Boolean, default: false, index: true },
    weights: {
      type: [WeightSchema],
      required: true,
      validate: (v: any) => Array.isArray(v) && v.length > 0,
    },
    stock: { type: Number, default: 10, min: 0 },
    available: { type: Boolean, default: true, index: true },
    preparationTime: { type: Number, default: 30 }, // minutes
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

ProductSchema.index({ name: "text", description: "text" });
ProductSchema.index({ category: 1, available: 1 });

export const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
