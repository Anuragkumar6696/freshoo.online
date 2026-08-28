import express from "express";
import { register, login, sendOTP, logout, me } from "./auth.controller";
import { authenticate } from "../../middleware/auth";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/logout", logout);
router.get("/me", authenticate, me);

export default router;
