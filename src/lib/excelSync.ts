import * as XLSX from "xlsx";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { connectDB } from "./db";
import { Order } from "@/models/Order";

export interface ExcelOrderRow {
  "Order ID": string;
  "Date & Time (IST)": string;
  "Customer Name": string;
  "Customer Phone": string;
  "Customer Email": string;
  "Customer Type": string;
  "Order Status": string;
  "Payment Method": string;
  "Payment Status": string;
  "Subtotal (₹)": number;
  "Discount (₹)": number;
  "Delivery Fee (₹)": number;
  "Total Amount (₹)": number;
  "Items Count": number;
  "Items Ordered (Catalogue Breakdown)": string;
  "Address Tag": string;
  "Delivery Address": string;
  "City": string;
  "Pincode": string;
  "GPS Latitude": number | string;
  "GPS Longitude": number | string;
  "GPS Accuracy": string;
  "Google Maps Live Navigation": string;
  "Google Maps Exact Pin": string;
  "Customer WhatsApp": string;
  "Special Instructions": string;
}

export function formatOrderForExcel(o: any): ExcelOrderRow {
  const friendlyId = o.friendlyId || o.id || (o._id ? o._id.toString() : "FRSH-000000");

  const rawDate = o.date || o.createdAt;
  const dateFormatted = rawDate
    ? new Date(rawDate).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  const custName = o.customerName || (o.guestDetails && o.guestDetails.name) || "Customer";
  const custPhone = o.customerPhone || o.guestPhone || (o.guestDetails && o.guestDetails.phone) || "";
  const custEmail = o.customerEmail || o.guestEmail || (o.guestDetails && o.guestDetails.email) || "";
  const isGuest = Boolean(o.isGuestOrder || (!o.userId && !o.user));

  const itemsList = Array.isArray(o.items) ? o.items : [];
  const itemsBreakdown = itemsList
    .map((it: any) => {
      const name = it.product?.name || it.name || "Meat Cut";
      const weight = it.selectedWeight || "500g";
      const qty = it.quantity || 1;
      const price = it.price || 0;
      return `${name} [${weight} × ${qty} = ₹${price * qty}]`;
    })
    .join(" | ");

  const addr = o.address || {};
  const geo = o.geoLocation || addr.geoLocation || null;
  const lat = geo?.latitude ?? "";
  const lng = geo?.longitude ?? "";
  const hasCoords = lat !== "" && lng !== "";

  const cleanPhone = String(custPhone).replace(/\D/g, "");
  const waLink = cleanPhone ? `https://wa.me/91${cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone}` : "";
  const mapsDir = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr.addressLine || ""}, ${addr.city || "Delhi"} ${addr.pincode || ""}`)}`;
  const mapsPin = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : mapsDir;

  return {
    "Order ID": friendlyId,
    "Date & Time (IST)": dateFormatted,
    "Customer Name": custName,
    "Customer Phone": custPhone,
    "Customer Email": custEmail,
    "Customer Type": isGuest ? "Guest" : "Registered",
    "Order Status": o.status || "Order Received",
    "Payment Method": String(o.paymentMethod || "COD").toUpperCase(),
    "Payment Status": String(o.paymentStatus || "Pending").toUpperCase(),
    "Subtotal (₹)": Number(o.subtotal || 0),
    "Discount (₹)": Number(o.discount || 0),
    "Delivery Fee (₹)": Number(o.deliveryFee || 0),
    "Total Amount (₹)": Number(o.total || 0),
    "Items Count": itemsList.length,
    "Items Ordered (Catalogue Breakdown)": itemsBreakdown || "No items",
    "Address Tag": addr.tag || "Home",
    "Delivery Address": addr.addressLine || "—",
    "City": addr.city || "Delhi",
    "Pincode": addr.pincode || "—",
    "GPS Latitude": lat,
    "GPS Longitude": lng,
    "GPS Accuracy": geo?.accuracy ? `±${Math.round(geo.accuracy)}m` : "—",
    "Google Maps Live Navigation": mapsDir,
    "Google Maps Exact Pin": mapsPin,
    "Customer WhatsApp": waLink,
    "Special Instructions": o.instructions || "None",
  };
}

export function buildOrdersWorkbook(orders: any[]): Buffer {
  const rows = orders.map(formatOrderForExcel);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Auto-fit column widths
  const colWidths: { wch: number }[] = [
    { wch: 14 }, // Order ID
    { wch: 22 }, // Date & Time
    { wch: 20 }, // Customer Name
    { wch: 15 }, // Phone
    { wch: 26 }, // Email
    { wch: 12 }, // Type
    { wch: 16 }, // Status
    { wch: 16 }, // Payment Method
    { wch: 16 }, // Payment Status
    { wch: 12 }, // Subtotal
    { wch: 12 }, // Discount
    { wch: 14 }, // Delivery Fee
    { wch: 16 }, // Total
    { wch: 12 }, // Items Count
    { wch: 45 }, // Items Breakdown
    { wch: 12 }, // Address Tag
    { wch: 35 }, // Address Line
    { wch: 14 }, // City
    { wch: 10 }, // Pincode
    { wch: 14 }, // Latitude
    { wch: 14 }, // Longitude
    { wch: 14 }, // Accuracy
    { wch: 40 }, // Navigation URL
    { wch: 40 }, // Pin URL
    { wch: 30 }, // WhatsApp
    { wch: 25 }, // Instructions
  ];
  ws["!cols"] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "Freshoo Orders");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

/**
 * Automatically syncs all orders from MongoDB into persistent Excel files on disk:
 * 1. public/reports/orders.xlsx
 * 2. public/reports/orders.csv
 * 3. data/orders-live.xlsx
 */
export async function syncAllOrdersToExcelDisk(): Promise<{ count: number; xlsxPath: string }> {
  try {
    await connectDB();
    const orders = await Order.find({}).sort({ createdAt: -1 }).lean().exec();

    const buffer = buildOrdersWorkbook(orders);

    const publicReportsDir = path.join(process.cwd(), "public", "reports");
    const dataDir = path.join(process.cwd(), "data");

    await mkdir(publicReportsDir, { recursive: true });
    await mkdir(dataDir, { recursive: true });

    const pubXlsx = path.join(publicReportsDir, "orders.xlsx");
    const dataXlsx = path.join(dataDir, "orders-live.xlsx");

    await writeFile(pubXlsx, buffer);
    await writeFile(dataXlsx, buffer);

    // Also write CSV version
    const rows = orders.map(formatOrderForExcel);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    const csvContent = XLSX.utils.sheet_to_csv(ws);
    await writeFile(path.join(publicReportsDir, "orders.csv"), "\uFEFF" + csvContent, "utf8");

    console.log(`[ExcelSync] Synced ${orders.length} orders to disk: ${pubXlsx}`);
    return { count: orders.length, xlsxPath: pubXlsx };
  } catch (err) {
    console.error("[ExcelSync] Failed to sync orders to Excel disk:", err);
    return { count: 0, xlsxPath: "" };
  }
}

