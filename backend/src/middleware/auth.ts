import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { unauthorizedResponse } from "../utils/response";
import { JWTPayload } from "../types";

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
    req.user = decoded;
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
      req.user = decoded;
    }
  } catch (err) {
    // Silently fail for optional auth
  }
  next();
};
