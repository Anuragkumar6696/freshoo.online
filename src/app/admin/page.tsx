"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApp, Product, Order as OrderT } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AdminGuard } from "@/components/AdminGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  ShoppingBag,
  MapPin,
  Clock,
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  X,
  ChevronRight,
  Upload,
  Download,
  FileSpreadsheet,
  Navigation,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Store,
  Calendar,
  AlertTriangle,
  ExternalLink,
  Eye,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminPageContent />
    </AdminGuard>
  );
}

function AdminPageContent() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    storeSettings,
    updateStoreSettings,
    orders,
    refreshOrders,
    updateOrderStatus,
    user,
  } = useApp();

  // Primary Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "excel" | "orders" | "customers" | "franchises" | "timings" | "products"
  >("excel");

  // Helper: Retrieve admin auth headers for secure backend operations
  const getAdminHeaders = (extra: Record<string, string> = {}) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("freshoo_token") : null;
    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  // Feedback notifications
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const triggerFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

  // ==========================================
  // TAB 1: OVERVIEW METRICS
  // ==========================================
  const overviewMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const receivedOrders = orders.filter((o) => o.status === "Order Received" || o.status === "Order Placed").length;
    const confirmedOrders = orders.filter((o) => o.status === "Order Confirmed" || o.status === "Delivered").length;
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const guestOrders = orders.filter((o) => o.isGuestOrder).length;
    const registeredOrders = totalOrders - guestOrders;

    // Today's orders
    const todayStr = new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    const ordersToday = orders.filter((o) => {
      if (!o.date) return false;
      return o.date.includes(todayStr) || (o as any).createdAt?.startsWith(new Date().toISOString().split("T")[0]);
    }).length;

    return {
      totalOrders,
      receivedOrders,
      confirmedOrders,
      totalSales,
      guestOrders,
      registeredOrders,
      ordersToday,
    };
  }, [orders]);

  // ==========================================
  // TAB 2: ORDERS MANAGEMENT
  // ==========================================
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");
  const [orderFranchiseFilter, setOrderFranchiseFilter] = useState<string>("ALL");
  const [orderStartDate, setOrderStartDate] = useState("");
  const [orderEndDate, setOrderEndDate] = useState("");
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter (enforce exact two statuses)
      if (orderStatusFilter !== "ALL") {
        if (orderStatusFilter === "Order Received" && o.status !== "Order Received" && o.status !== "Order Placed") return false;
        if (orderStatusFilter === "Order Confirmed" && o.status !== "Order Confirmed" && o.status !== "Delivered") return false;
      }

      // Franchise filter
      if (orderFranchiseFilter !== "ALL") {
        if (o.franchise?.code !== orderFranchiseFilter) return false;
      }

      // Search filter
      if (orderSearch.trim()) {
        const s = orderSearch.toLowerCase().trim();
        const matchesId = (o.id || (o as any).friendlyId || "").toLowerCase().includes(s);
        const matchesName = (o.customerName || "").toLowerCase().includes(s);
        const matchesPhone = (o.customerPhone || o.guestPhone || "").includes(s);
        const matchesEmail = (o.customerEmail || o.guestEmail || "").toLowerCase().includes(s);
        if (!matchesId && !matchesName && !matchesPhone && !matchesEmail) return false;
      }

      return true;
    });
  }, [orders, orderStatusFilter, orderFranchiseFilter, orderSearch]);

  const handleConfirmOrder = async (orderId: string) => {
    setUpdatingOrderId(orderId);
    try {
      const ok = await updateOrderStatus(orderId, "Order Confirmed");
      if (ok) {
        triggerFeedback(`Order ${orderId} confirmed successfully!`);
        await refreshOrders();
        if (selectedOrderDetails?.id === orderId) {
          setSelectedOrderDetails((prev: any) => ({ ...prev, status: "Order Confirmed" }));
        }
      } else {
        alert("Failed to confirm order.");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleExportOrdersExcel = async () => {
    try {
      const params = new URLSearchParams();
      params.append("format", "xlsx");
      if (orderStatusFilter !== "ALL") params.append("status", orderStatusFilter);
      if (orderFranchiseFilter !== "ALL") params.append("franchise", orderFranchiseFilter);
      if (orderStartDate) params.append("startDate", orderStartDate);
      if (orderEndDate) params.append("endDate", orderEndDate);
      const token = typeof window !== "undefined" ? localStorage.getItem("freshoo_token") : null;
      if (token) params.append("token", token);

      const res = await fetch(`/api/admin/reports/orders?${params.toString()}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        window.open("/reports/orders.xlsx", "_blank");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `freshoo-orders-${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel download error:", err);
      window.open("/reports/orders.xlsx", "_blank");
    }
  };

  const handleExportOrdersCsv = async () => {
    try {
      const params = new URLSearchParams();
      params.append("format", "csv");
      if (orderStatusFilter !== "ALL") params.append("status", orderStatusFilter);
      if (orderFranchiseFilter !== "ALL") params.append("franchise", orderFranchiseFilter);
      if (orderStartDate) params.append("startDate", orderStartDate);
      if (orderEndDate) params.append("endDate", orderEndDate);
      const token = typeof window !== "undefined" ? localStorage.getItem("freshoo_token") : null;
      if (token) params.append("token", token);

      const res = await fetch(`/api/admin/reports/orders?${params.toString()}`, {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        window.open("/reports/orders.csv", "_blank");
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `freshoo-orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download error:", err);
      window.open("/reports/orders.csv", "_blank");
    }
  };

  // ==========================================
  // TAB 3: REAL CUSTOMER DATABASE
  // ==========================================
  const [customers, setCustomers] = useState<any[]>([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerTypeFilter, setCustomerTypeFilter] = useState("all");
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const fetchCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await fetch(`/api/admin/customers?search=${encodeURIComponent(customerSearch)}&type=${customerTypeFilter}`, {
        credentials: "include",
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data?.data?.customers) {
        setCustomers(data.data.customers);
      }
    } catch {
      // fallback
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    // Fetch all recorded orders in database for admin panel overview, excel sheet and order list
    void refreshOrders(true);
  }, [refreshOrders]);

  useEffect(() => {
    if (activeTab === "customers") {
      void fetchCustomers();
    }
  }, [activeTab, customerTypeFilter]);

  const handleExportCustomersCsv = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("freshoo_token") : null;
    const url = token ? `/api/admin/reports/customers?token=${encodeURIComponent(token)}` : "/api/admin/reports/customers";
    window.open(url, "_blank");
  };

  // ==========================================
  // TAB 4: FRANCHISE MANAGEMENT CRUD
  // ==========================================
  const [franchisesList, setFranchisesList] = useState<any[]>([]);
  const [loadingFranchises, setLoadingFranchises] = useState(false);
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [editingFranchiseId, setEditingFranchiseId] = useState<string | null>(null);

  const [fName, setFName] = useState("");
  const [fCode, setFCode] = useState("");
  const [fAddress, setFAddress] = useState("");
  const [fCity, setFCity] = useState("Delhi");
  const [fLat, setFLat] = useState("28.7188");
  const [fLng, setFLng] = useState("77.0673");
  const [fRadius, setFRadius] = useState("10");
  const [fPhone, setFPhone] = useState("+919310593167");
  const [fEmail, setFEmail] = useState("freshoo.online@gmail.com");
  const [fOpen, setFOpen] = useState("07:00");
  const [fClose, setFClose] = useState("23:00");
  const [fIsActive, setFIsActive] = useState(true);
  const [fIsTempClosed, setFIsTempClosed] = useState(false);

  const fetchFranchises = async () => {
    setLoadingFranchises(true);
    try {
      const res = await fetch("/api/franchises?all=true", {
        credentials: "include",
        headers: getAdminHeaders(),
      });
      const data = await res.json();
      if (res.ok && data?.data?.franchises) {
        setFranchisesList(data.data.franchises);
      }
    } finally {
      setLoadingFranchises(false);
    }
  };

  useEffect(() => {
    if (activeTab === "franchises") {
      void fetchFranchises();
    }
  }, [activeTab]);

  const handleOpenAddFranchise = () => {
    setEditingFranchiseId(null);
    setFName("");
    setFCode(`HUB-${Math.floor(10 + Math.random() * 90)}`);
    setFAddress("");
    setFCity("Delhi");
    setFLat("28.7188");
    setFLng("77.0673");
    setFRadius("10");
    setFPhone("+919310593167");
    setFEmail("freshoo.online@gmail.com");
    setFOpen("07:00");
    setFClose("23:00");
    setFIsActive(true);
    setFIsTempClosed(false);
    setShowFranchiseModal(true);
  };

  const handleOpenEditFranchise = (f: any) => {
    setEditingFranchiseId(f.id);
    setFName(f.name);
    setFCode(f.code);
    setFAddress(f.address);
    setFCity(f.city || "Delhi");
    setFLat(String(f.coordinates?.latitude || "28.7188"));
    setFLng(String(f.coordinates?.longitude || "77.0673"));
    setFRadius(String(f.deliveryRadiusKm || "10"));
    setFPhone(f.phone || "+919310593167");
    setFEmail(f.email || "freshoo.online@gmail.com");
    setFOpen(f.openingTime || "07:00");
    setFClose(f.closingTime || "23:00");
    setFIsActive(f.isActive !== false);
    setFIsTempClosed(Boolean(f.isTemporarilyClosed));
    setShowFranchiseModal(true);
  };

  const handleFranchiseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(fLat);
    const lng = parseFloat(fLng);
    const rad = parseFloat(fRadius);

    if (isNaN(lat) || isNaN(lng)) {
      alert("Please provide valid numerical coordinates.");
      return;
    }
    if (isNaN(rad) || rad <= 0) {
      alert("Please enter a valid radius in km (default is 10 km).");
      return;
    }

    const payload = {
      name: fName,
      code: fCode,
      address: fAddress,
      city: fCity,
      coordinates: { latitude: lat, longitude: lng },
      deliveryRadiusKm: rad,
      phone: fPhone,
      email: fEmail,
      openingTime: fOpen,
      closingTime: fClose,
      isActive: fIsActive,
      isTemporarilyClosed: fIsTempClosed,
    };

    if (editingFranchiseId) {
      const res = await fetch(`/api/franchises/${editingFranchiseId}`, {
        method: "PATCH",
        credentials: "include",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        triggerFeedback("Franchise updated successfully!");
        setShowFranchiseModal(false);
        void fetchFranchises();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update franchise");
      }
    } else {
      const res = await fetch("/api/franchises", {
        method: "POST",
        credentials: "include",
        headers: getAdminHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        triggerFeedback("Franchise created successfully!");
        setShowFranchiseModal(false);
        void fetchFranchises();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create franchise");
      }
    }
  };

  const handleToggleFranchiseStatus = async (f: any) => {
    const updatedStatus = !f.isActive;
    const res = await fetch(`/api/franchises/${f.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: getAdminHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ isActive: updatedStatus }),
    });
    if (res.ok) {
      triggerFeedback(`Franchise ${f.name} ${updatedStatus ? "activated" : "deactivated"}`);
      void fetchFranchises();
    }
  };

  // ==========================================
  // TAB 5: TIMINGS & HOLIDAYS
  // ==========================================
  const [openingTime, setOpeningTime] = useState(storeSettings.openingTime || "07:00");
  const [closingTime, setClosingTime] = useState(storeSettings.closingTime || "23:00");
  const [isTempClosed, setIsTempClosed] = useState(storeSettings.isTemporarilyClosed);
  const [holidayMode, setHolidayMode] = useState(storeSettings.holidayMode);
  const [holidaysList, setHolidaysList] = useState<Array<{ date: string; description: string }>>(
    (storeSettings as any).holidays || []
  );
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayDesc, setNewHolidayDesc] = useState("");

  // Sync state whenever storeSettings updates from server
  useEffect(() => {
    if (storeSettings) {
      setOpeningTime(storeSettings.openingTime || "07:00");
      setClosingTime(storeSettings.closingTime || "23:00");
      setIsTempClosed(Boolean(storeSettings.isTemporarilyClosed));
      setHolidayMode(Boolean(storeSettings.holidayMode));
      setHolidaysList(
        Array.isArray((storeSettings as any).holidays)
          ? (storeSettings as any).holidays
          : []
      );
    }
  }, [storeSettings]);

  const handleAddHoliday = () => {
    if (!newHolidayDate) return;
    setHolidaysList((prev) => [...prev, { date: newHolidayDate, description: newHolidayDesc || "Scheduled Closure" }]);
    setNewHolidayDate("");
    setNewHolidayDesc("");
  };

  const handleRemoveHoliday = (idx: number) => {
    setHolidaysList((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTimingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateStoreSettings({
      openingTime,
      closingTime,
      isTemporarilyClosed: isTempClosed,
      holidayMode,
      ...( { holidays: holidaysList } as any ),
    });
    if (ok) {
      triggerFeedback("Business hours and closure schedule saved!");
    } else {
      alert("Failed to update operating hours.");
    }
  };

  // ==========================================
  // TAB 6: PRODUCTS MANAGEMENT
  // ==========================================
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [pName, setPName] = useState("");
  const [pCategory, setPCategory] = useState<"Chicken" | "Mutton" | "Fish" | "Eggs">("Chicken");
  const [pDesc, setPDesc] = useState("");
  const [pImage, setPImage] = useState("");
  const [pImages, setPImages] = useState<string[]>([]);
  const [directImageUrl, setDirectImageUrl] = useState("");
  const [pFreshBadge, setPFreshBadge] = useState("Cut After Order");
  const [pIsBestSeller, setPIsBestSeller] = useState(false);
  const [pWeight1Label, setPWeight1Label] = useState("500g");
  const [pPrice500g, setPPrice500g] = useState("199");
  const [pOrig500g, setPOrig500g] = useState("249");
  const [pWeight2Label, setPWeight2Label] = useState("1kg");
  const [pPrice1kg, setPPrice1kg] = useState("349");
  const [pOrig1kg, setPOrig1kg] = useState("399");
  const [pStock, setPStock] = useState("50");
  const [pUploading, setPUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (pImages.length >= 5) {
      alert("A product can have at most 5 photos. Please remove an existing photo first.");
      if (e.target) e.target.value = "";
      return;
    }

    const maxAllowed = 5 - pImages.length;
    const filesToUpload = files.slice(0, maxAllowed);

    setPUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          credentials: "include",
          headers: getAdminHeaders(),
          body: formData,
        });
        const data = await res.json();
        if (res.ok && (data.data?.url || data.url)) {
          const url = data.data?.url || data.url;
          uploadedUrls.push(url);
        }
      }

      if (uploadedUrls.length > 0) {
        setPImages((prev) => {
          const cleanedPrev = prev.filter(
            (u) =>
              u !== "/chicken1.png" &&
              u !== "/mutton-fresh.png" &&
              u !== "/fish.png" &&
              u !== "/egg.jpeg"
          );
          const combined = [...cleanedPrev, ...uploadedUrls].slice(0, 5);
          setPImage(combined[0]);
          return combined;
        });
        triggerFeedback(`Uploaded ${uploadedUrls.length} photo(s) successfully!`);
      } else {
        alert("Failed to upload selected photo(s).");
      }
    } catch (err: any) {
      alert(err?.message || "Upload error");
    } finally {
      setPUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleAddDirectImageUrl = () => {
    const trimmed = directImageUrl.trim();
    if (!trimmed) return;
    if (pImages.length >= 5) {
      alert("A product can have at most 5 photos.");
      return;
    }
    setPImages((prev) => {
      const cleanedPrev = prev.filter(
        (u) =>
          u !== "/chicken1.png" &&
          u !== "/mutton-fresh.png" &&
          u !== "/fish.png" &&
          u !== "/egg.jpeg"
      );
      const combined = [...cleanedPrev, trimmed].slice(0, 5);
      setPImage(combined[0]);
      return combined;
    });
    setDirectImageUrl("");
    triggerFeedback("Photo URL added to product gallery!");
  };

  const handleRemoveImage = (index: number) => {
    setPImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      setPImage(updated[0] || "");
      return updated;
    });
  };

  const handleMakeCoverImage = (index: number) => {
    setPImages((prev) => {
      if (index === 0) return prev;
      const target = prev[index];
      const remaining = prev.filter((_, i) => i !== index);
      const reordered = [target, ...remaining];
      setPImage(target);
      return reordered;
    });
    triggerFeedback("Cover photo updated!");
  };

  const handleOpenAddProduct = () => {
    setEditingProdId(null);
    setPName("");
    setPCategory("Chicken");
    setPDesc("");
    setPImage("/chicken1.png");
    setPImages(["/chicken1.png"]);
    setDirectImageUrl("");
    setPFreshBadge("Cut After Order");
    setPIsBestSeller(false);
    setPWeight1Label("500g");
    setPPrice500g("199");
    setPOrig500g("249");
    setPWeight2Label("1kg");
    setPPrice1kg("349");
    setPOrig1kg("399");
    setPStock("50");
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProdId(p.id);
    setPName(p.name);
    setPCategory(p.category);
    setPDesc(p.description);
    const existingImages =
      Array.isArray(p.images) && p.images.length > 0
        ? p.images
        : p.image
        ? [p.image]
        : [];
    setPImages(existingImages.slice(0, 5));
    setPImage(existingImages[0] || p.image || "");
    setDirectImageUrl("");
    setPFreshBadge(p.freshnessBadge || "Cut After Order");
    setPIsBestSeller(Boolean(p.isBestSeller));

    const w1 = p.weights[0];
    const w2 = p.weights[1];
    setPWeight1Label(w1?.weight || (p.category === "Eggs" ? "6 Pcs" : "500g"));
    setPPrice500g(w1 ? String(w1.price) : "");
    setPOrig500g(w1?.originalPrice ? String(w1.originalPrice) : "");
    setPWeight2Label(w2?.weight || (p.category === "Eggs" ? "12 Pcs" : "1kg"));
    setPPrice1kg(w2 ? String(w2.price) : "");
    setPOrig1kg(w2?.originalPrice ? String(w2.originalPrice) : "");
    setPStock(String(p.stock ?? 50));
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const weights = [];
    if (pPrice500g) {
      weights.push({
        weight: pWeight1Label || (pCategory === "Eggs" ? "6 Pcs" : "500g"),
        price: Number(pPrice500g),
        originalPrice: pOrig500g ? Number(pOrig500g) : undefined,
      });
    }
    if (pPrice1kg) {
      weights.push({
        weight: pWeight2Label || (pCategory === "Eggs" ? "12 Pcs" : "1kg"),
        price: Number(pPrice1kg),
        originalPrice: pOrig1kg ? Number(pOrig1kg) : undefined,
      });
    }

    const fallbackImg =
      pCategory === "Mutton"
        ? "/mutton-fresh.png"
        : pCategory === "Fish"
        ? "/fish.png"
        : pCategory === "Eggs"
        ? "/egg.jpeg"
        : "/chicken1.png";

    const finalImages = pImages.length > 0 ? pImages.slice(0, 5) : [pImage || fallbackImg];

    const payload = {
      name: pName,
      category: pCategory,
      description: pDesc,
      image: finalImages[0] || fallbackImg,
      images: finalImages,
      freshnessBadge: pFreshBadge || "Cut After Order",
      isBestSeller: pIsBestSeller,
      weights,
      stock: Number(pStock) || 50,
      available: true,
    };

    if (editingProdId) {
      const res = await updateProduct(editingProdId, payload);
      if (res) {
        triggerFeedback("Product updated successfully!");
        setShowProductModal(false);
      }
    } else {
      const res = await addProduct(payload as any);
      if (res) {
        triggerFeedback("Product added to catalogue!");
        setShowProductModal(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100 text-stone-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Top Header & Alert Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-stone-200 gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-stone-900 tracking-tight">Operations & Admin Portal</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-brand-primary border border-red-200">
                Live System
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Store Manager: {user?.email} • Hyperlocal Node: Rohini Sector 22
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => void refreshOrders(true)}
              className="px-3 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <RefreshCw size={13} /> Refresh
            </button>
            <button
              onClick={handleExportOrdersExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download live orders history as Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet size={14} /> Download Excel (.xlsx)
            </button>
            <button
              onClick={handleExportOrdersCsv}
              className="px-3 py-2 bg-stone-700 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download orders as CSV"
            >
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMsg && (
          <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-brand-primary text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs">
            <CheckCircle2 size={16} className="text-brand-primary shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-stone-200 scrollbar-none text-xs">
          {[
            { id: "excel", label: `Orders Excel Sheet (${filteredOrders.length})`, icon: FileSpreadsheet },
            { id: "orders", label: `Order Cards (${filteredOrders.length})`, icon: ShoppingBag },
            { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
            { id: "customers", label: "Customer Base", icon: Users },
            { id: "franchises", label: "Franchises (10 km)", icon: Store },
            { id: "timings", label: "Business Hours & Holidays", icon: Clock },
            { id: "products", label: `Catalogue (${products.length})`, icon: Package },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-white hover:bg-stone-50 text-stone-600 border border-stone-200"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 1. OVERVIEW TAB */}
        {/* ============================================================ */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Orders Received</p>
                <p className="text-2xl font-black text-blue-700 mt-1">{overviewMetrics.receivedOrders}</p>
                <p className="text-[11px] text-stone-500 mt-1">Pending admin confirmation</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Orders Confirmed</p>
                <p className="text-2xl font-black text-brand-primary mt-1">{overviewMetrics.confirmedOrders}</p>
                <p className="text-[11px] text-stone-500 mt-1">Approved & in fulfillment</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Total Sales (₹)</p>
                <p className="text-2xl font-black text-stone-900 mt-1">₹{overviewMetrics.totalSales.toLocaleString("en-IN")}</p>
                <p className="text-[11px] text-stone-500 mt-1">Across all logged orders</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">Customer Breakdown</p>
                <p className="text-base font-bold text-stone-800 mt-1.5">
                  {overviewMetrics.registeredOrders} Reg / {overviewMetrics.guestOrders} Guest
                </p>
                <p className="text-[11px] text-stone-500 mt-0.5">{overviewMetrics.totalOrders} total orders</p>
              </div>
            </div>

            {/* Recent Orders Overview Table */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
                <h3 className="text-sm font-bold text-stone-900">Recent Customer Activity</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  View All Orders <ChevronRight size={13} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-100">
                      <th className="p-3">Order ID</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {orders.slice(0, 8).map((o) => (
                      <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="p-3 font-mono font-bold text-stone-900">{o.id}</td>
                        <td className="p-3">
                          <p className="font-semibold text-stone-800">{o.customerName || "Customer"}</p>
                          <p className="text-[10px] text-stone-400">{o.customerPhone || "—"}</p>
                        </td>
                        <td className="p-3 text-stone-500">{o.date}</td>
                        <td className="p-3 text-right font-bold text-stone-900">₹{o.total}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              o.status === "Order Confirmed"
                                ? "bg-red-50 text-brand-primary"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* EXCEL SHEET VIEW (Live Auto-Recording Spreadsheet Grid)      */}
        {/* ============================================================ */}
        {activeTab === "excel" && (
          <div className="space-y-4">
            {/* Excel Header Card */}
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-stone-900 tracking-tight">
                      Orders Live Excel Spreadsheet
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      Auto-Recorded to Excel
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Every order is permanently recorded here with full customer details, accurate GPS coordinates, Google Maps directions, and complete items catalogue.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button
                  onClick={handleExportOrdersExcel}
                  className="flex-1 lg:flex-none px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  title="Download the entire database as a formatted Microsoft Excel (.xlsx) file"
                >
                  <FileSpreadsheet size={15} />
                  Download Live Excel (.xlsx)
                </button>
                <button
                  onClick={handleExportOrdersCsv}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Download CSV report"
                >
                  <Download size={14} />
                  CSV
                </button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter spreadsheet by ID, name, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses ({orders.length})</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Order Confirmed">Order Confirmed</option>
                </select>

                <select
                  value={orderFranchiseFilter}
                  onChange={(e) => setOrderFranchiseFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Hubs / Franchises</option>
                  <option value="ROHINI-22">Rohini Sector 22 (Main)</option>
                </select>
              </div>
            </div>

            {/* High-Density Spreadsheet Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-stone-700 font-extrabold uppercase tracking-wider text-[11px] whitespace-nowrap">
                      <th className="py-3 px-3">#</th>
                      <th className="py-3 px-3">Order ID</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Customer Name</th>
                      <th className="py-3 px-3">Phone & WhatsApp</th>
                      <th className="py-3 px-3">Email</th>
                      <th className="py-3 px-3">Type</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3 text-right">Total (₹)</th>
                      <th className="py-3 px-4 min-w-[220px]">Ordered Items (Catalogue Breakdown)</th>
                      <th className="py-3 px-4 min-w-[200px]">Delivery Address</th>
                      <th className="py-3 px-4 min-w-[220px]">GPS Coordinates & Live Route</th>
                      <th className="py-3 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium text-stone-800">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="py-12 text-center text-stone-400">
                          No orders found matching the filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((o: any, idx: number) => {
                        const orderId = o.friendlyId || o.id || (o._id ? o._id.toString() : `FRSH-${idx}`);
                        const isReceived = o.status === "Order Received" || o.status === "Order Placed";
                        const isConfirmed = o.status === "Order Confirmed" || o.status === "Delivered";

                        const custPhone = o.customerPhone || o.guestPhone || "";
                        const cleanPhone = String(custPhone).replace(/\D/g, "");
                        const waNumber = cleanPhone.length === 12 ? cleanPhone.slice(2) : cleanPhone;
                        const waUrl = waNumber ? `https://wa.me/91${waNumber}?text=${encodeURIComponent(`Hello ${o.customerName || "Customer"}, this is Freshoo regarding your order ${orderId}.`)}` : "";

                        const addr = o.address || {};
                        const geo = o.geoLocation || addr.geoLocation || null;
                        const lat = geo?.latitude;
                        const lng = geo?.longitude;
                        const hasCoords = lat != null && lng != null;
                        const directionsUrl = hasCoords
                          ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${addr.addressLine || ""}, ${addr.city || "Delhi"} ${addr.pincode || ""}`)}`;
                        const pinUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : directionsUrl;

                        const itemsList = Array.isArray(o.items) ? o.items : [];

                        return (
                          <tr key={orderId} className="hover:bg-amber-50/40 transition-colors">
                            <td className="py-3 px-3 font-mono text-stone-400 text-[11px]">{idx + 1}</td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span className="font-mono font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                                {orderId}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-stone-600 text-[11px]">
                              {o.date || (o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "—")}
                            </td>
                            <td className="py-3 px-3 font-bold text-stone-900 whitespace-nowrap">
                              {o.customerName || "Customer"}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${custPhone}`}
                                  className="text-brand-primary font-bold hover:underline"
                                >
                                  {custPhone || "—"}
                                </a>
                                {waUrl && (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
                                    title="Open WhatsApp chat with customer"
                                  >
                                    WhatsApp
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-stone-600 text-[11px]">
                              {o.customerEmail || o.guestEmail ? (
                                <a
                                  href={`mailto:${o.customerEmail || o.guestEmail}`}
                                  className="hover:underline text-stone-700"
                                >
                                  {o.customerEmail || o.guestEmail}
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  o.isGuestOrder
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-blue-100 text-blue-800 border border-blue-200"
                                }`}
                              >
                                {o.isGuestOrder ? "Guest" : "Registered"}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <span
                                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                                  isReceived
                                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                                    : isConfirmed
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-stone-100 text-stone-700 border border-stone-200"
                                }`}
                              >
                                {o.status || "Order Confirmed"}
                              </span>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px]">
                              {(o.paymentMethod || "COD").toUpperCase()} ({o.paymentStatus || "Pending"})
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap font-extrabold text-stone-900 text-right text-xs">
                              ₹{o.total || 0}
                            </td>
                            <td className="py-3 px-4">
                              <div className="space-y-1">
                                {itemsList.map((it: any, iIdx: number) => {
                                  const name = it.product?.name || it.name || "Meat";
                                  const weight = it.selectedWeight || "500g";
                                  const qty = it.quantity || 1;
                                  const price = it.price || 0;
                                  return (
                                    <div key={iIdx} className="text-[11px] text-stone-700 flex items-center justify-between gap-2">
                                      <span>
                                        • <strong>{name}</strong> ({weight} × {qty})
                                      </span>
                                      <span className="font-mono text-stone-500 shrink-0">₹{price * qty}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-[11px] text-stone-700">
                              <div className="font-semibold text-stone-900">
                                {addr.tag ? `[${addr.tag}] ` : ""}{addr.addressLine || "—"}
                              </div>
                              <div className="text-stone-500 text-[10px]">
                                {addr.city || "Delhi"}{addr.state ? `, ${addr.state}` : ""} - {addr.pincode || "—"}
                              </div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {hasCoords ? (
                                <div className="space-y-1">
                                  <div className="font-mono text-[10px] text-emerald-800 font-bold">
                                    📍 {lat.toFixed(4)}, {lng.toFixed(4)}
                                    {geo?.accuracy && ` (±${Math.round(geo.accuracy)}m)`}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={directionsUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] flex items-center gap-1"
                                      title="Open Turn-by-Turn GPS Directions in Google Maps"
                                    >
                                      <Navigation size={10} /> Navigate
                                    </a>
                                    <a
                                      href={pinUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-2 py-0.5 rounded bg-white hover:bg-stone-50 text-emerald-800 border border-emerald-300 font-bold text-[10px]"
                                      title="View exact pin on Google Maps"
                                    >
                                      Pin
                                    </a>
                                  </div>
                                </div>
                              ) : (
                                <a
                                  href={directionsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-blue-600 hover:underline font-bold"
                                >
                                  Open Address Map →
                                </a>
                              )}
                            </td>
                            <td className="py-3 px-3 text-[11px] text-stone-600 max-w-[140px] truncate" title={o.instructions || ""}>
                              {o.instructions || "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
                <div>
                  Showing <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> total recorded orders
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-stone-700">
                    Total Value: <strong className="text-brand-primary">₹{overviewMetrics.totalSales}</strong>
                  </span>
                  <button
                    onClick={handleExportOrdersExcel}
                    className="text-emerald-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileSpreadsheet size={12} /> Export Current View to Excel (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ORDERS MANAGEMENT TAB (With Exactly Two Allowed Statuses) */}
        {/* ============================================================ */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by ID, name, phone, or email..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                {/* Status Filter */}
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-700 outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Order Received">Order Received</option>
                  <option value="Order Confirmed">Order Confirmed</option>
                </select>

                <button
                  onClick={handleExportOrdersCsv}
                  className="px-3.5 py-2 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download size={13} /> Export Filtered (.csv)
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <th className="p-3.5">Order ID</th>
                      <th className="p-3.5">Customer & Contact</th>
                      <th className="p-3.5">Date / Time</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5 text-right">Total Amount</th>
                      <th className="p-3.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-stone-900">{o.id}</td>
                          <td className="p-3.5">
                            <p className="font-bold text-stone-900">{o.customerName || "Customer"}</p>
                            <p className="text-[11px] text-stone-500">{o.customerPhone || o.guestPhone || "—"}</p>
                            <span className="text-[10px] uppercase font-bold text-stone-400">
                              {o.isGuestOrder ? "Guest Order" : "Registered"}
                            </span>
                          </td>
                          <td className="p-3.5 text-stone-600">{o.date}</td>
                          <td className="p-3.5 text-stone-600 max-w-xs truncate">
                            {(o.items || []).map((it) => `${it.product?.name} (${it.selectedWeight}×${it.quantity})`).join(", ")}
                          </td>
                          <td className="p-3.5 text-right font-bold text-stone-900">₹{o.total}</td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                o.status === "Order Confirmed"
                                  ? "bg-red-50 text-brand-primary border-red-200"
                                  : "bg-blue-50 text-blue-800 border-blue-200"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-stone-400 font-semibold">
                          No orders match the selected filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. CUSTOMER BASE TAB (Real MongoDB Aggregated Data) */}
        {/* ============================================================ */}
        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold text-stone-700 outline-none cursor-pointer"
                >
                  <option value="all">All Profiles</option>
                  <option value="registered">Registered Accounts</option>
                  <option value="guest">Guest Customers</option>
                </select>

                <button
                  onClick={handleExportCustomersCsv}
                  className="px-3.5 py-2 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download size={13} /> Download Customers CSV
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-stone-50 text-stone-500 font-bold border-b border-stone-200">
                      <th className="p-3.5">Customer Name</th>
                      <th className="p-3.5">Contact Details</th>
                      <th className="p-3.5 text-center">Account Type</th>
                      <th className="p-3.5 text-center">Total Orders</th>
                      <th className="p-3.5 text-center">Confirmed</th>
                      <th className="p-3.5 text-right">Lifetime Spend</th>
                      <th className="p-3.5">Last Order</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-medium">
                    {loadingCustomers ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 font-semibold">
                          <Loader2 size={20} className="animate-spin mx-auto mb-2 text-brand-primary" />
                          Aggregating customer metrics from MongoDB…
                        </td>
                      </tr>
                    ) : customers.length > 0 ? (
                      customers.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-3.5 font-bold text-stone-900">{c.name}</td>
                          <td className="p-3.5 text-stone-600">
                            <p className="font-semibold">{c.phone}</p>
                            <p className="text-[10px] text-stone-400">{c.email}</p>
                          </td>
                          <td className="p-3.5 text-center">
                            <span
                              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                c.isRegistered
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {c.isRegistered ? "Registered" : "Guest"}
                            </span>
                          </td>
                          <td className="p-3.5 text-center font-bold text-stone-800">{c.totalOrders}</td>
                          <td className="p-3.5 text-center font-bold text-brand-primary">{c.confirmedOrders}</td>
                          <td className="p-3.5 text-right font-bold text-stone-900">₹{c.totalSpend}</td>
                          <td className="p-3.5 text-stone-500">{c.lastOrderDate}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-stone-400 font-semibold">
                          No customer records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 4. FRANCHISES MANAGEMENT (10 KM HUB SERVICEABILITY) */}
        {/* ============================================================ */}
        {activeTab === "franchises" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Configured Hubs & Franchises</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Default 10 km service radius validated automatically on checkout.
                </p>
              </div>
              <button
                onClick={handleOpenAddFranchise}
                className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add New Hub
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loadingFranchises ? (
                <div className="col-span-2 p-12 text-center text-stone-400">Loading franchises…</div>
              ) : (
                franchisesList.map((f) => (
                  <div key={f.id} className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-stone-900 text-sm">{f.name}</h4>
                          <span className="font-mono text-[10px] font-bold bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
                            {f.code}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500 mt-1">{f.address}, {f.city}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          f.isActive
                            ? "bg-red-50 text-brand-primary"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {f.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-stone-50 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Delivery Radius</span>
                        <span className="font-bold text-brand-primary">{f.deliveryRadiusKm || 10} km</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Coordinates</span>
                        <span className="font-mono text-stone-700 text-[11px]">
                          {f.coordinates?.latitude?.toFixed(4)}, {f.coordinates?.longitude?.toFixed(4)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-400 font-bold uppercase block">Hours</span>
                        <span className="font-semibold text-stone-700">{f.openingTime} – {f.closingTime}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                      <button
                        onClick={() => handleToggleFranchiseStatus(f)}
                        className={`font-bold text-xs underline cursor-pointer ${
                          f.isActive ? "text-rose-600" : "text-brand-primary"
                        }`}
                      >
                        {f.isActive ? "Deactivate Hub" : "Activate Hub"}
                      </button>

                      <button
                        onClick={() => handleOpenEditFranchise(f)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit2 size={12} /> Edit Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 5. BUSINESS TIMINGS & HOLIDAYS SCHEDULE */}
        {/* ============================================================ */}
        {activeTab === "timings" && (
          <div className="max-w-xl bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900">Operating Hours & Holiday Schedule</h3>
              <p className="text-xs text-stone-500 mt-1">
                India Standard Time (Asia/Kolkata). Checkout validates these bounds independently.
              </p>
            </div>

            <form onSubmit={handleTimingsSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-600 font-bold mb-1.5">Opening Time (IST)</label>
                  <input
                    type="time"
                    value={openingTime}
                    onChange={(e) => setOpeningTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-stone-600 font-bold mb-1.5">Closing Time (IST)</label>
                  <input
                    type="time"
                    value={closingTime}
                    onChange={(e) => setClosingTime(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 outline-none"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3 border-t border-stone-100">
                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50/70">
                  <input
                    type="checkbox"
                    checked={isTempClosed}
                    onChange={(e) => setIsTempClosed(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <div>
                    <p className="font-bold text-stone-900">Temporarily Close Store</p>
                    <p className="text-[11px] text-stone-500">Blocks checkout orders immediately with maintenance notice.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl cursor-pointer hover:bg-stone-50/70">
                  <input
                    type="checkbox"
                    checked={holidayMode}
                    onChange={(e) => setHolidayMode(e.target.checked)}
                    className="w-4 h-4 accent-red-600"
                  />
                  <div>
                    <p className="font-bold text-stone-900">Holiday Closure Mode</p>
                    <p className="text-[11px] text-stone-500">Flags next opening as tomorrow.</p>
                  </div>
                </label>
              </div>

              {/* Scheduled Holidays list */}
              <div className="pt-3 border-t border-stone-100">
                <h4 className="font-bold text-stone-900 mb-2">Scheduled Closure Dates</h4>

                <div className="flex gap-2 mb-3">
                  <input
                    type="date"
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl font-semibold text-stone-800"
                  />
                  <input
                    type="text"
                    placeholder="Holiday Name (e.g. Diwali)"
                    value={newHolidayDesc}
                    onChange={(e) => setNewHolidayDesc(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddHoliday}
                    className="px-3 py-1.5 bg-stone-800 text-white font-bold rounded-xl hover:bg-stone-900 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {holidaysList.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-stone-50 border border-stone-100 rounded-lg text-xs">
                      <div>
                        <span className="font-mono font-bold text-stone-900">{h.date}</span>
                        <span className="text-stone-500 ml-2">({h.description})</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveHoliday(i)}
                        className="text-rose-600 hover:text-rose-800 font-bold"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
              >
                Save Schedule Settings
              </button>
            </form>
          </div>
        )}

        {/* ============================================================ */}
        {/* 6. PRODUCTS CATALOGUE MANAGEMENT */}
        {/* ============================================================ */}
        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Product Catalogue</h3>
                <p className="text-xs text-stone-500 mt-0.5">Manage portions, weights, and live prices.</p>
              </div>
              <button
                onClick={handleOpenAddProduct}
                className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus size={14} /> Add Product Cut
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="aspect-video rounded-xl bg-stone-100 overflow-hidden mb-3 border border-stone-100 relative">
                      <img src={p.image || "/chicken1.png"} alt={p.name} className="w-full h-full object-cover" />
                      {Array.isArray(p.images) && p.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-stone-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          📷 {p.images.length} Photos
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-stone-900 text-sm">{p.name}</h4>
                      <span className="text-[10px] font-bold uppercase bg-stone-100 px-2 py-0.5 rounded text-stone-600">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{p.description}</p>
                    <div className="mt-2 flex gap-2">
                      {p.weights.map((w, idx) => (
                        <span key={`${w.weight}-${idx}`} className="text-[11px] font-bold bg-red-50 text-brand-primary px-2 py-0.5 rounded border border-red-100">
                          {w.weight}: ₹{w.price}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                    <button
                      onClick={() => handleOpenEditProduct(p)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit2 size={12} /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Delete '${p.name}' from catalogue?`)) {
                          await deleteProduct(p.id);
                          triggerFeedback(`Product ${p.name} removed.`);
                        }
                      }}
                      className="text-rose-600 hover:text-rose-800 font-bold"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ORDER DETAILS MODAL / DRAWER */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setSelectedOrderDetails(null)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 text-xs text-stone-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-bold text-stone-900">Order {selectedOrderDetails.id}</h3>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {selectedOrderDetails.date} • {selectedOrderDetails.isGuestOrder ? "Guest Order" : "Registered"}
                  </p>
                </div>
                <button onClick={() => setSelectedOrderDetails(null)} className="text-stone-400 hover:text-stone-600">
                  <XCircle size={20} />
                </button>
              </div>

              {/* Status */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Current Status</span>
                  <span className="font-bold text-sm text-brand-primary">{selectedOrderDetails.status}</span>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-300">
                  Auto-Confirmed
                </span>
              </div>

              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Customer Details</span>
                  <p className="font-bold text-stone-900">{selectedOrderDetails.customerName || "Customer"}</p>
                  <p className="text-stone-600 mt-0.5">📞 {selectedOrderDetails.customerPhone || "—"}</p>
                  <p className="text-stone-600 mt-0.5">✉️ {selectedOrderDetails.customerEmail || "—"}</p>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase block mb-1">Delivery Address</span>
                  <p className="font-semibold text-stone-800 leading-relaxed">
                    {selectedOrderDetails.address?.flatSociety && !selectedOrderDetails.address.addressLine.includes(selectedOrderDetails.address.flatSociety)
                      ? `${selectedOrderDetails.address.flatSociety}, `
                      : ""}
                    {selectedOrderDetails.address?.addressLine}, {selectedOrderDetails.address?.city}
                    {selectedOrderDetails.address?.state ? `, ${selectedOrderDetails.address.state}` : ""} - {selectedOrderDetails.address?.pincode}
                  </p>
                  {selectedOrderDetails.geoLocation?.latitude && (
                    <a
                      href={`https://www.google.com/maps?q=${selectedOrderDetails.geoLocation.latitude},${selectedOrderDetails.geoLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-primary font-bold underline mt-1.5 inline-flex items-center gap-1"
                    >
                      <ExternalLink size={12} /> Open GPS Pin
                    </a>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase block mb-2">Order Items</span>
                <div className="divide-y divide-stone-100 border border-stone-100 rounded-xl overflow-hidden">
                  {(selectedOrderDetails.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between bg-stone-50/50">
                      <div>
                        <p className="font-bold text-stone-900">{it.product?.name}</p>
                        <p className="text-[11px] text-stone-500">{it.selectedWeight} × {it.quantity}</p>
                      </div>
                      <span className="font-bold text-stone-900">₹{it.price * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3.5 bg-red-50/50 rounded-xl border border-red-100 flex items-center justify-between text-xs font-bold text-brand-primary">
                <span>Total Collectible (COD):</span>
                <span className="text-base text-brand-primary font-extrabold">₹{selectedOrderDetails.total}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FRANCHISE ADD/EDIT MODAL */}
      <AnimatePresence>
        {showFranchiseModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setShowFranchiseModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto border border-stone-200 text-xs text-stone-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h3 className="text-sm font-bold text-stone-900">
                  {editingFranchiseId ? "Edit Franchise Hub" : "Add New Franchise Hub"}
                </h3>
                <button onClick={() => setShowFranchiseModal(false)} className="text-stone-400 hover:text-stone-600">
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleFranchiseSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Hub Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="E.g. Rohini Sector 22 Hub"
                      value={fName}
                      onChange={(e) => setFName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Hub Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="ROHINI-22"
                      value={fCode}
                      onChange={(e) => setFCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none uppercase font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-600 font-bold mb-1">Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="Pocket 4, Sector 22, Rohini, Delhi"
                    value={fAddress}
                    onChange={(e) => setFAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Latitude *</label>
                    <input
                      type="text"
                      required
                      value={fLat}
                      onChange={(e) => setFLat(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Longitude *</label>
                    <input
                      type="text"
                      required
                      value={fLng}
                      onChange={(e) => setFLng(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Radius (km) *</label>
                    <input
                      type="number"
                      required
                      value={fRadius}
                      onChange={(e) => setFRadius(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Opening Hour</label>
                    <input
                      type="time"
                      value={fOpen}
                      onChange={(e) => setFOpen(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-bold mb-1">Closing Hour</label>
                    <input
                      type="time"
                      value={fClose}
                      onChange={(e) => setFClose(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={fIsActive}
                    onChange={(e) => setFIsActive(e.target.checked)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>Active & Receiving Customer Orders</span>
                </label>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {editingFranchiseId ? "Update Franchise" : "Create Franchise"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRODUCT ADD/EDIT MODAL */}
      <AnimatePresence>
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs" onClick={() => setShowProductModal(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto border border-stone-200 text-xs text-stone-700"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    {editingProdId ? "Edit Product" : "Add Product Cut"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    Configure meat cuts, pricing tiers, upload high-res photos, and inventory.
                  </p>
                </div>
                <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                  <XCircle size={20} />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                {/* 1. PHOTO GALLERY UPLOAD & PREVIEW (UP TO 5 PHOTOS) */}
                <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-stone-900 font-extrabold text-xs">
                        Product Photos (Up to 5 Photos) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        Add up to 5 photos per product. The first photo serves as the catalog cover.
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                        pImages.length >= 5
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      }`}
                    >
                      {pImages.length}/5 Photos
                    </span>
                  </div>

                  {/* Photo Thumbnails Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {pImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="relative aspect-square rounded-xl overflow-hidden bg-white border border-stone-300 shadow-xs group"
                      >
                        <img
                          src={imgUrl}
                          alt={`Product photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = "/chicken1.png";
                          }}
                        />

                        {/* Badges / Controls */}
                        {idx === 0 ? (
                          <div className="absolute top-1 left-1 bg-brand-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                            Cover
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMakeCoverImage(idx)}
                            className="absolute top-1 left-1 bg-stone-900/80 hover:bg-brand-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Make this the primary cover photo"
                          >
                            Set Cover
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 hover:opacity-100 shadow-xs cursor-pointer transition-transform hover:scale-110"
                          title="Remove photo"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}

                    {/* Placeholder Slot for Adding */}
                    {pImages.length < 5 && (
                      <button
                        type="button"
                        disabled={pUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-stone-300 hover:border-brand-primary bg-white hover:bg-red-50/30 flex flex-col items-center justify-center gap-1 text-stone-500 hover:text-brand-primary transition-all cursor-pointer p-2"
                      >
                        {pUploading ? (
                          <Loader2 size={18} className="animate-spin text-brand-primary" />
                        ) : (
                          <>
                            <Upload size={18} />
                            <span className="text-[10px] font-bold text-center leading-tight">
                              Upload ({5 - pImages.length} left)
                            </span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {/* Direct URL Input for Additional Image */}
                  {pImages.length < 5 && (
                    <div className="pt-1">
                      <label className="block text-[10px] font-bold text-stone-600 mb-1">
                        Or Paste Image URL directly:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="/uploads/product-photo.jpg or https://..."
                          value={directImageUrl}
                          onChange={(e) => setDirectImageUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddDirectImageUrl();
                            }
                          }}
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium outline-none focus:border-brand-primary"
                        />
                        <button
                          type="button"
                          onClick={handleAddDirectImageUrl}
                          className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                        >
                          Add URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. TITLE & CATEGORY */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Product Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Chicken Curry Cut"
                      value={pName}
                      onChange={(e) => setPName(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-primary font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Category *</label>
                    <select
                      value={pCategory}
                      onChange={(e) => {
                        const newCat = e.target.value as any;
                        setPCategory(newCat);
                        if (newCat === "Eggs") {
                          setPWeight1Label("6 Pcs");
                          setPWeight2Label("12 Pcs");
                        } else if (pWeight1Label === "6 Pcs") {
                          setPWeight1Label("500g");
                          setPWeight2Label("1kg");
                        }
                      }}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-primary font-bold text-xs"
                    >
                      <option value="Chicken">Chicken</option>
                      <option value="Mutton">Mutton</option>
                      <option value="Fish">Fish</option>
                      <option value="Eggs">Eggs</option>
                    </select>
                  </div>
                </div>

                {/* 3. DESCRIPTION */}
                <div>
                  <label className="block text-stone-700 font-bold mb-1">Description & Butcher Cut Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Fresh, cleaned, and portioned upon order..."
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none focus:bg-white focus:border-brand-primary text-xs"
                  />
                </div>

                {/* 4. WEIGHT VARIANTS & STRIKETHROUGH ORIGINAL PRICES */}
                <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/50 space-y-3">
                  <div className="text-xs font-black text-stone-900 uppercase tracking-wider">
                    Weight Portions & Fixed Pricing Tiers
                  </div>

                  {/* Tier 1 */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">Portion Label</label>
                      <input
                        type="text"
                        value={pWeight1Label}
                        onChange={(e) => setPWeight1Label(e.target.value)}
                        placeholder="500g / 6 Pcs"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={pPrice500g}
                        onChange={(e) => setPPrice500g(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-black text-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">MRP/Strike (₹)</label>
                      <input
                        type="number"
                        value={pOrig500g}
                        onChange={(e) => setPOrig500g(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-400 line-through outline-none"
                      />
                    </div>
                  </div>

                  {/* Tier 2 */}
                  <div className="grid grid-cols-3 gap-2 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">Portion Label</label>
                      <input
                        type="text"
                        value={pWeight2Label}
                        onChange={(e) => setPWeight2Label(e.target.value)}
                        placeholder="1kg / 12 Pcs"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={pPrice1kg}
                        onChange={(e) => setPPrice1kg(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-black text-brand-primary outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 mb-1">MRP/Strike (₹)</label>
                      <input
                        type="number"
                        value={pOrig1kg}
                        onChange={(e) => setPOrig1kg(e.target.value)}
                        placeholder="Optional"
                        className="w-full px-2.5 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold text-stone-400 line-through outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. FRESHNESS BADGE & STOCK & BEST SELLER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Freshness Badge</label>
                    <select
                      value={pFreshBadge}
                      onChange={(e) => setPFreshBadge(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-xs"
                    >
                      <option value="Cut After Order">Cut After Order</option>
                      <option value="Farm Fresh Direct">Farm Fresh Direct</option>
                      <option value="Daily Fresh Catch">Daily Fresh Catch</option>
                      <option value="Hygienically Cleaned">Hygienically Cleaned</option>
                      <option value="100% Halal Certified">100% Halal Certified</option>
                      <option value="Tender & Juicy">Tender & Juicy</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-bold mb-1">Initial Stock Units</label>
                    <input
                      type="number"
                      value={pStock}
                      onChange={(e) => setPStock(e.target.value)}
                      placeholder="50"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl outline-none font-bold text-xs"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer font-bold pt-1">
                  <input
                    type="checkbox"
                    checked={pIsBestSeller}
                    onChange={(e) => setPIsBestSeller(e.target.checked)}
                    className="accent-red-600 w-4 h-4 cursor-pointer"
                  />
                  <span>Show as Featured / Best Seller on Homepage</span>
                </label>

                <button
                  type="submit"
                  disabled={pUploading}
                  className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer shadow-md disabled:opacity-50 text-xs uppercase tracking-wider"
                >
                  {editingProdId ? "Save Product Changes" : "Create & Add to Live Catalogue"}
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