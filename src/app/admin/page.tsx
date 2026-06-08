"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Product, Order } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Package,
  ShoppingBag,
  MapPin,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  TrendingUp,
  Settings,
  ChevronRight,
} from "lucide-react";

export default function AdminPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    locations,
    addLocation,
    removeLocation,
    storeSettings,
    updateStoreSettings,
    orders,
    updateOrderStatus,
    getStoreStatusLabel,
  } = useApp();

  // Tabs state
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "locations" | "timings" | "customers">("products");

  // Edit / Add Product Form States
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Chicken" | "Mutton" | "Fish" | "Eggs">("Chicken");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [freshnessBadge, setFreshnessBadge] = useState("Cut After Order");
  const [isBestSeller, setIsBestSeller] = useState(false);
  // Simple pricing tags
  const [price500g, setPrice500g] = useState("199");
  const [origPrice500g, setOrigPrice500g] = useState("249");
  const [price1kg, setPrice1kg] = useState("349");
  const [origPrice1kg, setOrigPrice1kg] = useState("399");

  // New Location Form States
  const [newLocName, setNewLocName] = useState("");

  // Store Hours State
  const [openingTime, setOpeningTime] = useState(storeSettings.openingTime);
  const [closingTime, setClosingTime] = useState(storeSettings.closingTime);
  const [isTempClosed, setIsTempClosed] = useState(storeSettings.isTemporarilyClosed);
  const [holidayMode, setHolidayMode] = useState(storeSettings.holidayMode);

  // Success Feedback Messages
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3000);
  };

  // Trigger modal for adding product
  const handleOpenAddModal = () => {
    setEditingProdId(null);
    setName("");
    setCategory("Chicken");
    setDescription("");
    setImage("https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600");
    setFreshnessBadge("Cut After Order");
    setIsBestSeller(false);
    setPrice500g("199");
    setOrigPrice500g("249");
    setPrice1kg("349");
    setOrigPrice1kg("399");
    setShowProductModal(true);
  };

  // Trigger modal for editing product
  const handleOpenEditModal = (prod: Product) => {
    setEditingProdId(prod.id);
    setName(prod.name);
    setCategory(prod.category);
    setDescription(prod.description);
    setImage(prod.image);
    setFreshnessBadge(prod.freshnessBadge);
    setIsBestSeller(!!prod.isBestSeller);

    // Populate weight prices
    const w500 = prod.weights.find((w) => w.weight === "500g" || w.weight === "6 Pcs");
    const w1k = prod.weights.find((w) => w.weight === "1kg" || w.weight === "12 Pcs" || w.weight === "30 Pcs");

    setPrice500g(w500 ? String(w500.price) : "");
    setOrigPrice500g(w500?.originalPrice ? String(w500.originalPrice) : "");
    setPrice1kg(w1k ? String(w1k.price) : "");
    setOrigPrice1kg(w1k?.originalPrice ? String(w1k.originalPrice) : "");

    setShowProductModal(true);
  };

  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Compile weights
    const weightsArray = [];
    if (price500g) {
      weightsArray.push({
        weight: category === "Eggs" ? "6 Pcs" : "500g",
        price: Number(price500g),
        originalPrice: origPrice500g ? Number(origPrice500g) : undefined,
      });
    }
    if (price1kg) {
      weightsArray.push({
        weight: category === "Eggs" ? "12 Pcs" : "1kg",
        price: Number(price1kg),
        originalPrice: origPrice1kg ? Number(origPrice1kg) : undefined,
      });
    }

    if (weightsArray.length === 0) {
      alert("At least one weight option must be specified!");
      return;
    }

    const payload = {
      name,
      category,
      description,
      image,
      rating: 4.8,
      reviewsCount: 15,
      freshnessBadge,
      isBestSeller,
      weights: weightsArray,
      stock: 30,
    };

    if (editingProdId) {
      updateProduct(editingProdId, payload);
      triggerFeedback("Product updated successfully!");
    } else {
      addProduct(payload);
      triggerFeedback("Product created successfully!");
    }

    setShowProductModal(false);
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      triggerFeedback("Product deleted successfully.");
    }
  };

  // Location Submit
  const handleAddLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocName.trim()) {
      addLocation(newLocName.trim());
      setNewLocName("");
      triggerFeedback("Service location added successfully!");
    }
  };

  // Timings Submit
  const handleTimingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      openingTime,
      closingTime,
      isTemporarilyClosed: isTempClosed,
      holidayMode,
    });
    triggerFeedback("Operational hours updated successfully!");
  };

  const storeStatus = getStoreStatusLabel();

  // Mock list of customers derived from orders + presets
  const mockCustomers = [
    { name: "Amit Sharma", phone: "+91 9876543210", email: "amit.sharma@example.com", orders: orders.length + 2, status: "Active Premium" },
    { name: "Ranit Bose", phone: "+91 9988776655", email: "ranit.bose@google.com", orders: 1, status: "Active" },
    { name: "Suresh Gupta", phone: "+91 9123456789", email: "suresh.g@example.com", orders: 0, status: "Registered" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Admin Panel</span>
        </div>

        {/* Dashboard Title & Alert messages */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              ⚙️ Admin Control Panel
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Hyperlocal settings. Toggles update customer layouts immediately.
            </p>
          </div>

          {/* Feedback banner */}
          {feedbackMsg && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-emerald-800 text-xs font-bold animate-fade-in shadow-sm">
              {feedbackMsg}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Tabs */}
          <aside className="lg:col-span-3 space-y-2 font-bold text-xs text-gray-700">
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "products"
                  ? "bg-red-50 text-brand-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Package size={16} /> Manage Products
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "orders"
                  ? "bg-red-50 text-brand-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <ShoppingBag size={16} /> Track Orders
              {orders.filter((o) => o.status === "Order Placed").length > 0 && (
                <span className="ml-auto bg-brand-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                  {orders.filter((o) => o.status === "Order Placed").length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "locations"
                  ? "bg-red-50 text-brand-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <MapPin size={16} /> Service Locations
            </button>
            <button
              onClick={() => setActiveTab("timings")}
              className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "timings"
                  ? "bg-red-50 text-brand-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Clock size={16} /> Opening Timings
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left transition-colors cursor-pointer ${
                activeTab === "customers"
                  ? "bg-red-50 text-brand-primary"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <Users size={16} /> Customer Base
            </button>
            <Link
              href="/"
              className="w-full flex items-center gap-2.5 px-4.5 py-3 rounded-xl text-left text-gray-500 hover:bg-gray-50 border-t border-gray-100"
            >
              Exit to Storefront
            </Link>
          </aside>

          {/* Right Workspace Main Panel */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB CONTENT: PRODUCTS TABLE */}
            {activeTab === "products" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-display font-extrabold text-sm text-gray-900">
                    Product Catalog ({products.length} items)
                  </h3>
                  <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-1.5 bg-brand-primary hover:bg-red-700 text-white font-extrabold px-3 py-2 rounded-xl text-[10px] uppercase transition-colors cursor-pointer shadow"
                  >
                    <Plus size={14} strokeWidth={3} /> Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                        <th className="p-3">Product Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Portions</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {products.map((prod) => (
                        <tr key={prod.id} className="hover:bg-gray-50/50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={prod.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 border border-gray-100" />
                            <div>
                              <p className="font-bold text-gray-900 text-xs">{prod.name}</p>
                              {prod.isBestSeller && <span className="text-[8px] bg-red-50 text-brand-primary px-1.5 py-0.5 rounded font-black uppercase">BEST SELLER</span>}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-bold text-gray-600 uppercase">
                              {prod.category}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {prod.weights.map((w) => (
                                <span key={w.weight} className="text-[9px] border border-gray-200 px-1.5 py-0.5 rounded text-gray-500 font-bold">
                                  {w.weight}: ₹{w.price}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleOpenEditModal(prod)} className="p-1.5 text-gray-500 hover:text-brand-primary rounded hover:bg-gray-100 transition-colors cursor-pointer" title="Edit Product">
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-gray-100 transition-colors cursor-pointer" title="Delete Product">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ORDERS LIST */}
            {activeTab === "orders" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Track Incoming Orders ({orders.length} items)
                </h3>

                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
                      >
                        {/* Order info bar */}
                        <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4 text-gray-600">
                          <div className="flex gap-4 flex-wrap">
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase">Order ID</span>
                              <p className="text-gray-900 font-bold">{order.id}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase">Customer Info</span>
                              <p className="text-gray-900 font-bold">{order.address.addressLine.split(",")[0]}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase">Total Bill</span>
                              <p className="text-brand-primary font-extrabold">₹{order.total}</p>
                            </div>
                            <div>
                              <span className="text-[9px] text-gray-400 font-black uppercase">Status</span>
                              <p className="text-gray-900 font-bold">{order.status}</p>
                            </div>
                          </div>

                          {/* Order actions flow */}
                          <div className="flex gap-2">
                            {order.status === "Order Placed" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "Preparing")}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                              >
                                Accept Order
                              </button>
                            )}
                            {order.status === "Preparing" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "Out for Delivery")}
                                className="px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                              >
                                Dispatch Order
                              </button>
                            )}
                            {order.status === "Out for Delivery" && (
                              <button
                                onClick={() => updateOrderStatus(order.id, "Delivered")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {order.status === "Delivered" && (
                              <span className="text-emerald-600 font-bold flex items-center gap-1">
                                <CheckCircle size={14} /> Completed
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Order items lists */}
                        <div className="p-4 bg-white divide-y divide-gray-100 text-xs">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between py-2 text-gray-700">
                              <span>
                                {item.product.name} ({item.selectedWeight}) × {item.quantity}
                              </span>
                              <span className="font-extrabold text-gray-900">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400 space-y-2">
                    <ShoppingBag size={32} className="mx-auto text-gray-300" />
                    <p className="text-xs font-bold text-gray-500">No active orders placed during this session.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: LOCATIONS */}
            {activeTab === "locations" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Franchise Location Outlets
                </h3>

                <form onSubmit={handleAddLocationSubmit} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    placeholder="E.g. Dwarka Sector 12, Delhi"
                    value={newLocName}
                    onChange={(e) => setNewLocName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    Add Location
                  </button>
                </form>

                {/* List of current outlets */}
                <div className="space-y-3 max-w-md pt-4">
                  <h4 className="font-bold text-xs text-gray-900">Active Zones</h4>
                  <div className="space-y-2">
                    {locations.map((loc) => (
                      <div
                        key={loc}
                        className="border border-gray-100 rounded-xl p-3 bg-gray-50 flex items-center justify-between font-bold"
                      >
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-brand-primary" />
                          <span>{loc}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLocation(loc)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                          title="Delete Location"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: STORE TIMINGS */}
            {activeTab === "timings" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-display font-extrabold text-sm text-gray-900">
                    Store Operational Hours
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${storeStatus.color}`}>
                    {storeStatus.label} ({storeStatus.nextTime})
                  </span>
                </div>

                <form onSubmit={handleTimingsSubmit} className="space-y-6 max-w-md font-bold text-xs text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Opening Hour</label>
                      <input
                        type="time"
                        value={openingTime}
                        onChange={(e) => setOpeningTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Closing Hour</label>
                      <input
                        type="time"
                        value={closingTime}
                        onChange={(e) => setClosingTime(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Toggle controls */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <h4 className="font-bold text-xs text-gray-900">Closure Overrides</h4>

                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTempClosed}
                          onChange={(e) => setIsTempClosed(e.target.checked)}
                          className="w-4 h-4 accent-brand-primary"
                        />
                        <div>
                          <p className="text-gray-900 font-bold">Temporarily Close Store</p>
                          <p className="text-[10px] text-gray-400 font-medium">Closes order placements and shows closed notices instantly</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50/50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={holidayMode}
                          onChange={(e) => setHolidayMode(e.target.checked)}
                          className="w-4 h-4 accent-brand-primary"
                        />
                        <div>
                          <p className="text-gray-900 font-bold">Holiday Closure Mode</p>
                          <p className="text-[10px] text-gray-400 font-medium">Flags next opening as tomorrow</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors shadow cursor-pointer"
                  >
                    Save Timing Configurations
                  </button>
                </form>
              </div>
            )}

            {/* TAB CONTENT: CUSTOMERS */}
            {activeTab === "customers" && (
              <div className="border border-gray-100 rounded-2xl bg-white shadow-sm p-6 space-y-6 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Customer Insights Database
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600">
                        <th className="p-3">Customer Name</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3 text-center">Session Orders</th>
                        <th className="p-3 text-right">User Tag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {mockCustomers.map((cust, idx) => (
                        <tr key={idx} className="hover:bg-gray-50/50">
                          <td className="p-3 font-bold text-gray-900">{cust.name}</td>
                          <td className="p-3 text-gray-500">
                            <p>{cust.phone}</p>
                            <p className="text-[10px] font-semibold text-gray-400">{cust.email}</p>
                          </td>
                          <td className="p-3 text-center font-bold text-gray-750">{cust.orders}</td>
                          <td className="p-3 text-right">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                              cust.status === "Active Premium"
                                ? "bg-red-50 text-brand-primary"
                                : cust.status === "Active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {cust.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CRUD Product Add/Edit Modal */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto pt-10 pb-10">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowProductModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl mx-4 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <h4 className="font-display font-black text-sm text-gray-900">
                  {editingProdId ? "Edit Product Cut" : "Add New Product Cut"}
                </h4>
                <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={18} /></button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4 font-bold text-xs text-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Product Title</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Clean Mutton Keema"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="Chicken">Chicken</option>
                      <option value="Mutton">Mutton</option>
                      <option value="Fish">Fish</option>
                      <option value="Eggs">Eggs</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Description</label>
                  <textarea
                    required
                    placeholder="Describe portion cut specs, serving guidelines..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Image URL</label>
                    <input
                      type="text"
                      required
                      placeholder="https://images.unsplash.com/..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Freshness Badge</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. 100% Chilled"
                      value={freshnessBadge}
                      onChange={(e) => setFreshnessBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Weights Pricing Configuration */}
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  <h5 className="font-bold text-xs text-gray-900">Weights & Pricing Config</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Weight 1: 500g */}
                    <div className="p-3 border border-gray-100 rounded-xl space-y-2">
                      <p className="font-extrabold text-[10px] text-gray-500 uppercase tracking-wide">
                        Portion Option 1 (500g / 6 Pcs)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-gray-400 uppercase mb-0.5">Price (₹)</label>
                          <input
                            type="text"
                            placeholder="Price"
                            value={price500g}
                            onChange={(e) => setPrice500g(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded outline-none text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-gray-400 uppercase mb-0.5">Original Price (₹)</label>
                          <input
                            type="text"
                            placeholder="Strike"
                            value={origPrice500g}
                            onChange={(e) => setOrigPrice500g(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded outline-none text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Weight 2: 1kg */}
                    <div className="p-3 border border-gray-100 rounded-xl space-y-2">
                      <p className="font-extrabold text-[10px] text-gray-500 uppercase tracking-wide">
                        Portion Option 2 (1kg / 12 Pcs)
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[8px] text-gray-400 uppercase mb-0.5">Price (₹)</label>
                          <input
                            type="text"
                            placeholder="Price"
                            value={price1kg}
                            onChange={(e) => setPrice1kg(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded outline-none text-xs font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] text-gray-400 uppercase mb-0.5">Original Price (₹)</label>
                          <input
                            type="text"
                            placeholder="Strike"
                            value={origPrice1kg}
                            onChange={(e) => setOrigPrice1kg(e.target.value.replace(/\D/g, ""))}
                            className="w-full px-2 py-1 bg-gray-50 border border-gray-200 rounded outline-none text-xs font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Best seller checkbox */}
                <label className="flex items-center gap-2 pt-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="w-4 h-4 accent-brand-primary"
                  />
                  <span>Mark as Best Selling Product (Show on homepage)</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
                >
                  {editingProdId ? "Save Changes" : "Create Product"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
