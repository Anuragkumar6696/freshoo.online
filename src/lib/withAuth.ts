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
    const user = await User.findById(auth.sub);
    if (!user || !user.isActive) return null;
    return { auth, user };
  } catch {
    return null;
  }
}

export async function requireAuthUser(): Promise<AuthContext> {
  const ctx = await getAuthUser();
  if (!ctx) {
    const err = new Error("Unauthorized");
    (err as any).status = 401;
    throw err;
  }
  return ctx;
}

export async function requireAdminUser(): Promise<AuthContext> {
  const ctx = await requireAuthUser();
  if (!ctx.auth.isAdmin && !ctx.user.isAdmin) {
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
  return !!(ctx.auth.isAdmin || ctx.user.isAdmin);
}
