import { NextRequest, NextResponse } from "next/server";
import { serializeLogoutCookie } from "@/lib/auth";
import { jsonOk, methodNotAllowed } from "@/lib/response";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json(
    { success: true, data: { message: "Signed out successfully" } },
    { status: 200 }
  );
  res.headers.set("Set-Cookie", serializeLogoutCookie());
  return res;
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
