import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { User } from "@/models/User";
import { jsonErr, jsonOk, methodNotAllowed, unauthorized } from "@/lib/response";

export async function GET(_req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return unauthorized("Not signed in");
    await connectDB();
    const user = await User.findById(auth.sub);
    if (!user) return unauthorized("Account no longer exists");
    if (!user.isActive) return jsonErr("Account is deactivated", 403);
    return jsonOk({ user: user.toPublicJSON() });
  } catch (e: any) {
    console.error("auth/me error:", e);
    return jsonErr(e?.message || "Failed to load session", 500);
  }
}

export function POST() {
  return methodNotAllowed(["GET"]);
}
export function PUT() {
  return methodNotAllowed(["GET"]);
}
export function DELETE() {
  return methodNotAllowed(["GET"]);
}
