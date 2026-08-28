import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as cookieLib from "cookie";

function serializeCookie(name: string, value: string, options: any = {}): string {
  const libSer = (cookieLib as any).serialize || (cookieLib as any).serializeCookie;
  if (typeof libSer === "function") return libSer(name, value, options || {});
  const parts: string[] = [`${name}=${value}`];
  if (options?.httpOnly) parts.push("HttpOnly");
  if (options?.secure) parts.push("Secure");
  if (options?.sameSite) {
    const ss = String(options.sameSite);
    parts.push("SameSite=" + ss.charAt(0).toUpperCase() + ss.slice(1));
  }
  if (options?.path) parts.push("Path=" + options.path);
  if (options?.domain) parts.push("Domain=" + options.domain);
  if (options?.maxAge != null) parts.push("Max-Age=" + options.maxAge);
  if (options?.expires) {
    const d: any = options.expires;
    parts.push("Expires=" + (d && typeof d.toUTCString === "function" ? d.toUTCString() : String(d)));
  }
  return parts.join("; ");
}

function parseCookieHeader(header: string): Record<string, string> {
  const libParse = (cookieLib as any).parse || (cookieLib as any).parseCookie;
  if (typeof libParse === "function") return libParse(header || "");
  const out: Record<string, string> = {};
  if (!header) return out;
  String(header).split(";").forEach((pair) => {
    const [k, ...rest] = pair.split("=");
    const key = k.trim();
    if (!key) return;
    out[key] = rest.join("=").trim();
  });
  return out;
}

export const JWT_SECRET =
  process.env.JWT_SECRET ||
  "freshoo-super-secret-production-key-change-me-please-32plus-xxx";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";
export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "freshoo_auth";

export interface JwtPayloadShape {
  sub: string;
  email: string;
  phone?: string;
  name?: string;
  isAdmin?: boolean;
  iat?: number;
  exp?: number;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: JwtPayloadShape): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): JwtPayloadShape | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadShape;
    return decoded;
  } catch {
    return null;
  }
}

export function serializeAuthCookie(token: string, expiresDays = 30): string {
  const maxAge = expiresDays * 24 * 60 * 60;
  return serializeCookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
    ...(process.env.AUTH_COOKIE_DOMAIN
      ? { domain: process.env.AUTH_COOKIE_DOMAIN }
      : {}),
  });
}

export function serializeLogoutCookie(): string {
  return serializeCookie(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAuthFromCookies(): Promise<JwtPayloadShape | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuthFromCookies(
  headers: Headers
): JwtPayloadShape | null {
  const cookieHeader = headers.get("cookie") || "";
  const parsed = parseCookieHeader(cookieHeader);
  const token = parsed[AUTH_COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

export const phoneRegex = /^\d{10}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizePhone(raw: string): string {
  const digitsOnly = (raw || "").replace(/\D/g, "");
  if (digitsOnly.length === 12 && digitsOnly.startsWith("91"))
    return digitsOnly.slice(2);
  if (digitsOnly.length === 11 && digitsOnly.startsWith("0"))
    return digitsOnly.slice(1);
  return digitsOnly;
}

export function normalizeEmail(raw: string): string {
  return (raw || "").trim().toLowerCase();
}
