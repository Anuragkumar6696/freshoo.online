import mongoose, { Schema, Document } from "mongoose";

export interface ILocation extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  city: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    name: { type: String, required: true, unique: true, trim: true, index: true },
    city: { type: String, default: "Delhi", trim: true },
    isActive: { type: Boolean, default: true, index: true },
    sortOrder: { type: Number, default: 0, index: true },
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

LocationSchema.index({ name: 1 }, { unique: true });

export const Location =
  (mongoose.models.Location as mongoose.Model<ILocation>) ||
  mongoose.model<ILocation>("Location", LocationSchema);

export default Location;
