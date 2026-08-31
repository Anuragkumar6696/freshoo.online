import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import User from "../../models/User"; // Ensure you have a User model or adjust import
import { successResponse, errorResponse } from "../../utils/response";

// GET /api/v1/user/addresses
export const getUserAddresses = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    if (!req.user?.userId) {
      return successResponse(res, { addresses: [] });
    }

    const user = await User.findById(req.user.userId).select("addresses").lean();
    return successResponse(res, { addresses: user?.addresses || [] });
  } catch (err: any) {
    return errorResponse(res, "Failed to fetch addresses", 500);
  }
};

// POST /api/v1/user/addresses
export const addUserAddress = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { tag, addressLine, city, pincode } = req.body;

    if (!addressLine || !pincode) {
      return errorResponse(res, "Address line and pincode are required", 400);
    }

    const userId = req.user?.userId;
    if (!userId) {
      return errorResponse(res, "Authentication required to save addresses", 401);
    }

    const newAddress = {
      tag: tag || "Home",
      addressLine,
      city: city || "Bareilly",
      pincode,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { addresses: newAddress } },
      { new: true }
    ).select("addresses");

    return successResponse(
      res,
      { addresses: updatedUser?.addresses || [] },
      "Address added successfully",
      201
    );
  } catch (err: any) {
    return errorResponse(res, "Failed to save address", 500);
  }
};