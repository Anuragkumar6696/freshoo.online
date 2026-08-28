import multer from "multer";
import path from "path";
import fs from "fs";
import { errorResponse } from "../utils/response";

// Ensure uploads directory exists
const uploadsDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Use memory storage to store files in buffer for Cloudinary
const memoryStorage = multer.memoryStorage();

// Disk storage for local fallback
const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `product-${unique}${ext}`);
  },
});

// File filter - only accept images
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed."));
  }
};

// Choose storage: prefer memory (for Cloudinary), fallback to disk
const useCloudinary = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !String(process.env.CLOUDINARY_API_KEY).includes("your-actual")
);

console.log("[Multer] Storage mode:", useCloudinary ? "Cloudinary (memory)" : "Local (disk)");

export const upload = multer({
  storage: useCloudinary ? memoryStorage : diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export const getLocalUploadUrl = (filename: string): string => {
  return `/uploads/${filename}`;
};
