"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, CartItem, Order } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import {
  User,
  ShoppingBag,
  MapPin,
  Clock,
  History,
  TrendingUp,
  Heart,
  LogIn,
  Package,
  Navigation,
  Phone,
  Mail,
  Search,
  ShieldCheck,
  Copy,
  ChevronRight,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    reorderItems,
    addAddress,
    removeAddress,
    setUser,
    updateOrderStatus,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "orders" | "addresses" | "profile"
  >("orders");

  const [showAddressForm, setShowAddressForm] = useState(false);
  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [addressLine, setAddressLine] = useState("");
  const [city] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [formError, setFormError] = useState("");
  // Profile form state
const [profileName, setProfileName] = useState(user?.name || "");
const [profileEmail, setProfileEmail] = useState(user?.email || "");
const [profileSuccess, setProfileSuccess] = useState(false);

// Keep profile form synced when user logs in/out
useEffect(() => {
  if (user) {
    setProfileName(user.name || "");
    setProfileEmail(user.email || "");
  }
}, [user]);

const handleProfileSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (user) {
    setUser({ ...user, name: profileName, email: profileEmail });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  }
};

  const [authOpen, setAuthOpen] = useState(false);

  const [guestLookup, setGuestLookup] = useState({
    orderId: "",
    phone: "",
    email: "",
  });
  const [guestLookupError, setGuestLookupError] = useState("");
  const [guestLookupTried, setGuestLookupTried] = useState(false);

  const [statusUpdateId, setStatusUpdateId] = useState<string | null>(null);

  // Database persistent orders state
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

