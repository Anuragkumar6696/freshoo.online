import mongoose, { Schema, Document } from "mongoose";

export interface IHoliday {
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface IFranchise extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  deliveryRadiusKm: number;
  isActive: boolean;
  openingTime: string; // "HH:mm" 24h
  closingTime: string; // "HH:mm" 24h
  isTemporarilyClosed: boolean;
  holidays: IHoliday[];
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    date: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const FranchiseSchema = new Schema<IFranchise>(
  {
    name: { type: String, required: true, trim: true, index: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, default: "Delhi", trim: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    phone: { type: String, default: "+919310593167", trim: true },
    email: { type: String, default: "freshoo.online@gmail.com", lowercase: true, trim: true },
    deliveryRadiusKm: { type: Number, default: 10, min: 0.5, max: 100 },
    isActive: { type: Boolean, default: true, index: true },
    openingTime: { type: String, default: "07:00", trim: true },
    closingTime: { type: String, default: "23:00", trim: true },
    isTemporarilyClosed: { type: Boolean, default: false },
    holidays: { type: [HolidaySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id?.toString() || r.id;
        delete r._id;
        delete r.__v;
        return r;
      },
    },
  }
);

export const Franchise =
  (mongoose.models.Franchise as mongoose.Model<IFranchise>) ||
  mongoose.model<IFranchise>("Franchise", FranchiseSchema);

export default Franchise;

