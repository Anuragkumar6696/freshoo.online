import { NextRequest } from "next/server";
import { connectDB } from "./db";
import { User, IUser } from "@/models/User";
import {
  getAuthFromCookies,
  JwtPayloadShape,
  requireAuthFromCookies,
} from "./auth";

export interface AuthContext {
  auth: JwtPayloadShape;
  user: IUser;
}

export async function getAuthUser(): Promise<AuthContext | null> {
  const auth = await getAuthFromCookies();
  if (!auth) return null;
  try {
    await connectDB();
    const id = auth.sub || (auth as any).userId || (auth as any).id;
    let user = id ? await User.findById(id).catch(() => null) : null;
    if (!user && auth.email) {
      user = await User.findOne({ email: auth.email.toLowerCase().trim() }).catch(() => null);
    }
    if (!user || user.isActive === false) return null;
    return { auth, user };
  } catch {
    return null;
  }
}

export const MASTER_ADMIN_EMAILS = [
  "admin@freshoo.in",
  "freshoo.online@gmail.com",
  "officialanurag6696@gmail.com",
  "anuragkumarmait@gmail.com",
];

export async function requireAuthUser(): Promise<AuthContext> {
  const ctx = await getAuthUser();
  if (!ctx) {
    const err = new Error("Unauthorized — please sign in");
    (err as any).status = 401;
    throw err;
  }
  return ctx;
}

export async function requireAdminUser(): Promise<AuthContext> {
  const ctx = await requireAuthUser();
  const email = (ctx.user.email || ctx.auth.email || "").toLowerCase().trim();
  const hasAdminRole =
    ctx.auth.isAdmin ||
    ctx.user.isAdmin ||
    ctx.user.role === "ADMIN" ||
    ctx.auth.role === "ADMIN" ||
    MASTER_ADMIN_EMAILS.includes(email) ||
    email.endsWith("@freshoo.online") ||
    email.endsWith("@freshoo.in");

  if (!hasAdminRole) {
    const err = new Error("Forbidden — admin only");
    (err as any).status = 403;
    throw err;
  }
  return ctx;
}

export function getAuthFromHeaders(req: NextRequest): JwtPayloadShape | null {
  return requireAuthFromCookies(req.headers);
}

export function isAdmin(ctx: AuthContext | null): boolean {
  if (!ctx) return false;
  const email = (ctx.user.email || ctx.auth.email || "").toLowerCase().trim();
  return !!(
    ctx.auth.isAdmin ||
    ctx.user.isAdmin ||
    ctx.user.role === "ADMIN" ||
    ctx.auth.role === "ADMIN" ||
    MASTER_ADMIN_EMAILS.includes(email) ||
    email.endsWith("@freshoo.online") ||
    email.endsWith("@freshoo.in")
  );
}
