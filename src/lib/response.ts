import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(
    { success: true, data },
    { status: 200, ...init }
  );
}

export function jsonErr(
  message: string,
  status = 400,
  details?: Record<string, any>
): NextResponse {
  return NextResponse.json(
    { success: false, error: message, ...(details ? { details } : {}) },
    { status }
  );
}

export function methodNotAllowed(allowed: string[]): NextResponse {
  return jsonErr(`Method not allowed. Allowed: ${allowed.join(", ")}`, 405);
}

export function notFound(msg = "Resource not found"): NextResponse {
  return jsonErr(msg, 404);
}

export function unauthorized(msg = "Unauthorized — please sign in"): NextResponse {
  return jsonErr(msg, 401);
}

export function forbidden(msg = "Forbidden — insufficient privileges"): NextResponse {
  return jsonErr(msg, 403);
}
