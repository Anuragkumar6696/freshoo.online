import { NextRequest, NextResponse } from "next/server";
import { serializeLogoutCookie } from "@/lib/auth";
import { jsonOk, methodNotAllowed } from "@/lib/response";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest) {
  const res = NextResponse.json(
    { success: true, data: { message: "Signed out successfully" } },
    { status: 200 }
  );
  res.cookies.set("freshoo_auth", "", { maxAge: 0, path: "/" });
  res.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
  res.cookies.set("token", "", { maxAge: 0, path: "/" });
  res.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
  res.headers.set("Set-Cookie", serializeLogoutCookie());
  return res;
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
