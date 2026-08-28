import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { Product } from "@/models/Product";
import { User } from "@/models/User";
import { Location } from "@/models/Location";
import { StoreSettings } from "@/models/StoreSettings";
import { Coupon } from "@/models/Coupon";
import { jsonErr, jsonOk, forbidden } from "@/lib/response";
import { getAuthUser } from "@/lib/withAuth";
import { getViewAnimationLayerInfo } from "framer-motion";

export const dynamic = "force-dynamic";

const SEED_PRODUCTS = [
  {
    name: "Fresh Chicken Breast (Boneless)",
    category: "Chicken",
    description:
      "Tender, skinless and boneless chicken breast cuts. Perfect for salads, grilling, and high-protein meals.",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    reviewsCount: 142,
    freshnessBadge: "Cut After Order",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 210, originalPrice: 240 },
      { weight: "1kg", price: 399, originalPrice: 480 },
    ],
    stock: 25,
  },
  {
    name: "Premium Curry Cut Chicken",
    category: "Chicken",
    description:
      "Bone-in chicken cut into small pieces perfect for traditional Indian chicken curries and gravies.",
    image:
      "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=800",
    rating: 4.7,
    reviewsCount: 215,
    freshnessBadge: "Hygienically Handled",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 160, originalPrice: 190 },
      { weight: "1kg", price: 299, originalPrice: 380 },
    ],
    stock: 40,
  },
  {
    name: "Fresh Mutton (Curry Cut)",
    category: "Mutton",
    description:
      "Premium bone-in goat meat cuts from shoulder and leg portions. Rich taste, tender, and juicy.",
    image:
      "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    reviewsCount: 88,
    freshnessBadge: "Premium Local Meat",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 390, originalPrice: 450 },
      { weight: "1kg", price: 749, originalPrice: 899 },
    ],
    stock: 15,
  },
  {
    name: "Fresh Rohu Fish (Steaks)",
    category: "Fish",
    description:
      "Freshwater Rohu fish cut into neat steaks. Cleaned, scaled and ready for frying or making curry.",
    image:
      "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=800",
    rating: 4.6,
    reviewsCount: 64,
    freshnessBadge: "Daily Catch",
    weights: [
      { weight: "500g", price: 220, originalPrice: 260 },
      { weight: "1kg", price: 410, originalPrice: 500 },
    ],
    stock: 18,
  },
  {
    name: "Organic Farm-Fresh Eggs",
    category: "Eggs",
    description:
      "High-protein brown eggs sourced directly from healthy, free-range local poultry farms.",
    image:
      "https://images.unsplash.com/photo-1516448424440-9dbca97779c1?auto=format&fit=crop&q=80&w=800",
    rating: 4.9,
    reviewsCount: 198,
    freshnessBadge: "Farm Sourced",
    isBestSeller: true,
    weights: [
      { weight: "6 Pcs", price: 55, originalPrice: 65 },
      { weight: "12 Pcs", price: 99, originalPrice: 120 },
      { weight: "30 Pcs", price: 230, originalPrice: 280 },
    ],
    stock: 50,
  },
  {
    name: "Tender Mutton Chops",
    category: "Mutton",
    description:
      "Juicy ribs/chops of premium goat meat. Perfect for pan searing, grilling, or rich masala chops.",
    image:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800",
    rating: 4.8,
    reviewsCount: 42,
    freshnessBadge: "100% Fresh Cut",
    weights: [{ weight: "500g", price: 420, originalPrice: 499 }],
    stock: 10,
  },
];

const SEED_LOCATIONS = [
  { name: "Rohini Sector 22, Delhi", city: "Delhi", sortOrder: 1 },
  { name: "Saket, Delhi", city: "Delhi", sortOrder: 2 },
  { name: "Rohini Sector 21, Delhi", city: "Delhi", sortOrder: 3 },
  { name: "Rohini Sector 24, Delhi", city: "Delhi", sortOrder: 4 },
  { name: "Pitampura, Delhi", city: "Delhi", sortOrder: 5 },
];

