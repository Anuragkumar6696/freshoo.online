import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import {
  emailRegex,
  normalizeEmail,
  normalizePhone,
  phoneRegex,
  serializeAuthCookie,
  serializeLogoutCookie,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { User, IUser } from "@/models/User";
import { jsonErr, methodNotAllowed } from "@/lib/response";
import { sendLoginAlertEmail } from "@/lib/brevo";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const identifier = (body?.email || body?.phone || body?.identifier || "") as string;
    const password = (body?.password || "") as string;
    const method: "password" | "otp" = body?.method || "password";
    const otp: string = body?.otp || "";
    const isOTPFlow = method === "otp";

    if (!identifier)
      return jsonErr("Please provide your email or phone number.");

    await connectDB();

    let query: any = {};
    if (emailRegex.test(identifier)) {
      query.email = normalizeEmail(identifier);
    } else {
      const phone = normalizePhone(identifier);
      if (phoneRegex.test(phone)) query.phone = phone;
      else query.email = normalizeEmail(identifier);
    }

    const user: IUser | null = await User.findOne(query)
      .select("+passwordHash")
      .exec();

    if (isOTPFlow) {
      const demoOTP = "1234";
      if (otp !== demoOTP) {
        return jsonErr(
          "Invalid OTP. Use '1234' as demo OTP or switch to password login.",
          401
        );
      }
      if (!user) {
        return jsonErr(
          "No account with this phone. Please register first or use demo account (1234567890 / password).",
          401
        );
      }
    } else {
      if (!user || !user.passwordHash) {
        return jsonErr(
          "Invalid credentials. If you used OTP signup, try the OTP method.",
          401
        );
      }
      if (!(await verifyPassword(password, user.passwordHash))) {
        return jsonErr("Wrong password. Please try again.", 401);
      }
    }

    if (!user.isActive)
      return jsonErr("This account is currently deactivated.", 403);

    await User.updateOne(
      { _id: user._id },
      { $set: { lastLoginAt: new Date() } }
    );

    const token = signToken({
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      isAdmin: !!user.isAdmin,
    });

    // Non-blocking login alert (captures IP + User-Agent for security)
    void (async () => {
      try {
        const loginAt = new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        const ip =
          req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          req.headers.get("x-real-ip") ||
          undefined;
        const userAgent = req.headers.get("user-agent") || undefined;
        await sendLoginAlertEmail({
          name: user.name,
          email: user.email,
          ip,
          userAgent,
          loginAt,
        });
      } catch (e) {
        console.warn("[Brevo] login alert send failed:", e);
      }
    })();

    const res = NextResponse.json(
      {
        success: true,
        data: {
          user: user.toPublicJSON(),
          message: `Welcome back, ${user.name.split(" ")[0]}!`,
        },
      },
      { status: 200 }
    );
    res.headers.set("Set-Cookie", serializeAuthCookie(token));
    return res;
  } catch (e: any) {
    console.error("auth/login error:", e);
    return jsonErr(e?.message || "Login failed.", 500);
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
