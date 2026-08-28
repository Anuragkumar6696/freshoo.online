import express from "express";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products.controller";
import { authenticate, optionalAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/rbac";

const router = express.Router();

// Public routes
router.get("/", optionalAuth, listProducts);
router.get("/:id", optionalAuth, getProduct);

// Admin-only routes
router.post("/", authenticate, requireAdmin, createProduct);
router.patch("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;
