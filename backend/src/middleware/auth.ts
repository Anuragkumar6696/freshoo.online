import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { unauthorizedResponse } from "../utils/response";
import { JWTPayload } from "../types";
import User from "../models/User";

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || "default-secret";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log("[Auth] Cookies received:", Object.keys(req.cookies || {}));
    console.log("[Auth] Authorization header:", req.headers.authorization ? "present" : "missing");

    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("[Auth] No token found in request");
      unauthorizedResponse(res, "No authentication token provided");
      return;
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
    console.log("[Auth] Token verified for user:", decoded.userId, "Role:", decoded.role);
    // Replace this line:
    // req.user = decoded;

    // With this line-by-line update:
    const fullUser = await User.findById(decoded.userId).lean();
    if (!fullUser) {
      unauthorizedResponse(res, "User not found");
      return;
    }

    // Cast to JWTPayload or any:
  req.user = {
    ...decoded,
    ...fullUser,
    userId: fullUser._id.toString(),
  } as unknown as JWTPayload;
    next();
  } catch (err: any) {
    console.error("[Auth] Token verification failed:", err.message);
    if (err.name === "TokenExpiredError") {
      unauthorizedResponse(res, "Token expired");
      return;
    }
    unauthorizedResponse(res, "Invalid token");
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as JWTPayload;
      // Replace this inside optionalAuth:
// req.user = decoded;

// With this update:
const fullUser = await User.findById(decoded.userId).lean();
if (fullUser) {
  req.user = {
    ...decoded,
    ...fullUser,
    userId: fullUser._id.toString(),
  } as unknown as JWTPayload;
}
    }
  } catch (err) {
    // Silently fail for optional auth
  }
  next();
};
