import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Franchise } from "@/models/Franchise";
import { forbidden, jsonErr, jsonOk, methodNotAllowed, notFound } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonErr("Invalid franchise ID");
    }

    const franchise = await Franchise.findById(id);
    if (!franchise) return notFound("Franchise not found");

    if (body.name !== undefined) franchise.name = body.name.trim();
    if (body.address !== undefined) franchise.address = body.address.trim();
    if (body.city !== undefined) franchise.city = body.city.trim();
    if (body.phone !== undefined) franchise.phone = body.phone.trim();
    if (body.email !== undefined) franchise.email = body.email.trim().toLowerCase();
    if (body.openingTime !== undefined) franchise.openingTime = body.openingTime.trim();
    if (body.closingTime !== undefined) franchise.closingTime = body.closingTime.trim();
    if (body.isActive !== undefined) franchise.isActive = Boolean(body.isActive);
    if (body.isTemporarilyClosed !== undefined)
      franchise.isTemporarilyClosed = Boolean(body.isTemporarilyClosed);

    if (body.coordinates) {
      if (
        typeof body.coordinates.latitude === "number" &&
        typeof body.coordinates.longitude === "number" &&
        !isNaN(body.coordinates.latitude) &&
        !isNaN(body.coordinates.longitude)
      ) {
        franchise.coordinates = {
          latitude: body.coordinates.latitude,
          longitude: body.coordinates.longitude,
        };
      }
    }

    if (body.deliveryRadiusKm !== undefined) {
      const r = Number(body.deliveryRadiusKm);
      if (!isNaN(r) && r > 0 && r <= 100) {
        franchise.deliveryRadiusKm = r;
      }
    }

    if (Array.isArray(body.holidays)) {
      franchise.holidays = body.holidays;
    }

    await franchise.save();

    return jsonOk({ franchise: franchise.toJSON() });
  } catch (e: any) {
    console.error("Franchise update error:", e);
    return jsonErr(e?.message || "Failed to update franchise", 500);
  }
}

// Soft delete / deactivate (preserves historical linkage for orders)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return jsonErr("Invalid franchise ID");
    }

    const franchise = await Franchise.findByIdAndUpdate(
      id,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!franchise) return notFound("Franchise not found");

    return jsonOk({ message: "Franchise deactivated successfully", franchise: franchise.toJSON() });
  } catch (e: any) {
    console.error("Franchise delete error:", e);
    return jsonErr(e?.message || "Failed to deactivate franchise", 500);
  }
}

export function GET() {
  return methodNotAllowed(["PATCH", "DELETE"]);
}
export function POST() {
  return methodNotAllowed(["PATCH", "DELETE"]);
}

