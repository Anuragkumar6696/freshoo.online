import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  code?: string;
}

export const successResponse = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data && { data }),
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  error: string,
  statusCode: number = 400,
  code?: string
): Response => {
  const response: ApiResponse = {
    success: false,
    error,
    ...(code && { code }),
  };
  return res.status(statusCode).json(response);
};

export const validationErrorResponse = (
  res: Response,
  errors: any
): Response => {
  return res.status(422).json({
    success: false,
    error: "Validation failed",
    code: "VALIDATION_ERROR",
    details: errors,
  });
};

export const unauthorizedResponse = (res: Response, message?: string): Response => {
  return errorResponse(
    res,
    message || "Unauthorized access",
    401,
    "UNAUTHORIZED"
  );
};

export const forbiddenResponse = (res: Response, message?: string): Response => {
  return errorResponse(
    res,
    message || "Forbidden access",
    403,
    "FORBIDDEN"
  );
};

export const notFoundResponse = (res: Response, message?: string): Response => {
  return errorResponse(
    res,
    message || "Resource not found",
    404,
    "NOT_FOUND"
  );
};
