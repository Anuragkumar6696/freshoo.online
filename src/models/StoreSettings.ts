import mongoose, { Schema, Document } from "mongoose";

export interface IHoliday {
  date: string; // YYYY-MM-DD
  description?: string;
}

export interface IStoreSettings extends Document {
  _id: mongoose.Types.ObjectId;
  singleton: "main";
  storeName: string;
  phone: string;
  email: string;
  address: string;
  minOrderAmount: number;
  freeDeliveryAbove: number;
  deliveryRadiusKm: number;
  openingTime: string;
  closingTime: string;
  isTemporarilyClosed: boolean;
  holidayMode: boolean;
  holidays: IHoliday[];
  servingDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
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

const StoreSettingsSchema = new Schema<IStoreSettings>(
  {
    singleton: { type: String, enum: ["main"], required: true, unique: true, default: "main" },
    openingTime: { type: String, required: true, default: "07:00" },
    closingTime: { type: String, required: true, default: "23:00" },
    isTemporarilyClosed: { type: Boolean, default: false },
    holidayMode: { type: Boolean, default: false },
    holidays: { type: [HolidaySchema], default: [] },
    servingDays: {
      type: [String],
      default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    },
    storeName: { type: String, default: "Freshoo", trim: true },
    phone: { type: String, default: "+919310593167", trim: true },
    email: { type: String, default: "freshoo.online@gmail.com", lowercase: true, trim: true },
    address: { type: String, default: "Rohini Sector 22, Delhi", trim: true },
    minOrderAmount: { type: Number, default: 149, min: 0 },
    freeDeliveryAbove: { type: Number, default: 299, min: 0 },
    deliveryRadiusKm: { type: Number, default: 10, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const r = ret as any;
        r.id = r._id?.toString() || r.id;
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
