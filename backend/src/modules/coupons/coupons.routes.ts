import express from "express";
import { verifyCoupon } from "./coupons.controller";

const router = express.Router();

router.post("/verify", verifyCoupon);

export default router;
