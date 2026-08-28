import { Response } from "express";
import { AuthRequest } from "../../middleware/auth";
import Product from "../../models/Product";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "../../utils/response";

// Generate slug from product name
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// GET /api/v1/products - List all products (Public)
export const listProducts = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { category, search, available } = req.query;

    const filter: any = {};
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === "true";

    let query = Product.find(filter);

    if (search && typeof search === "string") {
      query = query.or([
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]);
    }

    const products = await query.sort({ isBestSeller: -1, createdAt: -1 }).lean();

    return successResponse(res, { products });
  } catch (err: any) {
    console.error("[Products] List error:", err);
    return errorResponse(res, "Failed to fetch products", 500);
  }
};

// GET /api/v1/products/:id - Get single product (Public)
export const getProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).lean();
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, { product });
  } catch (err: any) {
    console.error("[Products] Get error:", err);
    return errorResponse(res, "Failed to fetch product", 500);
  }
};

// POST /api/v1/products - Create product (Admin only)
export const createProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const {
      name,
      category,
      description,
      image,
      rating,
      reviewsCount,
      freshnessBadge,
      isBestSeller,
      weights,
      stock,
      available,
      preparationTime,
    } = req.body;

    if (!name || !category || !description || !weights || weights.length === 0) {
      return validationErrorResponse(res, {
        message: "Missing required fields: name, category, description, weights",
      });
    }

    const slug = generateSlug(name);

    // Check for duplicate slug
    const existing = await Product.findOne({ slug });
    if (existing) {
      return errorResponse(res, "Product with similar name already exists", 409);
    }

    const product = await Product.create({
      name,
      slug,
      category,
      description,
      image,
      rating: rating ?? 4.5,
      reviewsCount: reviewsCount ?? 0,
      freshnessBadge: freshnessBadge || "Cut After Order",
      isBestSeller: !!isBestSeller,
      weights,
      stock: stock ?? 10,
      available: available !== false,
      preparationTime: preparationTime ?? 30,
    });

    return successResponse(res, { product: product.toJSON() }, "Product created successfully", 201);
  } catch (err: any) {
    console.error("[Products] Create error:", err);
    return errorResponse(res, "Failed to create product", 500);
  }
};

// PATCH /api/v1/products/:id - Update product (Admin only)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // If name is being updated, regenerate slug
    if (updates.name) {
      updates.slug = generateSlug(updates.name);

      // Check if new slug conflicts with another product
      const existing = await Product.findOne({ slug: updates.slug, _id: { $ne: id } });
      if (existing) {
        return errorResponse(res, "Product with similar name already exists", 409);
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, { product: product.toJSON() }, "Product updated successfully");
  } catch (err: any) {
    console.error("[Products] Update error:", err);
    return errorResponse(res, "Failed to update product", 500);
  }
};

// DELETE /api/v1/products/:id - Delete product (Admin only)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return errorResponse(res, "Product not found", 404);
    }

    return successResponse(res, null, "Product deleted successfully");
  } catch (err: any) {
    console.error("[Products] Delete error:", err);
    return errorResponse(res, "Failed to delete product", 500);
  }
};
