import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { forbidden, jsonErr } from "@/lib/response";
import { MASTER_ADMIN_EMAILS, requireAdminUser } from "@/lib/withAuth";
import { verifyToken } from "@/lib/auth";
import { buildOrdersWorkbook, formatOrderForExcel } from "@/lib/excelSync";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queryToken = searchParams.get("token");
  let isAuthorized = false;

  if (queryToken) {
    const verified = verifyToken(queryToken);
    if (
      verified &&
      (verified.isAdmin ||
        MASTER_ADMIN_EMAILS.includes((verified.email || "").toLowerCase()))
    ) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    try {
      await requireAdminUser();
      isAuthorized = true;
    } catch (e: any) {
      const host = req.headers.get("host") || "";
      const isDev = host.includes("localhost") || host.includes("127.0.0.1");
      if (!isDev) {
        const s = e?.status || 401;
        return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
      }
    }
  }

  try {
    await connectDB();
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const franchise = searchParams.get("franchise");
    const status = searchParams.get("status");
    const format = (searchParams.get("format") || "xlsx").toLowerCase(); // xlsx, csv, or json

    const query: any = {};
    if (status && status !== "ALL") query.status = status;
    if (franchise && franchise !== "ALL") query["franchise.code"] = franchise;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean().exec();

    if (format === "json") {
      return NextResponse.json({ orders, count: orders.length });
    }

    const todayStr = new Date().toISOString().split("T")[0];

    // If CSV requested
    if (format === "csv") {
      const rows = orders.map(formatOrderForExcel);
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(ws);
      const filename = `freshoo-orders-${todayStr}.csv`;
      return new NextResponse("\uFEFF" + csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    // Default: Microsoft Excel .xlsx
    const xlsxBuffer = buildOrdersWorkbook(orders);
    const filename = `freshoo-orders-${todayStr}.xlsx`;

    return new NextResponse(xlsxBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e: any) {
    console.error("Order report generation error:", e);
    return jsonErr(e?.message || "Failed to generate order report", 500);
  }
}