const SEED_COUPONS = [
  {
    code: "FRESH100",
    description: "15% off on orders ₹499 and above",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 499,
    maxDiscount: 150,
    isActive: true,
    usageLimit: 9999,
  },
  {
    code: "WELCOME20",
    description: "Flat 20% welcome discount for new users",
    discountType: "percent",
    discountValue: 20,
    minOrderValue: 0,
    maxDiscount: 200,
    isActive: true,
    usageLimit: 1,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const force = searchParams.get("force");

  let allowed = false;
  const ctx = await getAuthUser();
  if (ctx && (ctx.auth.isAdmin || ctx.user.isAdmin)) allowed = true;
  if (token && token === (process.env.SEED_TOKEN || "freshoo-seed-2025")) allowed = true;
  if (!allowed && process.env.NODE_ENV === "production")
    return forbidden();

  try {
    await connectDB();
    const result: any = {};

    // 1) Locations
    const locCount = await Location.countDocuments();
    if (locCount === 0 || force) {
      if (force) await Location.deleteMany({});
      await Location.insertMany(SEED_LOCATIONS);
      result.locations = `Inserted ${SEED_LOCATIONS.length} areas`;
    } else {
      result.locations = `Skipped (${locCount} existing)`;
    }

    // 2) Store Settings
    const settings = await StoreSettings.findOne({ singleton: "main" });
    if (!settings || force) {
      if (force) await StoreSettings.deleteMany({ singleton: "main" });
      await StoreSettings.create({ singleton: "main" });
      result.settings = "Upserted default store settings (2 PM – 2 AM)";
    } else {
      result.settings = "Already exists";
    }

    // 3) Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0 || force) {
      if (force) await Coupon.deleteMany({});
      await Coupon.insertMany(SEED_COUPONS);
      result.coupons = `Inserted ${SEED_COUPONS.length} coupons`;
    } else {
      result.coupons = `Skipped (${couponCount} existing)`;
    }

    // 4) Products
    const pCount = await Product.countDocuments();
    if (pCount === 0 || force) {
      if (force) await Product.deleteMany({});
      const created = await Product.insertMany(SEED_PRODUCTS);
      result.products = `Inserted ${created.length} products`;
    } else {
      result.products = `Skipped (${pCount} existing)`;
    }

    // 5) Demo Admin and User accounts
    const adminEmail = "admin@freshoo.in";
    const demoEmail = "user@freshoo.in";
    const accs: any = {};
    if (!(await User.countDocuments({ email: adminEmail })) || force) {
      if (force) await User.deleteOne({ email: adminEmail });
      await User.create({
        name: "Freshoo Admin",
        email: freshoo.online@gmail.com,
        phone: "9310593167",
        passwordHash: await hashPassword("Admin@123"),
        addresses: [
          {
            tag: "Store",
            addressLine: "Freshoo HQ, Pocket 22, Sector 22, Rohini",
            city: "Delhi",
            pincode: "110086",
          },
        ],
        isAdmin: true,
      });
      accs.admin = `Created admin@freshoo.in / Admin@123`;
    } else {
      accs.admin = "admin@freshoo.in already exists";
    }
    if (!(await User.countDocuments({ email: demoEmail })) || force) {
      if (force) await User.deleteOne({ email: demoEmail });
      await User.create({
        name: "Rohit Sharma",
        email: demoEmail,
        phone: "9876543210",
        passwordHash: await hashPassword("User@123"),
        addresses: [
          {
            tag: "Home",
            addressLine: "A-14/56, Pocket 22, Sector 22, Rohini",
            city: "Delhi",
            pincode: "110086",
          },
        ],
      });
      accs.user = `Created user@freshoo.in / User@123`;
    } else {
      accs.user = "user@freshoo.in already exists";
    }
    result.accounts = accs;

    result.tip =
      "Now login via AuthModal or start placing orders! Brevo notifications activate when you set BREVO_API_KEY + STORE_OWNER_EMAIL + BREVO_ORDER_NOTIFY_ENABLED=true in .env.local";
    result.mongoDB = (await import("@/lib/db")).mongoose.connection?.name || "(default)";

    return jsonOk(result);
  } catch (e: any) {
    console.error("seed error:", e);
    return jsonErr(e?.message || "Seed failed", 500);
  }
}

export function POST(req: NextRequest) {
  return GET(req);
}
