import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { jsonErr, jsonOk } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    try {
      await requireAdminUser();
    } catch {
      // Allow authenticated admin; if auth fails, check bearer token or cookie
      return jsonErr("Unauthorized. Admin access required.", 401);
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonErr("No file provided", 400);
    }

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"];
    if (!allowedMimeTypes.includes(file.type)) {
      return jsonErr("Invalid file type. Only JPG, PNG, and WebP are allowed.", 400);
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      return jsonErr("File size exceeds 10MB limit.", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || (file.type === "image/png" ? ".png" : ".jpg");
    const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext.toLowerCase()) ? ext.toLowerCase() : ".jpg";
    const filename = `product-${Date.now()}-${Math.floor(Math.random() * 1000000)}${safeExt}`;
    const filePath = path.join(uploadsDir, filename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${filename}`;
    return jsonOk({ url: publicUrl, filename });
  } catch (error: any) {
    console.error("Upload error:", error);
    return jsonErr(error?.message || "File upload failed", 500);
  }
}

