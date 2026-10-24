import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { User } from "@/models/User";
import { forbidden, jsonErr, jsonOk } from "@/lib/response";
import { requireAdminUser } from "@/lib/withAuth";

export const dynamic = "force-dynamic";

export interface AggregatedCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  isRegistered: boolean;
  totalOrders: number;
  confirmedOrders: number;
  totalSpend: number;
  lastOrderDate: string;
  primaryAddress?: string;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser();
  } catch (e: any) {
    const s = e?.status || 401;
    return s === 403 ? forbidden() : jsonErr(e?.message || "Unauthorized", s);
  }

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase();
    const filterType = searchParams.get("type"); // "all", "registered", "guest"

    // 1. Fetch registered users
    const registeredUsers = await User.find().lean();
    const registeredMap = new Map<string, any>();
    registeredUsers.forEach((u: any) => {
      const email = u.email?.toLowerCase().trim();
      const phone = u.phone?.trim();
      const id = u._id.toString();
      registeredMap.set(id, { ...u, id });
      if (email) registeredMap.set(`email:${email}`, id);
      if (phone) registeredMap.set(`phone:${phone}`, id);
    });

    // 2. Fetch all orders to compute real metrics
    const orders = await Order.find().sort({ createdAt: -1 }).lean().exec();

    // Grouping by verified identity:
    // Registered orders link to userId. Guest orders link to customerPhone or customerEmail.
    const customerStats = new Map<string, AggregatedCustomer>();

    // Seed registered users first
    registeredUsers.forEach((u: any) => {
      const key = `user:${u._id.toString()}`;
      customerStats.set(key, {
        id: u._id.toString(),
        name: u.name || "Registered Customer",
        phone: u.phone || "—",
        email: u.email || "—",
        isRegistered: true,
        totalOrders: 0,
        confirmedOrders: 0,
        totalSpend: 0,
        lastOrderDate: "No orders yet",
        primaryAddress: u.addresses?.[0]?.addressLine || "—",
      });
    });

    // Aggregate orders
    orders.forEach((o: any) => {
      let key = "";
      let isReg = false;

      if (o.userId) {
        key = `user:${o.userId.toString()}`;
        isReg = true;
      } else {
        // Distinct guest identifier using phone or email
        const phone = o.customerPhone || o.guestPhone || "";
        const email = (o.customerEmail || o.guestEmail || "").toLowerCase();
        key = phone ? `guest:phone:${phone}` : email ? `guest:email:${email}` : `guest:order:${o.friendlyId || o._id}`;
      }

      let existing = customerStats.get(key);
      if (!existing) {
        existing = {
          id: key,
          name: o.customerName || "Guest Customer",
          phone: o.customerPhone || o.guestPhone || "—",
          email: o.customerEmail || o.guestEmail || "—",
          isRegistered: isReg,
          totalOrders: 0,
          confirmedOrders: 0,
          totalSpend: 0,
          lastOrderDate: o.date || new Date(o.createdAt).toLocaleDateString("en-IN"),
          primaryAddress: o.address ? `${o.address.addressLine}, ${o.address.city}` : "—",
        };
        customerStats.set(key, existing);
      }

      existing.totalOrders += 1;
      const isConfirmed =
        o.status === "Order Confirmed" ||
        o.status === "Delivered" ||
        o.paymentStatus === "Paid";
      if (isConfirmed) {
        existing.confirmedOrders += 1;
      }
      existing.totalSpend += Number(o.total) || 0;

      // Update name/phone if empty
      if (existing.name === "Guest Customer" && o.customerName) {
        existing.name = o.customerName;
      }
      if (existing.phone === "—" && (o.customerPhone || o.guestPhone)) {
        existing.phone = o.customerPhone || o.guestPhone;
      }
      if (existing.email === "—" && (o.customerEmail || o.guestEmail)) {
        existing.email = (o.customerEmail || o.guestEmail).toLowerCase();
      }
      if (existing.lastOrderDate === "No orders yet" && o.date) {
        existing.lastOrderDate = o.date;
      }
    });

    let customerList = Array.from(customerStats.values());

    // Apply type filter
    if (filterType === "registered") {
      customerList = customerList.filter((c) => c.isRegistered);
    } else if (filterType === "guest") {
      customerList = customerList.filter((c) => !c.isRegistered);
    }

    // Apply search filter
    if (search) {
      customerList = customerList.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          (c.primaryAddress && c.primaryAddress.toLowerCase().includes(search))
      );
    }

    // Sort by total orders and spend descending
    customerList.sort((a, b) => b.totalOrders - a.totalOrders || b.totalSpend - a.totalSpend);

    return jsonOk({
      customers: customerList,
      totalCount: customerList.length,
      registeredCount: customerList.filter((c) => c.isRegistered).length,
      guestCount: customerList.filter((c) => !c.isRegistered).length,
    });
  } catch (e: any) {
    console.error("Customers list API error:", e);
    return jsonErr(e?.message || "Failed to load customer list", 500);
  }
}

