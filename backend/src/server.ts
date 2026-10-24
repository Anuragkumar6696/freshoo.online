import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import path from "path";

// Load environment variables immediately before application imports
const envPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: envPath });

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import { rateLimit } from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db";
import { seedAdminUser } from "./utils/seedAdmin";
import authRoutes from "./modules/auth/auth.routes";
import uploadRoutes from "./modules/upload/upload.routes";
import productsRoutes from "./modules/products/products.routes";
import ordersRoutes from "./modules/orders/orders.routes";
import couponsRoutes from "./modules/coupons/coupons.routes";
import userRoutes from "./modules/user/user.route"; // Import new user routes

console.log("[Server] Loading .env from:", envPath);
console.log("[Server] Cloudinary config check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key_set: !!process.env.CLOUDINARY_API_KEY,
  api_secret_set: !!process.env.CLOUDINARY_API_SECRET,
});

const app: Express = express();
const httpServer = http.createServer(app);

// 1. Security & Performance Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "http://localhost:4000", "https://res.cloudinary.com", "https://images.unsplash.com", "https://plus.unsplash.com", "https://images.pexels.com", "https://cdn.pixabay.com"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", "https:", "data:"],
        formAction: ["'self'"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        scriptSrcAttr: ["'none'"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(compression());
app.use(morgan("dev")); // Logger

// 2. Rate Limiting
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api/", limiter);

// 3. Socket.IO Setup
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`[Socket] User disconnected`));
});

// Static uploads folder
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

// 4. API Routes
app.get("/api/v1/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Freshoo API is healthy" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/upload", uploadRoutes);
app.use("/api/v1/products", productsRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/coupons", couponsRoutes);

// Correctly mount user routes (handles POST & GET /api/v1/user/addresses)
app.use("/api/v1/user", userRoutes);

// Correctly mount user orders (handles GET /api/v1/user/orders)
app.use("/api/v1/user/orders", ordersRoutes);

// Locations, settings, and franchises compatibility routes
app.get("/api/v1/locations", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    locations: [
      "Rohini Sector 22",
      "Rohini Sector 21",
      "Rohini Sector 23",
      "Rohini Sector 24",
      "Rohini Sector 25",
      "Pitampura",
      "Prashant Vihar",
      "Paschim Vihar",
      "Janakpuri",
      "Dwarka",
    ],
  });
});

app.get("/api/v1/settings", async (_req: Request, res: Response) => {
  try {
    const mongoose = require("mongoose");
    const s = await mongoose.connection.collection("storesettings").findOne({ singleton: "main" });
    if (s) {
      return res.status(200).json({ success: true, settings: s });
    }
  } catch {}
  res.status(200).json({
    success: true,
    settings: {
      storeName: "Freshoo",
      openingTime: "07:00",
      closingTime: "23:00",
      isTemporarilyClosed: false,
      holidayMode: false,
      holidays: [],
    },
  });
});

app.patch("/api/v1/settings", async (req: Request, res: Response) => {
  try {
    const mongoose = require("mongoose");
    const body = req.body;
    await mongoose.connection.collection("storesettings").updateOne(
      { singleton: "main" },
      { $set: { ...body, updatedAt: new Date() } },
      { upsert: true }
    );
    const updated = await mongoose.connection.collection("storesettings").findOne({ singleton: "main" });
    return res.status(200).json({ success: true, settings: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || "Failed to update settings" });
  }
});

app.get("/api/v1/franchises", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: [
      {
        id: "rohini-22",
        name: "Rohini Sector 22 Hub (Main)",
        code: "ROHINI-22",
        address: "Pocket 4, Sector 22, Rohini, New Delhi",
        city: "Delhi",
        coordinates: { latitude: 28.7188, longitude: 77.0673 },
        phone: "+919310593167",
        email: "freshoo.online@gmail.com",
        deliveryRadiusKm: 15,
        isActive: true,
        openingTime: "07:00",
        closingTime: "23:00",
        isTemporarilyClosed: false,
      },
    ],
  });
});
// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found" });
});

// 5. Error Handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: "Something went wrong!" });
});

// 6. Database and Startup
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();
    httpServer.listen(PORT, () => {
      console.log(`[Server] Freshoo backend running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("[Server] Could not connect to DB:", err);
    process.exit(1);
  }
};

startServer();
