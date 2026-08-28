import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { StoreSettings } from "@/models/StoreSettings";
import { forbidden, jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    await connectDB();
    let s = await StoreSettings.findOne({ singleton: "main" });
    if (!s) {
      s = await StoreSettings.create({ singleton: "main" });
    }
    return jsonOk({ settings: s.toJSON() as any });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to load settings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    return e?.status === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", e?.status || 401);
  }
  try {
    const body = await req.json();
    await connectDB();
    const s = await StoreSettings.findOneAndUpdate(
      { singleton: "main" },
      { $set: body },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return jsonOk({ settings: s.toJSON() });
  } catch (e: any) {
    return jsonErr(e?.message || "Failed to update settings", 500);
  }
}

export function PUT(req: NextRequest) {
  return PATCH(req);
}

export function POST() {
  return methodNotAllowed(["GET", "PATCH"]);
}
export function DELETE() {
  return methodNotAllowed(["GET", "PATCH"]);
}
