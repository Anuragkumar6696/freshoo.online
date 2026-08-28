import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import User from "../../models/User";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";
import { AuthRequest } from "../../middleware/auth";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default-secret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "default-refresh";
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Generate OTP (6-digit code)
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register
export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return validationErrorResponse(res, { message: "All fields required" });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return errorResponse(res, "User already exists with this email or phone", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      passwordHash: hashedPassword,
      role: "CUSTOMER",
      isAdmin: false,
    });

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      JWT_ACCESS_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return successResponse(res, { user: user.toPublicJSON() }, "Registration successful", 201);
  } catch (err: any) {
    console.error("[Auth] Register error:", err);
    return errorResponse(res, "Registration failed", 500);
  }
};

// Login (Password or OTP)
export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { identifier, password, otp, method } = req.body;

    if (!identifier) {
      return validationErrorResponse(res, { message: "Email or phone required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    }).select("+passwordHash +otpCode +otpExpiresAt");

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    if (!user.isActive) {
      return errorResponse(res, "Account is deactivated", 403);
    }

    // Method 1: Password Login
    if (method === "password" || password) {
      if (!password) {
        return validationErrorResponse(res, { message: "Password required" });
      }

      if (!user.passwordHash) {
        return errorResponse(res, "Password login not available for this account", 400);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return errorResponse(res, "Invalid credentials", 401);
      }
    }
    // Method 2: OTP Login
    else if (method === "otp" || otp) {
      if (!otp) {
        return validationErrorResponse(res, { message: "OTP required" });
      }

      if (!user.otpCode || !user.otpExpiresAt) {
        return errorResponse(res, "No OTP found. Please request a new one.", 400);
      }

      if (new Date() > user.otpExpiresAt) {
        return errorResponse(res, "OTP has expired", 400);
      }

      if (user.otpCode !== otp) {
        return errorResponse(res, "Invalid OTP", 401);
      }

      // Clear OTP after successful verification
      user.otpCode = undefined;
      user.otpExpiresAt = undefined;
      user.otpVerified = true;
      await user.save();
    } else {
      return validationErrorResponse(res, { message: "Login method required" });
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
      },
      JWT_ACCESS_SECRET,
      { expiresIn: JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { userId: user._id.toString() },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(res, { user: user.toPublicJSON() }, "Login successful");
  } catch (err: any) {
    console.error("[Auth] Login error:", err);
    return errorResponse(res, "Login failed", 500);
  }
};

// Send OTP
export const sendOTP = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return validationErrorResponse(res, { message: "Email or phone required" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    user.otpVerified = false;
    await user.save();

    // TODO: Send OTP via SMS/Email using Brevo or Twilio
    console.log(`[OTP] Generated OTP for ${identifier}: ${otpCode}`);

    return successResponse(res, { expiresAt: otpExpiresAt }, "OTP sent successfully");
  } catch (err: any) {
    console.error("[Auth] Send OTP error:", err);
    return errorResponse(res, "Failed to send OTP", 500);
  }
};

// Get Current User (ME)
export const me = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, "Not authenticated", 401);
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    return successResponse(res, { user: user.toPublicJSON() });
  } catch (err: any) {
    console.error("[Auth] ME error:", err);
    return errorResponse(res, "Failed to fetch user", 500);
  }
};

// Logout
export const logout = async (req: Request, res: Response): Promise<Response> => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return successResponse(res, null, "Logout successful");
};
