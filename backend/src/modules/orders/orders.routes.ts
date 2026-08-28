import express from "express";
import {
  createOrder,
  getUserOrders,
  listOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
} from "./orders.controller";
import { authenticate, optionalAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/rbac";

const router = express.Router();

// Public/User routes
router.post("/", optionalAuth, createOrder);
router.get("/user/orders", optionalAuth, getUserOrders);
router.get("/:id", authenticate, getOrder);
router.delete("/:id", authenticate, cancelOrder);

// Admin routes
router.get("/", authenticate, requireAdmin, listOrders);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);

export default router;
