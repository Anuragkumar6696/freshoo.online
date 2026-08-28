import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import { successResponse, errorResponse } from "../../utils/response";

/**
 * POST /api/v1/upload
 * Accepts a single image file under field name "image".
 * Returns an absolute URL the frontend can use directly.
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.file) {
      return errorResponse(res, "No image file received. Use field name 'image'.", 400);
    }

    // Build absolute URL: prefer BACKEND_PUBLIC_URL, fall back to request host.
    const fromEnv = process.env.BACKEND_PUBLIC_URL;
    const origin =
      fromEnv && fromEnv.length > 0
        ? fromEnv.replace(/\/$/, "")
        : `${req.protocol}://${req.get("host") || "localhost:4000"}`;

    const url = `${origin}/uploads/${req.file.filename}`;

    console.log("[Upload] Saved file:", req.file.filename, "->", url);

    return successResponse(
      res,
      {
        url,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
      "Image uploaded successfully",
      201
    );
  } catch (err: any) {
    console.error("[Upload] Error:", err);
    return errorResponse(res, err?.message || "Image upload failed", 500);
  }
};