useEffect(() => {
  if (!user) return;

  const fetchUserOrders = async () => {
    setLoadingOrders(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";
      
      // Get the stored auth token
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

      const res = await fetch(`${baseUrl}/user/orders`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      const result = await res.json();

      if (res.ok) {
        // Extract the orders array from the backend response wrapper
        const ordersList = result.data?.orders || result.orders || [];
        setDbOrders(ordersList);
      } else {
        console.error("Order fetch failed:", result);
      }
    } catch (err) {
      console.error("Failed to fetch persistent orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  fetchUserOrders();
}, [user]);
  // Persistent Guest Lookup submit handler
  const handleGuestLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestLookupError("");

    const hasAny =
      guestLookup.orderId.trim() ||
      guestLookup.phone.trim() ||
      guestLookup.email.trim();

    if (!hasAny) {
      setGuestLookupError(
        "Please enter at least one field: Order ID, Phone, or Email."
      );
      return;
    }

    setLoadingOrders(true);
    try {
      const query = new URLSearchParams({
        orderId: guestLookup.orderId.trim(),
        phone: guestLookup.phone.trim(),
        email: guestLookup.email.trim(),
      }).toString();

      const res = await fetch(`/api/orders/guest-lookup?${query}`);
      const data = await res.json();

      if (res.ok) {
        setDbOrders(data.orders || []);
      } else {
        setGuestLookupError(data.message || "No orders found.");
      }
    } catch (err) {
      setGuestLookupError("Error connecting to database.");
    } finally {
      setLoadingOrders(false);
      setGuestLookupTried(true);
    }
  };

  const handleReorder = (items: CartItem[]) => {
    reorderItems(items);
    router.push("/cart");
  };

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!addressLine || !pincode) {
      setFormError("Please fill out all fields.");
      return;
    }
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setFormError("Please enter a valid 6-digit pincode.");
      return;
    }
    addAddress({ tag, addressLine, city, pincode });
    setAddressLine("");
    setPincode("");
    setShowAddressForm(false);
  };

  const handleLogout = () => {
    setUser(null);
    setDbOrders([]);
    router.push("/");
  };

  // Derived stats from persistent API data
  const displayOrders = dbOrders;
  const displayTotalSpent = useMemo(
    () => displayOrders.reduce((sum, o) => sum + o.total, 0),
    [displayOrders]
  );
  const displayTotalOrders = displayOrders.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">
            {user ? "My Account" : "Track Order"}
          </span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              {user ? "Customer Dashboard" : "Track Your Order"}
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 font-semibold">
              {user
                ? `Welcome back, ${user.name}. View your orders, saved addresses and profile details.`
                : "No account required. Lookup your guest orders using your Order ID, Phone or Email."}
            </p>
          </div>
          {!user && (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-red-700 text-xs font-extrabold text-white rounded-xl shadow-sm transition-colors"
            >
              <LogIn size={14} />
              Sign In / Register
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-red-200 text-xs font-extrabold text-gray-600 hover:text-brand-primary hover:bg-red-50/50 transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Guest lookup block when not signed in */}
        {!user && (
          <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 mb-8">
            <form onSubmit={handleGuestLookupSubmit} className="space-y-5">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl shrink-0">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="font-display font-extrabold text-sm text-gray-900">
                    Guest Order Lookup
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 font-semibold">
                    Enter your Order ID and/or the Phone / Email you used at checkout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="FRSH-XXXXXX"
                    value={guestLookup.orderId}
                    onChange={(e) =>
                      setGuestLookup((g) => ({ ...g, orderId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-red-50 outline-none transition-all text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number used at checkout"
                    value={guestLookup.phone}
                    onChange={(e) =>
                      setGuestLookup((g) => ({
                        ...g,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-red-50 outline-none transition-all text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Email used at checkout"
                    value={guestLookup.email}
                    onChange={(e) =>
                      setGuestLookup((g) => ({ ...g, email: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-red-50 outline-none transition-all text-xs font-bold"
                  />
                </div>
              </div>

              {guestLookupError && (
                <p className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 p-2.5 rounded-lg">
                  {guestLookupError}
                </p>
              )}

              <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={loadingOrders}
                  className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors uppercase tracking-wider disabled:opacity-50"
                >
                  <Search size={14} />
                  {loadingOrders ? "Searching..." : "Find My Order(s)"}
                </button>
                {guestLookupTried && displayOrders.length === 0 && !loadingOrders && (
                  <p className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-2 rounded-lg">
                    No orders matched this query yet. Double-check the details or place a fresh order.
                  </p>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT NAV when logged in */}
          {user && (
            <aside className="lg:col-span-3 space-y-4">
              <div className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex items-center gap-3">
                <div className="p-3 bg-red-50 text-brand-primary rounded-full shrink-0">
                  <User size={22} />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-extrabold text-sm text-gray-900 truncate">
                    {user?.name || "Guest User"}
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold truncate mt-0.5">
                    {user?.email || "No email linked"}
                  </p>
                </div>
              </div>

              <div className="border border-gray-100 rounded-2xl p-3 bg-white shadow-sm space-y-1 font-bold text-xs text-gray-700">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "orders"
                      ? "bg-red-50 text-brand-primary"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <History size={16} /> Order History
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "addresses"
                      ? "bg-red-50 text-brand-primary"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <MapPin size={16} /> Saved Addresses
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "profile"
                      ? "bg-red-50 text-brand-primary"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <User size={16} /> Profile Details
                </button>
                {user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left hover:bg-red-50/20 text-red-500 font-extrabold border-t border-gray-100"
                  >
                    ⚙️ Admin Control Panel
                  </Link>
                )}
              </div>
            </aside>
          )}

          {/* RIGHT MAIN PANEL */}
          <div className={user ? "lg:col-span-9 space-y-6" : "space-y-6 w-full"}>
            {/* SUMMARY STATS CARDS */}
            {(user || displayOrders.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {user ? "Total Orders" : "Orders Found"}
                    </p>
                    <p className="font-display font-black text-xl text-gray-900">
                      {displayTotalOrders}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Total Spending
                    </p>
                    <p className="font-display font-black text-xl text-gray-900">
                      ₹{displayTotalSpent}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      Favorite Cut
                    </p>
                    <p className="font-display font-black text-sm text-gray-900 truncate max-w-[140px]">
                      {displayOrders.length > 0 && displayOrders[0].items?.[0]
                        ? displayOrders[0].items[0].product.name.split(" ")[0]
                        : "Chicken"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <Heart size={20} />
                  </div>
                </div>
              </div>
            )}

            

{/* 1. ORDERS HISTORY TAB */}
{(!user || activeTab === "orders") && (
  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
    <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
      <History size={16} className="text-brand-primary" />
      {user ? "Your Order History" : "Order Details"}
    </h3>

    {loadingOrders ? (
      <div className="text-center py-12 text-gray-400">
        <p className="text-xs font-bold">Loading orders...</p>
      </div>
    ) : displayOrders.length > 0 ? (
      <div className="space-y-6">
        {displayOrders.map((order) => (
          <div
            key={order.id}
            className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3 font-bold text-xs text-gray-600">
              <div className="flex items-center gap-4 flex-wrap">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Order ID
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-gray-900 font-extrabold">
                      {order.id}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(order.id);
                      }}
                      title="Copy Order ID"
                      className="text-gray-400 hover:text-brand-primary transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Placed On
                  </span>
                  <p className="text-gray-900 mt-0.5">
                    {order.date}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Total Bill
                  </span>
                  <p className="text-brand-primary mt-0.5 font-extrabold">
                    ₹{order.total}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">
                    Customer
                  </span>
                  <p className="text-gray-900 mt-0.5">
                    {order.customerName ||
                      (order.isGuestOrder ? "Guest" : "User")}
                    {order.isGuestOrder && (
                      <span className="ml-2 inline-block px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 text-[9px] uppercase tracking-wider font-black">
                        Guest
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-brand-primary border border-red-100/50">
                  <Clock size={12} /> {order.status}
                </span>

                {user && (
                  <button
                    onClick={() => handleReorder(order.items)}
                    className="px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors"
                  >
                    One-Click Reorder
                  </button>
                )}

                {user && (
                  <>
                    {statusUpdateId === order.id ? (
                      <select
                        defaultValue={order.status}
                        onChange={(e) => {
                          updateOrderStatus(
                            order.id,
                            e.target.value as Order["status"]
                          );
                          setStatusUpdateId(null);
                        }}
                        onBlur={() => setStatusUpdateId(null)}
                        autoFocus
                        className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold bg-white text-gray-700"
                      >
                        <option>Order Placed</option>
                        <option>Preparing</option>
                        <option>Out for Delivery</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setStatusUpdateId(order.id)}
                        className="px-3 py-1.5 rounded-lg border border-gray-200 hover:border-brand-primary text-[10px] font-black text-gray-600 hover:text-brand-primary transition-colors"
                        title="Update order status (owner/demo)"
                      >
                        ⚙️ Update Status
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="md:col-span-2 divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2.5 first:pt-0 last:pb-0 text-xs font-semibold"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="text-gray-900 font-bold truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                        {item.selectedWeight} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-[11px] font-semibold bg-gray-50/40 rounded-xl p-4 border border-gray-100 h-fit">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={14}
                    className="text-brand-primary shrink-0 mt-0.5"
                  />
                  <div className="leading-relaxed">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-50 text-brand-primary">
                        {order.address.tag}
                      </span>
                      <span className="text-gray-500">Delivery To</span>
                    </div>
                    <p className="text-gray-800 font-bold mt-1">
                      {order.address.addressLine}, {order.address.city} - {order.address.pincode}
                    </p>
                  </div>
                </div>

                {(order.customerPhone || order.customerEmail) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-600">
                    {order.customerPhone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-gray-400" />
                        {order.customerPhone}
                      </span>
                    )}
                    {order.customerEmail && (
                      <span className="flex items-center gap-1">
                        <Mail size={12} className="text-gray-400" />
                        {order.customerEmail}
                      </span>
                    )}
                  </div>
                )}

                {order.geoLocation?.latitude !== null &&
                  order.geoLocation?.latitude !== undefined && (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700">
                      <Navigation size={14} className="shrink-0 mt-0.5" />
                      <div>
                        <p className="font-black">GPS coordinates recorded</p>
                        <p className="text-emerald-600 font-mono text-[10px] mt-0.5">
                          {order.geoLocation.latitude.toFixed(4)},{" "}
                          {order.geoLocation.longitude.toFixed(4)}
                          {order.geoLocation.accuracy
                            ? ` • ±${Math.round(order.geoLocation.accuracy)}m`
                            : ""}
                        </p>
                      </div>
                    </div>
                  )}

                {order.instructions && (
                  <p className="text-gray-600 italic bg-white border border-gray-100 rounded-lg p-2.5">
                    <span className="font-black text-gray-500 not-italic mr-1">
                      Instructions:
                    </span>
                    {order.instructions}
                  </p>
                )}

                <div className="flex items-center gap-2 text-gray-500">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <span className="font-black uppercase tracking-wider text-[10px]">
                    Payment: {order.paymentMethod?.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-400 space-y-3">
        <History size={32} className="mx-auto" />
        <p className="text-xs font-bold text-gray-500">
          {user
            ? "No order history found."
            : guestLookupTried
            ? "No matching orders were found. Check your details and try again."
            : "Enter your order details above to view status."}
        </p>
        <p className="text-[10px]">
          {user
            ? "Head over to the Shop page and place a fresh order cut!"
            : "Place an order from our shop and come back here to track it."}
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 mt-2 px-5 py-2.5 bg-brand-primary hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-sm transition-colors uppercase tracking-wider"
        >
          <Package size={13} />
          Browse Shop
        </Link>
      </div>
    )}
  </div>
)}

{/* 2. SAVED ADDRESSES TAB */}
{user && activeTab === "addresses" && (
  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
      <h3 className="font-display font-extrabold text-sm text-gray-900 flex items-center gap-2">
        <MapPin size={16} className="text-brand-primary" />
        Saved Delivery Addresses
      </h3>
      <button
        onClick={() => setShowAddressForm(!showAddressForm)}
        className="px-3.5 py-2 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors text-xs"
      >
        {showAddressForm ? "Cancel" : "+ Add New Address"}
      </button>
    </div>

    {/* Form to add address */}
    {showAddressForm && (
      <form onSubmit={handleAddAddressSubmit} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 space-y-4">
        <div className="flex gap-2">
          {(["Home", "Work", "Other"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors ${
                tag === t ? "bg-brand-primary text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Address Line (House No, Street, Landmark)"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            className="w-full sm:col-span-2 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-brand-primary outline-none"
          />
          <input
            type="text"
            value={city}
            disabled
            className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-bold text-gray-500 cursor-not-allowed"
          />
          <input
            type="text"
            placeholder="6-digit Pincode"
            value={pincode}
            maxLength={6}
            onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:border-brand-primary outline-none"
          />
        </div>

        {formError && <p className="text-red-500 font-bold text-[11px]">{formError}</p>}

        <button
          type="submit"
          className="w-full py-2.5 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors"
        >
          Save Address
        </button>
      </form>
    )}

    {/* Saved Address List */}
    {user.addresses && user.addresses.length > 0 ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {user.addresses.map((addr, idx) => (
          <div key={idx} className="border border-gray-100 rounded-xl p-4 bg-gray-50/30 flex flex-col justify-between">
            <div>
              <span className="inline-block px-2 py-0.5 bg-red-50 text-brand-primary rounded font-black text-[10px] uppercase mb-2">
                {addr.tag}
              </span>
              <p className="text-gray-900 font-bold">{addr.addressLine}</p>
              <p className="text-gray-500 text-[11px]">{addr.city} - {addr.pincode}</p>
            </div>
            <button
              onClick={() => removeAddress(idx)}
              className="mt-4 text-xs font-bold text-red-500 hover:underline self-start"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-400 font-bold text-center py-6">No saved addresses found.</p>
    )}
  </div>
)}

{/* 3. PROFILE DETAILS TAB */}
{user && activeTab === "profile" && (
  <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
    <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
      <User size={16} className="text-brand-primary" />
      Profile Details
    </h3>

    <div className="max-w-md space-y-4">
      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Full Name
        </label>
        <div className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900">
          {user.name || "Not provided"}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Email Address
        </label>
        <div className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900">
          {user.email || "Not provided"}
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
          Phone Number
        </label>
        <div className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900">
          {user.phone || "Not linked"}
        </div>
      </div>
    </div>
  </div>
)}
          </div>
        </div>
      </main>

      <Footer />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}