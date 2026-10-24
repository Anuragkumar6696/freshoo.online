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
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    reorderItems,
    addAddress,
    removeAddress,
    setUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "orders" | "addresses" | "profile" | "track"
  >("orders");

  // Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [addressLine, setAddressLine] = useState("");
  const [city] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [formError, setFormError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState(false);

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || "");
  const [profileEmail, setProfileEmail] = useState(user?.email || "");
  const [profilePhone, setProfilePhone] = useState(user?.phone || "");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Auth modal state
  const [authOpen, setAuthOpen] = useState(false);

  // Guest Order Lookup state
  const [guestLookup, setGuestLookup] = useState({
    orderId: "",
    phone: "",
    email: "",
  });
  const [guestLookupError, setGuestLookupError] = useState("");
  const [guestLookupTried, setGuestLookupTried] = useState(false);

  // Orders state
  const [dbOrders, setDbOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Sync profile state when user updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfilePhone(user.phone || "");
    }
  }, [user]);

  // Fetch orders for logged in user
  useEffect(() => {
    if (!user) return;

    const fetchUserOrders = async () => {
      setLoadingOrders(true);
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("freshoo_token") : null;
        const res = await fetch("/api/user/orders", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          credentials: "include",
        });

        if (res.ok) {
          const result = await res.json();
          const ordersList = result.data?.orders || result.orders || [];
          setDbOrders(ordersList);
        } else {
          // If unauthorized or failed, fallback to empty list without console noise
          setDbOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchUserOrders();
  }, [user]);

  // Handle Profile Update (PATCH /api/auth/me)
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSaving(true);
    setProfileError("");
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          email: profileEmail.trim(),
          phone: profilePhone.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.data?.user) {
        setUser(data.data.user);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 4000);
      } else {
        setProfileError(data.error || "Failed to update profile");
      }
    } catch (err: any) {
      setProfileError(err?.message || "Failed to connect to server");
    } finally {
      setProfileSaving(false);
    }
  };

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
        "Please enter your Order ID, Phone number, or Email."
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
        setDbOrders(data.data?.orders || data.orders || []);
      } else {
        setGuestLookupError(data.error || data.message || "No orders found.");
      }
    } catch {
      setGuestLookupError("Error connecting to server. Please try again.");
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
      setFormError("Please fill out all address fields.");
      return;
    }
    if (pincode.length !== 6 || isNaN(Number(pincode))) {
      setFormError("Please enter a valid 6-digit Delhi pincode.");
      return;
    }
    addAddress({ tag, addressLine, city, pincode });
    setAddressLine("");
    setPincode("");
    setShowAddressForm(false);
    setAddressSuccess(true);
    setTimeout(() => setAddressSuccess(false), 3000);
  };

  const handleLogout = () => {
    setUser(null);
    setDbOrders([]);
    router.push("/");
  };

  const handleCopy = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayOrders = dbOrders;
  const displayTotalSpent = useMemo(
    () => displayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    [displayOrders]
  );
  const displayTotalOrders = displayOrders.length;

  return (
    <div className="min-h-screen flex flex-col bg-white w-full max-w-full overflow-x-hidden">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 font-semibold text-xs text-stone-400">
          <Link href="/" className="hover:text-brand-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-stone-700 font-bold">
            {user ? "Customer Dashboard" : "Track Order"}
          </span>
        </div>

        {/* Dashboard Header Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-stone-900">
              {user ? "Customer Dashboard" : "Track Order Status"}
            </h1>
            <p className="text-xs text-stone-500 mt-1 font-medium">
              {user
                ? `Welcome back, ${user.name}! Manage your orders, saved addresses, and profile.`
                : "Look up your orders without an account using your Order ID, Phone number, or Email."}
            </p>
          </div>
          {!user && (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-primary hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
            >
              <LogIn size={15} /> Sign In / Register
            </button>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-stone-200 hover:border-red-200 text-xs font-bold text-stone-600 hover:text-brand-primary hover:bg-red-50 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Guest Lookup Box (Shown when not logged in or on Track tab) */}
        {!user && (
          <div className="border border-stone-200 rounded-2xl bg-stone-50/50 p-6 mb-8 shadow-xs">
            <form onSubmit={handleGuestLookupSubmit} className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-red-100 text-brand-primary rounded-xl shrink-0">
                  <Search size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-stone-900">
                    Find Your Order
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Enter your Order ID (e.g. FRSH-XXXXXX) or the phone/email you gave during checkout.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="FRSH-XXXXXX"
                    value={guestLookup.orderId}
                    onChange={(e) =>
                      setGuestLookup((g) => ({ ...g, orderId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:border-brand-primary outline-none text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={guestLookup.phone}
                    onChange={(e) =>
                      setGuestLookup((g) => ({
                        ...g,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      }))
                    }
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:border-brand-primary outline-none text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={guestLookup.email}
                    onChange={(e) =>
                      setGuestLookup((g) => ({ ...g, email: e.target.value }))
                    }
                    className="w-full px-3.5 py-2 bg-white border border-stone-200 rounded-xl focus:border-brand-primary outline-none text-xs font-bold"
                  />
                </div>
              </div>

              {guestLookupError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                  {guestLookupError}
                </p>
              )}

              <button
                type="submit"
                disabled={loadingOrders}
                className="px-6 py-2.5 bg-brand-primary hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search size={14} />
                {loadingOrders ? "Searching..." : "Track Order"}
              </button>
            </form>
          </div>
        )}

        <div className={user ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" : "w-full max-w-4xl mx-auto space-y-6"}>
          {/* SIDEBAR TABS (For Logged in Users) */}
          {user && (
            <aside className="lg:col-span-3 space-y-4">
              <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-1 font-bold text-xs">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === "orders"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "hover:bg-white text-stone-700"
                  }`}
                >
                  <History size={16} /> Order History
                  {displayOrders.length > 0 && (
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white/20 text-white" : "bg-stone-200 text-stone-700"}`}>
                      {displayOrders.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === "addresses"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "hover:bg-white text-stone-700"
                  }`}
                >
                  <MapPin size={16} /> Saved Addresses
                </button>

                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-brand-primary text-white shadow-xs"
                      : "hover:bg-white text-stone-700"
                  }`}
                >
                  <User size={16} /> Profile Details
                </button>

                {user.isAdmin && (
                  <Link
                    href="/admin"
                    className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-brand-primary bg-red-50 hover:bg-red-100/70 border border-red-200 transition-colors mt-2"
                  >
                    ⚙️ Admin Control Panel
                  </Link>
                )}
              </div>
            </aside>
          )}

          {/* MAIN CONTENT AREA */}
          <div className={user ? "lg:col-span-9 space-y-6" : "w-full space-y-6"}>
            {/* Quick Metrics Bar */}
            {(user || displayOrders.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="border border-stone-200 bg-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                      Total Orders
                    </p>
                    <p className="font-display font-black text-xl text-stone-900 mt-0.5">
                      {displayTotalOrders}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <ShoppingBag size={20} />
                  </div>
                </div>

                <div className="border border-stone-200 bg-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                      Total Spent
                    </p>
                    <p className="font-display font-black text-xl text-brand-primary mt-0.5">
                      ₹{displayTotalSpent}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <TrendingUp size={20} />
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 border border-stone-200 bg-white p-4 rounded-2xl shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">
                      Favorite Selection
                    </p>
                    <p className="font-display font-black text-sm text-stone-900 truncate max-w-[140px] mt-0.5">
                      {displayOrders.length > 0 && displayOrders[0].items?.[0]
                        ? displayOrders[0].items[0].product.name
                        : "Fresh Chicken"}
                    </p>
                  </div>
                  <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                    <Heart size={20} />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 1: ORDER HISTORY */}
            {(!user || activeTab === "orders") && (
              <div className="border border-stone-200 rounded-2xl bg-white shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <History size={18} className="text-brand-primary" />
                    {user ? "Your Order History" : "Matching Orders"}
                  </h2>
                  <Link
                    href="/shop"
                    className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
                  >
                    Order Fresh Cuts <ChevronRight size={13} />
                  </Link>
                </div>

                {loadingOrders ? (
                  <div className="text-center py-16 text-stone-400 font-bold text-xs space-y-2">
                    <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p>Loading your orders...</p>
                  </div>
                ) : displayOrders.length > 0 ? (
                  <div className="space-y-6">
                    {displayOrders.map((order) => {
                      const isConfirmed = order.status === "Order Confirmed" || (order.status as string) === "CONFIRMED";
                      return (
                        <div
                          key={order.id}
                          className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs hover:border-stone-300 transition-colors"
                        >
                          {/* Order Header Strip */}
                          <div className="bg-stone-50 p-4 border-b border-stone-200 flex items-center justify-between flex-wrap gap-3 text-xs">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div>
                                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                                  Order ID
                                </span>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="font-black text-stone-900 text-sm">
                                    {order.id}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(order.id)}
                                    title="Copy Order ID"
                                    className="text-stone-400 hover:text-brand-primary p-0.5 cursor-pointer"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  {copiedId === order.id && (
                                    <span className="text-[10px] text-brand-primary font-bold">Copied!</span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                                  Placed On
                                </span>
                                <span className="text-stone-800 font-bold mt-0.5 block">
                                  {order.date || "Today"}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] text-stone-400 font-bold uppercase block">
                                  Total Bill
                                </span>
                                <span className="text-brand-primary font-black text-sm mt-0.5 block">
                                  ₹{order.total}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* Status Badge */}
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  isConfirmed
                                    ? "bg-red-50 text-brand-primary border-red-200"
                                    : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                              >
                                <Clock size={12} /> {order.status || "Order Received"}
                              </span>

                              {/* Live Track Button */}
                              <Link
                                href={`/order/${order.id}`}
                                className="px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                Track Live <ExternalLink size={12} />
                              </Link>

                              {/* Reorder Button */}
                              <button
                                onClick={() => handleReorder(order.items)}
                                className="px-3 py-1.5 bg-white border border-stone-300 hover:border-brand-primary text-stone-700 hover:text-brand-primary rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Re-order
                              </button>
                            </div>
                          </div>

                          {/* Order Body */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 text-xs">
                            {/* Ordered Items List */}
                            <div className="md:col-span-7 divide-y divide-stone-100">
                              {(order.items || []).map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                                >
                                  <div className="flex items-center gap-3 min-w-0 pr-3">
                                    <img
                                      src={item.product?.image || "/chicken1.png"}
                                      alt={item.product?.name || "Product"}
                                      className="w-11 h-11 object-cover rounded-lg bg-stone-50 border border-stone-200 shrink-0"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).src = "/chicken1.png";
                                      }}
                                    />
                                    <div className="truncate">
                                      <p className="text-stone-900 font-bold truncate">
                                        {item.product?.name}
                                      </p>
                                      <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                                        {item.selectedWeight} × {item.quantity}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="font-extrabold text-stone-900 shrink-0">
                                    ₹{item.price * item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Delivery & Summary Column */}
                            <div className="md:col-span-5 bg-stone-50/70 rounded-xl p-3.5 border border-stone-200 space-y-2.5 text-[11px]">
                              <div className="flex items-start gap-2">
                                <MapPin size={14} className="text-brand-primary shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-black text-[9px] uppercase px-1.5 py-0.5 rounded bg-red-50 text-brand-primary border border-red-200">
                                    {order.address?.tag || "Home"}
                                  </span>
                                  <p className="text-stone-800 font-bold mt-1 leading-snug">
                                    {order.address?.addressLine}, {order.address?.city} - {order.address?.pincode}
                                  </p>
                                </div>
                              </div>

                              {order.geoLocation?.latitude != null && order.geoLocation?.longitude != null && (
                                <div className="flex items-center gap-1.5 p-2 rounded-lg bg-red-50 border border-red-200 text-brand-primary text-[10px] font-bold">
                                  <Navigation size={12} className="shrink-0" />
                                  <span>
                                    GPS: {order.geoLocation.latitude.toFixed(4)}, {order.geoLocation.longitude.toFixed(4)}
                                  </span>
                                </div>
                              )}

                              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-500 font-semibold">
                                <span>Payment: <strong className="text-stone-800 uppercase">{(order.paymentMethod || "cod").toUpperCase()}</strong></span>
                                <span className="text-brand-primary font-black text-xs">₹{order.total} Total</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16 text-stone-400 space-y-3">
                    <History size={36} className="mx-auto text-stone-300" />
                    <p className="text-sm font-bold text-stone-700">
                      {user
                        ? "No orders found in your account history."
                        : guestLookupTried
                        ? "No matching orders found. Please double-check your Order ID or Phone number."
                        : "Enter your Order ID above to view details."}
                    </p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      All fresh cuts are prepared hygienically and dispatched cold within ~20 minutes.
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-1.5 mt-2 px-6 py-2.5 bg-brand-primary hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors uppercase tracking-wider"
                    >
                      <Package size={14} /> Browse Fresh Cuts
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SAVED ADDRESSES */}
            {user && activeTab === "addresses" && (
              <div className="border border-stone-200 rounded-2xl bg-white shadow-xs p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <MapPin size={18} className="text-brand-primary" />
                    Saved Delivery Addresses
                  </h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-xs cursor-pointer shadow-xs"
                  >
                    {showAddressForm ? "Cancel" : "+ Add New Address"}
                  </button>
                </div>

                {addressSuccess && (
                  <div className="p-3 bg-red-50 border border-red-200 text-brand-primary rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Address saved successfully!
                  </div>
                )}

                {/* Add Address Form */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddressSubmit} className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                    <div className="flex gap-2">
                      {(["Home", "Work", "Other"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTag(t)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
                            tag === t
                              ? "bg-brand-primary text-white"
                              : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="House / Flat No, Street, Society, Landmark *"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="w-full sm:col-span-2 px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-brand-primary outline-none text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={city}
                        disabled
                        className="w-full px-3.5 py-2.5 bg-stone-100 border border-stone-200 rounded-xl font-bold text-stone-500 cursor-not-allowed text-xs"
                      />
                      <input
                        type="text"
                        placeholder="6-digit Pincode (e.g. 110085) *"
                        value={pincode}
                        maxLength={6}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:border-brand-primary outline-none text-xs font-medium"
                      />
                    </div>

                    {formError && (
                      <p className="text-red-600 font-bold text-xs">{formError}</p>
                    )}

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Save Delivery Address
                    </button>
                  </form>
                )}

                {/* Addresses Grid */}
                {user.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr, idx) => (
                      <div
                        key={idx}
                        className="border border-stone-200 rounded-xl p-4 bg-stone-50/40 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <span className="inline-block px-2 py-0.5 bg-red-50 text-brand-primary border border-red-200 rounded font-black text-[10px] uppercase mb-2">
                            {addr.tag || "Home"}
                          </span>
                          <p className="text-stone-900 font-bold text-xs leading-snug">
                            {addr.addressLine}
                          </p>
                          <p className="text-stone-500 text-[11px] mt-1 font-medium">
                            {addr.city} - {addr.pincode}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAddress(addr.id || String(idx))}
                          className="text-xs font-bold text-red-600 hover:underline self-start cursor-pointer"
                        >
                          Remove Address
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 font-bold text-center py-8 text-xs">
                    No saved addresses yet. Click &quot;+ Add New Address&quot; to save one.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: PROFILE DETAILS */}
            {user && activeTab === "profile" && (
              <div className="border border-stone-200 rounded-2xl bg-white shadow-xs p-6 space-y-6">
                <div className="pb-3 border-b border-stone-100">
                  <h2 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                    <User size={18} className="text-brand-primary" />
                    Profile Details
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Update your account details and contact information.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-3 bg-red-50 border border-red-200 text-brand-primary rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> Profile updated successfully!
                  </div>
                )}

                {profileError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileSubmit} className="max-w-md space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-xs focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-xs focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 text-xs focus:bg-white focus:border-brand-primary outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-6 py-2.5 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer text-xs uppercase tracking-wider disabled:opacity-50 shadow-xs"
                  >
                    {profileSaving ? "Saving..." : "Save Profile Changes"}
                  </button>
                </form>
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
