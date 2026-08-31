import { Response, NextFunction } from "express";
import { forbiddenResponse } from "../utils/response";
import { AuthRequest } from "./auth";
import { UserRole } from "../types";

export const requireRole = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      forbiddenResponse(res, "Authentication required");
      return;
    }

    // FIXED: Safely check if user role exists in allowed roles
    if (!roles.includes(req.user.role as UserRole)) {
      forbiddenResponse(res, "Insufficient permissions");
      return;
    }

    next();
  };
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    forbiddenResponse(res, "Authentication required");
    return;
  }

  // FIXED: Check req.user.role instead of non-existent req.user.isAdmin
  if (req.user.role !== "ADMIN") {
    forbiddenResponse(res, "Admin access required");
    return;
  }

  next();
};
