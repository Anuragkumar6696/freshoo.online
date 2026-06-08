"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, CartItem } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  User,
  ShoppingBag,
  MapPin,
  Clock,
  History,
  TrendingUp,
  Plus,
  Trash2,
  X,
  ChevronRight,
  Heart,
  CheckCircle2,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    orders,
    reorderItems,
    addAddress,
    removeAddress,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"orders" | "addresses" | "profile">("orders");
  
  // New Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [tag, setTag] = useState<"Home" | "Work" | "Other">("Home");
  const [addressLine, setAddressLine] = useState("");
  const [city] = useState("Delhi");
  const [pincode, setPincode] = useState("");
  const [formError, setFormError] = useState("");

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

    addAddress({
      tag,
      addressLine,
      city,
      pincode,
    });

    // Reset Form
    setAddressLine("");
    setPincode("");
    setShowAddressForm(false);
  };

  // Compute metrics
  const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">My Account</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-8">
          Customer Dashboard
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Sidebar */}
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
                className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-red-50 text-brand-primary"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <History size={16} /> Order History
              </button>
              <button
                onClick={() => setActiveTab("addresses")}
                className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTab === "addresses"
                    ? "bg-red-50 text-brand-primary"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <MapPin size={16} /> Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-red-50 text-brand-primary"
                    : "hover:bg-gray-50 text-gray-600"
                }`}
              >
                <User size={16} /> Profile Details
              </button>
              <Link
                href="/admin"
                className="w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left hover:bg-red-50/20 text-red-500 font-extrabold border-t border-gray-100"
              >
                ⚙️ Admin Control Panel
              </Link>
            </div>
          </aside>

          {/* Right Main Panel Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* Spending stats summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Orders</p>
                  <p className="font-display font-black text-xl text-gray-900">{totalOrders}</p>
                </div>
                <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                  <ShoppingBag size={20} />
                </div>
              </div>

              <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Spending</p>
                  <p className="font-display font-black text-xl text-gray-900">₹{totalSpent}</p>
                </div>
                <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="border border-gray-100 bg-white p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Favorite Cut</p>
                  <p className="font-display font-black text-sm text-gray-900 truncate max-w-[140px]">
                    {orders.length > 0 ? orders[0].items[0].product.name.split(" ")[0] : "Chicken"}
                  </p>
                </div>
                <div className="p-2.5 bg-red-50 text-brand-primary rounded-xl">
                  <Heart size={20} />
                </div>
              </div>
            </div>

            {/* TAB CONTENT: ORDERS HISTORY */}
            {activeTab === "orders" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Order History
                </h3>

                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                      >
                        {/* Header bar */}
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3 font-bold text-xs text-gray-600">
                          <div className="flex items-center gap-4 flex-wrap">
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Order ID</span>
                              <p className="text-gray-900 mt-0.5">{order.id}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Placed On</span>
                              <p className="text-gray-900 mt-0.5">{order.date}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase">Total Bill</span>
                              <p className="text-brand-primary mt-0.5">₹{order.total}</p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-brand-primary border border-red-100/50">
                              <Clock size={12} /> {order.status}
                            </span>
                            <button
                              onClick={() => handleReorder(order.items)}
                              className="px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              One-Click Reorder
                            </button>
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="p-4 divide-y divide-gray-100">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between py-2.5 first:pt-0 last:pb-0 text-xs font-semibold">
                              <div className="min-w-0 flex-1 pr-4">
                                <p className="text-gray-900 font-bold truncate">{item.product.name}</p>
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 space-y-3">
                    <History size={32} className="mx-auto" />
                    <p className="text-xs font-bold text-gray-500">No orders placed during this session yet.</p>
                    <p className="text-[10px]">Head over to the Shop page and place a fresh order cut!</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SAVED ADDRESSES */}
            {activeTab === "addresses" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-display font-extrabold text-sm text-gray-900">
                    Saved Shipping Addresses
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="flex items-center gap-1 text-[10px] font-black uppercase bg-red-50 text-brand-primary hover:bg-brand-primary hover:text-white px-3 py-1.5 rounded-lg border border-red-200/50 transition-all cursor-pointer"
                  >
                    <Plus size={12} strokeWidth={3} /> Add Address
                  </button>
                </div>

                {/* List Grid */}
                {user?.addresses && user.addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm space-y-3 flex justify-between items-start"
                      >
                        <div className="space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-lg bg-red-50 text-brand-primary text-[9px] font-black uppercase">
                            {addr.tag}
                          </span>
                          <p className="text-xs text-gray-800 font-medium leading-relaxed">
                            {addr.addressLine}, {addr.city} - {addr.pincode}
                          </p>
                        </div>
                        <button
                          onClick={() => removeAddress(addr.id)}
                          className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                          title="Delete address"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-xs font-semibold">No addresses saved yet.</p>
                  </div>
                )}

                {/* Add Address Form overlay modal */}
                {showAddressForm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowAddressForm(false)} />
                    <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 overflow-hidden mx-4 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <h4 className="font-display font-extrabold text-sm text-gray-900">Add New Address</h4>
                        <button onClick={() => setShowAddressForm(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
                      </div>

                      {formError && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded">{formError}</p>}

                      <form onSubmit={handleAddAddressSubmit} className="space-y-4 font-bold text-xs text-gray-600">
                        <div>
                          <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Address Type</label>
                          <div className="flex gap-2">
                            {["Home", "Work", "Other"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTag(t as "Home" | "Work" | "Other")}
                                className={`flex-1 py-1.5 border text-center rounded-lg cursor-pointer ${
                                  tag === t
                                    ? "border-brand-primary bg-red-50 text-brand-primary"
                                    : "border-gray-200 hover:bg-gray-50 text-gray-600"
                                }`}
                              >
                                {t}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Street Address</label>
                          <input
                            type="text"
                            required
                            placeholder="Flat/House number, Street name, Locality"
                            value={addressLine}
                            onChange={(e) => setAddressLine(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">City</label>
                            <input
                              type="text"
                              disabled
                              value={city}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg outline-none font-medium text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Pincode</label>
                            <input
                              type="text"
                              required
                              maxLength={6}
                              placeholder="110086"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-lg shadow-md cursor-pointer transition-colors mt-2"
                        >
                          Save Address
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: PROFILE DETAILS */}
            {activeTab === "profile" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Profile Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-bold text-xs text-gray-600">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Full Name</span>
                    <p className="text-gray-900 text-sm mt-1">{user?.name || "Guest User"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Registered Phone</span>
                    <p className="text-gray-900 text-sm mt-1">{user?.phone || "No phone linked"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Email Address</span>
                    <p className="text-gray-900 text-sm mt-1">{user?.email || "No email linked"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Verification Status</span>
                    <p className="text-emerald-600 text-xs mt-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Active Verified Account
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
