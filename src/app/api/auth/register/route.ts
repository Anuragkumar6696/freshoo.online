import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  emailRegex,
  hashPassword,
  normalizeEmail,
  normalizePhone,
  phoneRegex,
  serializeAuthCookie,
  signToken,
} from "@/lib/auth";
import { User } from "@/models/User";
import { jsonErr, jsonOk, methodNotAllowed } from "@/lib/response";
import { sendWelcomeEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawName: string = body?.name?.trim();
    const rawEmail: string = body?.email;
    const rawPhone: string = body?.phone ?? "";
    const rawPassword: string = body?.password ?? "";

    if (!rawName || rawName.length < 2)
      return jsonErr("Please enter your full name (min 2 characters).");
    if (!rawEmail || !emailRegex.test(rawEmail))
      return jsonErr("Please enter a valid email address.");
    const phone = normalizePhone(rawPhone);
    if (!phoneRegex.test(phone))
      return jsonErr("Please enter a valid 10-digit phone number.");
    if (!rawPassword || rawPassword.length < 6)
      return jsonErr("Password must be at least 6 characters long.");

    const email = normalizeEmail(rawEmail);

    await connectDB();

    const existingEmail = await User.findOne({ email }).select("_id email");
    if (existingEmail)
      return jsonErr("An account already exists with this email.", 409);

    const existingPhone = await User.findOne({ phone }).select("_id phone");
    if (existingPhone)
      return jsonErr("An account already exists with this phone number.", 409);

    const passwordHash = await hashPassword(rawPassword);

    const user = await User.create({
      name: rawName,
      email,
      phone,
      passwordHash,
      addresses: [],
      isAdmin: false,
      isActive: true,
      lastLoginAt: new Date(),
    });

    const token = signToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      isAdmin: !!user.isAdmin,
    });

    const cookie = serializeAuthCookie(token);
    const publicUser = user.toPublicJSON();

    // Non-blocking welcome email (don't fail registration if email service is down)
    void sendWelcomeEmail({
      name: user.name,
      email: user.email,
      phone: user.phone || undefined,
    }).catch((e) => console.warn("[Brevo] welcome email send failed:", e));

    const res = NextResponse.json(
      { success: true, data: { user: publicUser, message: "Welcome to Freshoo!" } },
      { status: 201 }
    );
    res.headers.set("Set-Cookie", cookie);
    return res;
  } catch (e: any) {
    console.error("auth/register error:", e);
    return jsonErr(e?.message || "Registration failed. Please try again.", 500);
  }
}

export function GET() {
  return methodNotAllowed(["POST"]);
}
export function PUT() {
  return methodNotAllowed(["POST"]);
}
export function DELETE() {
  return methodNotAllowed(["POST"]);
}
