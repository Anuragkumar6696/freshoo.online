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

// 1. Fetch Logged-in / Guest User Orders
// This handles GET /api/v1/user/orders and GET /api/v1/orders/user
router.get("/", optionalAuth, getUserOrders);
router.get("/user", optionalAuth, getUserOrders);
router.get("/user-orders", optionalAuth, getUserOrders);

// 2. Fetch Admin Orders (Moved off of "/" so it won't intercept normal users)
router.get("/admin/all", authenticate, requireAdmin, listOrders);

// 3. Place Order
router.post("/", optionalAuth, createOrder);

// 4. Dynamic Parameter Routes (MUST remain at the bottom)
router.get("/:id", optionalAuth, getOrder);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);
router.delete("/:id", authenticate, cancelOrder);

export default router;