import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Location } from "@/models/Location";
import { forbidden, jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";
import { getAuthUser, requireAdminUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    const list = await Location.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: 1 })
      .lean()
      .exec();
    const locations = list.map((l: any) => l.name as string);
    return jsonOk({ locations });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load locations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    return e?.status === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", e?.status || 401);
  }
  try {
    const body = await req.json();
    const name = (body?.name || "").trim();
    if (!name) return jsonErr("Location name is required");
    await connectDB();
    let doc = await Location.findOne({ name });
    if (!doc) {
      doc = await Location.create({ name, city: body.city || "Delhi", isActive: true });
    } else if (!doc.isActive) {
      doc.isActive = true;
      await doc.save();
    }
    const all = (await Location.find({ isActive: true }).sort({ sortOrder: 1 }).lean().exec()).map(
      (l: any) => l.name
    );
    return jsonOk({ location: doc ? (doc as any).toJSON() : null, locations: all }, { status: 201 });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to add location", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    return e?.status === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", e?.status || 401);
  }
  try {
    const body = await req.json().catch(() => ({}));
    const { searchParams } = new URL(req.url);
    const name = (body?.name || searchParams.get("name") || "").trim();
    if (!name) return jsonErr("Location name required");
    await connectDB();
    await Location.updateOne({ name }, { $set: { isActive: false } });
    const all = (await Location.find({ isActive: true }).sort({ sortOrder: 1 }).lean().exec()).map(
      (l: any) => l.name
    );
    return jsonOk({ locations: all });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to remove location", 500);
  }
}

export function PUT() {
  return methodNotAllowed(["GET", "POST", "DELETE"]);
}
