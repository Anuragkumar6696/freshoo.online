import express from "express";
import multer from "multer";
import path from "path";
import { uploadImage } from "./upload.controller";
import { authenticate } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/rbac";

const router = express.Router();

// Multer config — store in backend/uploads/
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.resolve(__dirname, "../../../uploads"));
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.floor(Math.random() * 999999999)}`;
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `product-${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|jfif/;
    const ext = allowed.test(path.extname(file.originalname).slice(1));
    const mime = allowed.test(file.mimetype);
    if (ext || mime) cb(null, true);
    else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  },
});

// POST /api/v1/upload — admin only, single field name "image"
router.post("/", authenticate, requireAdmin, upload.single("image"), uploadImage);

export default router;
