import express from "express";
import { getUserAddresses, addUserAddress } from "./user.controller";
import { authenticate, optionalAuth } from "../../middleware/auth";

const router = express.Router();

router.get("/addresses", optionalAuth, getUserAddresses);
router.post("/addresses", authenticate, addUserAddress);

export default router;