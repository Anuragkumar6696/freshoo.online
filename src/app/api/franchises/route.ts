import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Franchise } from "@/models/Franchise";
import { forbidden, jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";
import { getAuthUser, requireAdminUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const count = await Franchise.countDocuments();
    if (count === 0) {
      await Franchise.create({
        name: "Rohini Sector 22 Hub (Main)",
        code: "ROHINI-22",
        address: "Pocket 4, Sector 22, Rohini, New Delhi",
        city: "Delhi",
        coordinates: {
          latitude: 28.7188,
          longitude: 77.0673,
        },
        phone: "+919310593167",
        email: "freshoo.online@gmail.com",
        deliveryRadiusKm: 10,
        isActive: true,
        openingTime: "07:00",
        closingTime: "23:00",
        isTemporarilyClosed: false,
        holidays: [],
      });
    }

    const ctx = await getAuthUser().catch(() => null);
    const isAdmin = ctx?.auth?.isAdmin || ctx?.user?.isAdmin || ctx?.user?.email === "admin@freshoo.in";

    const { searchParams } = new URL(req.url);
    const all = searchParams.get("all") === "true";

    const filter: any = {};
    if (!isAdmin || !all) {
      filter.isActive = true;
    }

    const franchises = await Franchise.find(filter).sort({ createdAt: -1 }).lean();

    const formatted = franchises.map((f: any) => ({
      ...f,
      id: f._id.toString(),
      _id: undefined,
      __v: undefined,
    }));

    return jsonOk({ franchises: formatted, total: formatted.length });
  } catch (e: any) {
    console.error("Franchises GET error:", e);
    return jsonErr(e?.message || "Failed to load franchises", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      code,
      address,
      city = "Delhi",
      coordinates,
      phone = "+919310593167",
      email = "freshoo.online@gmail.com",
      deliveryRadiusKm = 10,
      openingTime = "07:00",
      closingTime = "23:00",
      isActive = true,
      isTemporarilyClosed = false,
      holidays = [],
    } = body;

    if (!name?.trim()) return jsonErr("Franchise name is required.");
    if (!code?.trim()) return jsonErr("Franchise code is required.");
    if (!address?.trim()) return jsonErr("Franchise address is required.");
    if (
      !coordinates ||
      typeof coordinates.latitude !== "number" ||
      typeof coordinates.longitude !== "number" ||
      isNaN(coordinates.latitude) ||
      isNaN(coordinates.longitude)
    ) {
      return jsonErr("Valid latitude and longitude are required.");
    }

    const radius = Number(deliveryRadiusKm);
    if (isNaN(radius) || radius <= 0 || radius > 100) {
      return jsonErr("Delivery radius must be between 1 and 100 km.");
    }

    const existing = await Franchise.findOne({
      code: code.trim().toUpperCase(),
    });
    if (existing) {
      return jsonErr(`Franchise code '${code.toUpperCase()}' already exists.`);
    }

    const franchise = await Franchise.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      address: address.trim(),
      city: city.trim(),
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      deliveryRadiusKm: radius,
      openingTime: openingTime.trim(),
      closingTime: closingTime.trim(),
      isActive: Boolean(isActive),
      isTemporarilyClosed: Boolean(isTemporarilyClosed),
      holidays: Array.isArray(holidays) ? holidays : [],
    });

    return jsonOk({ franchise: franchise.toJSON() }, { status: 201 });
  } catch (e: any) {
    console.error("Franchise create error:", e);
    return jsonErr(e?.message || "Failed to create franchise", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST"]);
}
export function DELETE() {
  return methodNotAllowed(["GET", "POST"]);
}

