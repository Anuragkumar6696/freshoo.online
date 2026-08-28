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

    if (!roles.includes(req.user.role)) {
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

  if (!req.user.isAdmin) {
    forbiddenResponse(res, "Admin access required");
    return;
  }

  next();
};
