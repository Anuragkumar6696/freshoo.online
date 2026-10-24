import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { User } from "@/models/User";
import { jsonErr, jsonOk, methodNotAllowed, unauthorized } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return unauthorized("Not signed in");
    await connectDB();
    const id = auth.sub || (auth as any).userId || (auth as any).id;
    let user = id ? await User.findById(id).catch(() => null) : null;
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email.toLowerCase().trim() }).catch(() => null);
    }
    if (!user) return unauthorized("Account no longer exists");
    if (!user.isActive) return jsonErr("Account is deactivated", 403);
    return jsonOk({ user: user.toPublicJSON() });
  } catch (e: any) {
    console.error("auth/me error:", e);
    return jsonErr(e?.message || "Failed to load session", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return unauthorized("Not signed in");
    const body = await req.json();
    await connectDB();
    const id = auth.sub || (auth as any).userId || (auth as any).id;
    let user = id ? await User.findById(id).catch(() => null) : null;
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email.toLowerCase().trim() }).catch(() => null);
    }
    if (!user) return unauthorized("Account no longer exists");

    if (body.name?.trim()) user.name = body.name.trim();
    if (body.email?.trim()) user.email = body.email.trim().toLowerCase();
    if (body.phone?.trim()) user.phone = body.phone.trim();

    await user.save();
    return jsonOk({ user: user.toPublicJSON() });
  } catch (e: any) {
    console.error("auth/me PATCH error:", e);
    return jsonErr(e?.message || "Failed to update profile", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET", "PATCH"]);
}
export function PUT() {
  return methodNotAllowed(["GET", "PATCH"]);
}
export function DELETE() {
  return methodNotAllowed(["GET", "PATCH"]);
}
