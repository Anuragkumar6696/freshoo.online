"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Order, GeoLocation, Address } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  MessageSquare,
  Sparkles,
  Navigation,
  Loader2,
  User,
  Phone,
  Mail,
  Home,
  Building2,
  Map as MapIcon,
  LogIn,
  X,
  AlertCircle,
  Truck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AddressMode = "saved" | "new";
type AddressTag = "Home" | "Work" | "Other";

const isEmailValid = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
const isPhoneValid = (phone: string) => phone.replace(/\D/g, "").length >= 10;
const isPincodeValid = (pincode: string) =>
  /^\d{6}$/.test(pincode.replace(/\D/g, ""));
const isNameValid = (name: string) => name.trim().length >= 2;
const isAddressValid = (addr: string) => addr.trim().length >= 5;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    user,
    placeOrder,
    getCartSubtotal,
    getCartTotal,
    getCartDiscount,
    appliedCoupon,
    checkoutGeoLocation,
    setCheckoutGeoLocation,
    captureGeoLocation,
    serviceability,
    selectedFranchise,
  } = useApp();

  // Customer details (editable whether user is registered or guest)
  const [customerName, setCustomerName] = useState(user?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone ?? "");
  const [customerEmail, setCustomerEmail] = useState(user?.email ?? "");

  // Address mode + selected saved address id
  const [addressMode, setAddressMode] = useState<AddressMode>(
    user?.addresses && user.addresses.length > 0 ? "saved" : "new"
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // New address form
  const [newAddressTag, setNewAddressTag] = useState<AddressTag>("Home");
  const [newAddressLine, setNewAddressLine] = useState("");
  const [newAddressCity, setNewAddressCity] = useState("Delhi");
  const [newAddressPincode, setNewAddressPincode] = useState("");

  // Delivery instructions
  const [instructions, setInstructions] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Geolocation capture state
  const [geoCapturing, setGeoCapturing] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Auth modal fallback option
  const [authOpen, setAuthOpen] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync initial fields if user changes
  useEffect(() => {
    if (user) {
      setCustomerName((prev) => prev || user.name);
      setCustomerPhone((prev) => prev || user.phone);
      setCustomerEmail((prev) => prev || user.email);
      if (
        (addressMode === "saved" || !selectedAddressId) &&
        user.addresses.length > 0
      ) {
        setSelectedAddressId(user.addresses[0].id);
      }
    }
  }, [user, addressMode, selectedAddressId]);

  // Protect route: empty cart -> redirect to shop ONLY when no order has been placed & not submitting
  useEffect(() => {
    if (cart.length === 0 && !placedOrder && !isSubmitting) {
      router.push("/shop");
    }
  }, [cart.length, placedOrder, isSubmitting, router]);

  const activeSavedAddress = useMemo(
    () => user?.addresses.find((a) => a.id === selectedAddressId) ?? null,
    [user, selectedAddressId]
  );

  const currentGeo: GeoLocation | null = checkoutGeoLocation;

  const triggerGeoCapture = async () => {
    setGeoCapturing(true);
    setGeoError(null);
    const geo = await captureGeoLocation();
    setGeoCapturing(false);
    if (!geo) {
      setGeoError(
        "Unable to access device location. You can still enter your address manually."
      );
    } else if (geo.addressLabel && !newAddressLine) {
      // Auto-populate address field from reverse geocoded components
      setNewAddressLine(geo.addressLabel);
    }
  };

  const clearGeo = () => {
    setCheckoutGeoLocation(null);
    localStorage.removeItem("freshoo_checkout_geo");
    setGeoError(null);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};

    if (!isNameValid(customerName))
      e.customerName = "Please enter your full name (minimum 2 characters).";
    if (!isPhoneValid(customerPhone))
      e.customerPhone = "Please enter a valid 10-digit mobile number.";
    if (!isEmailValid(customerEmail))
      e.customerEmail = "Please enter a valid email address.";

    if (addressMode === "saved") {
      if (!selectedAddressId || !activeSavedAddress) {
        e.address = "Please select a delivery address.";
      }
    } else {
      if (!isAddressValid(newAddressLine)) {
        e.address =
          "Please enter your street address (flat/house no., street, sector, locality).";
      }
      if (!isPincodeValid(newAddressPincode)) {
        e.pincode = "Please enter a valid 6-digit delivery pincode.";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resolveAddressForOrder = (): Omit<Address, "id"> | null => {
    if (addressMode === "saved") {
      if (!activeSavedAddress) return null;
      return {
        tag: activeSavedAddress.tag,
        addressLine: activeSavedAddress.addressLine,
        city: activeSavedAddress.city,
        pincode: activeSavedAddress.pincode,
        geoLocation: activeSavedAddress.geoLocation ?? null,
      };
    }
    return {
      tag: newAddressTag,
      addressLine: newAddressLine.trim(),
      city: newAddressCity.trim(),
      pincode: newAddressPincode.replace(/\D/g, ""),
      geoLocation: currentGeo ?? null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 100, behavior: "smooth" });
      }
      return;
    }

    const addressPayload = resolveAddressForOrder();
    if (!addressPayload) return;

    setIsSubmitting(true);
    const isGuest = !user;

    const addressWithGeo = {
      ...addressPayload,
      geoLocation: addressPayload.geoLocation ?? currentGeo ?? null,
    };

    try {
      const order = await placeOrder(addressWithGeo, "cod", {
        instructions: instructions.trim() || undefined,
        geoLocation: currentGeo ?? null,
        isGuest,
        guestDetails: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
        },
      });

      if (order) {
        // KEEP popup visible permanently until customer explicit action
        // No automatic dismissal timers!
        setPlacedOrder(order);
        setSelectedAddressId("");
        setNewAddressLine("");
        setNewAddressPincode("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = !isSubmitting && cart.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 w-full max-w-full overflow-x-hidden text-stone-800">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Progress Bar / Breadcrumbs */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Checkout</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Cash on Delivery • Free 20-min express delivery in Rohini Sector 22 & 10 km hub radius
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/cart" className="hover:text-brand-primary">Cart</Link>
            <ChevronRight size={14} className="text-stone-300" />
            <span className="text-brand-primary font-bold">Delivery & Confirmation</span>
          </div>
        </div>

        {/* Guest vs Registered Banner */}
        {!user && (
          <div className="mb-6 p-4 bg-red-50/60 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-brand-primary text-white shrink-0">
                <LogIn size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-stone-900">
                  Guest Checkout Enabled
                </p>
                <p className="text-[11px] text-brand-primary">
                  No account needed. Or sign in to load your saved delivery addresses.
                </p>
              </div>
            </div>
            <button
              onClick={() => setAuthOpen(true)}
              className="text-xs font-bold px-4 py-2 bg-white text-brand-primary border border-red-300 rounded-xl hover:bg-red-50 transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Sign In to Account
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer & Address Information */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 mb-5">
                <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Contact Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your full name"
                      className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all ${
                        errors.customerName ? "border-rose-400 focus:border-rose-500" : "border-stone-200 focus:border-brand-primary"
                      }`}
                    />
                  </div>
                  {errors.customerName && (
                    <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.customerName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Mobile Number <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all ${
                        errors.customerPhone ? "border-rose-400 focus:border-rose-500" : "border-stone-200 focus:border-brand-primary"
                      }`}
                    />
                  </div>
                  {errors.customerPhone && (
                    <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.customerPhone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Email Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className={`w-full pl-10 pr-4 py-2.5 bg-stone-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all ${
                        errors.customerEmail ? "border-rose-400 focus:border-rose-500" : "border-stone-200 focus:border-brand-primary"
                      }`}
                    />
                  </div>
                  {errors.customerEmail && (
                    <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.customerEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Location & GPS */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                    2
                  </div>
                  <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Delivery Address
                  </h2>
                </div>

                {user && user.addresses.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAddressMode("saved")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        addressMode === "saved"
                          ? "bg-brand-primary text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      Saved Addresses
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddressMode("new")}
                      className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        addressMode === "new"
                          ? "bg-brand-primary text-white"
                          : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                      }`}
                    >
                      Add New Address
                    </button>
                  </div>
                )}
              </div>

              {/* GPS Location Pin helper */}
              <div className="mb-5 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <MapPin size={18} className="text-brand-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">
                        Attach Exact GPS Coordinates
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                        Helps delivery riders reach your doorstep without phone calls.
                      </p>
                      {currentGeo?.latitude && (
                        <p className="text-[11px] font-mono font-medium text-brand-primary mt-1">
                          📍 Pin: {currentGeo.latitude.toFixed(4)}, {currentGeo.longitude?.toFixed(4)}
                          {currentGeo.accuracy && ` (±${Math.round(currentGeo.accuracy)}m)`}
                        </p>
                      )}
                    </div>
                  </div>

                  {currentGeo?.latitude ? (
                    <button
                      type="button"
                      onClick={clearGeo}
                      className="text-[11px] font-bold text-stone-500 hover:text-stone-800 underline shrink-0 cursor-pointer"
                    >
                      Remove Pin
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={triggerGeoCapture}
                      disabled={geoCapturing}
                      className="px-3 py-1.5 bg-brand-primary hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                    >
                      {geoCapturing ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          Pinning…
                        </>
                      ) : (
                        <>
                          <Navigation size={13} />
                          Use GPS
                        </>
                      )}
                    </button>
                  )}
                </div>

                {geoError && (
                  <p className="text-[11px] text-amber-700 mt-2 font-medium flex items-center gap-1">
                    <AlertCircle size={13} /> {geoError}
                  </p>
                )}
              </div>

              {/* Saved Address Selector */}
              {addressMode === "saved" && user && user.addresses.length > 0 && (
                <div className="space-y-3 mb-5">
                  <label className="block text-xs font-semibold text-stone-700">
                    Select Address <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {user.addresses.map((a, aIdx) => (
                      <label
                        key={a.id || `addr-${aIdx}`}
                        className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
                          selectedAddressId === a.id
                            ? "border-brand-primary bg-red-50/40 text-stone-900"
                            : "border-stone-200 hover:border-stone-300 bg-white text-stone-700"
                        }`}
                      >
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={selectedAddressId === a.id}
                          onChange={() => setSelectedAddressId(a.id)}
                          className="mt-1 accent-red-600"
                        />
                        <div className="flex-1">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-700 mb-1">
                            {a.tag}
                          </span>
                          <p className="text-xs font-semibold leading-relaxed">
                            {a.addressLine}, {a.city} - {a.pincode}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.address && (
                    <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.address}</p>
                  )}
                </div>
              )}

              {/* New Address Fields */}
              {addressMode === "new" && (
                <div className="space-y-4">
                  {/* Address Tag */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-2">
                      Address Type
                    </label>
                    <div className="flex gap-2">
                      {(["Home", "Work", "Other"] as AddressTag[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewAddressTag(t)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                            newAddressTag === t
                              ? "bg-brand-primary text-white border-brand-primary"
                              : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                          }`}
                        >
                          {t === "Home" && <Home size={13} />}
                          {t === "Work" && <Building2 size={13} />}
                          {t === "Other" && <MapIcon size={13} />}
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Street Address */}
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Delivery Address (House/Flat No., Street, Sector, Locality) <span className="text-rose-600">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      placeholder="E.g. Flat 302, Pocket 4, Sector 22, Rohini"
                      className={`w-full p-3 bg-stone-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all ${
                        errors.address ? "border-rose-400 focus:border-rose-500" : "border-stone-200 focus:border-brand-primary"
                      }`}
                    />
                    {errors.address && (
                      <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        City / Region
                      </label>
                      <input
                        type="text"
                        value={newAddressCity}
                        onChange={(e) => setNewAddressCity(e.target.value)}
                        placeholder="Enter delivery city"
                        className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Pincode <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={newAddressPincode}
                        onChange={(e) => setNewAddressPincode(e.target.value)}
                        placeholder="6-digit pincode (e.g. 110086)"
                        maxLength={6}
                        className={`w-full px-3.5 py-2.5 bg-stone-50 border rounded-xl text-xs font-medium focus:bg-white focus:outline-none transition-all ${
                          errors.pincode ? "border-rose-400 focus:border-rose-500" : "border-stone-200 focus:border-brand-primary"
                        }`}
                      />
                      {errors.pincode && (
                        <p className="text-[11px] font-medium text-rose-600 mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Instructions */}
              <div className="mt-5 pt-4 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-3 text-stone-400" />
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Add delivery instructions (e.g. leave with guard, call on arrival)"
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:bg-white focus:border-brand-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100 mb-4">
                <div className="w-6 h-6 rounded-full bg-brand-primary text-white text-xs font-bold flex items-center justify-center">
                  3
                </div>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Payment Method
                </h2>
              </div>

              <div className="p-4 border border-brand-primary bg-red-50/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-brand-primary text-white">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900">
                      Cash on Delivery (COD) / UPI at Doorstep
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Inspect your fresh meat sealed packaging before paying.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 bg-red-100 text-brand-primary rounded-md">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Place Order */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs sticky top-24">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider pb-3 border-b border-stone-100 mb-4">
                Order Summary ({cart.reduce((s, it) => s + it.quantity, 0)} Items)
              </h2>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5 divide-y divide-stone-100">
                {cart.map((item, index) => (
                  <div
                    key={item.id ? `${item.id}-${index}` : `checkout-item-${item.product?.id || 'prod'}-${item.selectedWeight || ''}-${index}`}
                    className="pt-2.5 first:pt-0 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200/60">
                        <img
                          src={item.product?.image || "/chicken1.png"}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 line-clamp-1">{item.product?.name}</p>
                        <p className="text-[11px] text-stone-500">
                          {item.selectedWeight} × {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900 shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Details */}
              <div className="space-y-2 py-4 border-t border-b border-stone-100 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Item Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{getCartSubtotal()}</span>
                </div>
                {getCartDiscount() > 0 && (
                  <div className="flex justify-between text-brand-primary font-semibold">
                    <span>Discount</span>
                    <span>-₹{getCartDiscount()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-brand-primary">
                  <span className="flex items-center gap-1 font-semibold">
                    <Truck size={13} /> Express Delivery (20 Mins)
                  </span>
                  <span className="font-extrabold uppercase text-[11px] bg-red-50 px-2 py-0.5 rounded">
                    FREE
                  </span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-baseline pt-4 pb-5">
                <div>
                  <span className="text-sm font-bold text-stone-900">Grand Total</span>
                  <p className="text-[10px] text-stone-400">Inclusive of all local taxes</p>
                </div>
                <span className="text-xl font-extrabold text-brand-primary">
                  ₹{getCartTotal()}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`w-full py-3.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  canSubmit
                    ? "bg-brand-primary hover:bg-red-700 text-white shadow-red-700/20"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Placing Order & Logging to Freshoo…
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Place Order (₹{getCartTotal()})
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-[10px] text-stone-400 flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-brand-primary" />
                  Hygienic cold chain packaging • 100% money back guarantee
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* CONFIRMATION POPUP MODAL (FIXED: Visible until explicit user action, no auto-redirects) */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-xs"
              onClick={() => {
                // Clicking backdrop keeps user on page or lets them close explicitly
              }}
            />

            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 16 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-center text-xs text-stone-700 border border-stone-100"
            >
              <button
                onClick={() => {
                  setPlacedOrder(null);
                  router.push("/");
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="inline-flex p-3 rounded-full bg-red-50 text-brand-primary mb-3">
                <CheckCircle2 size={36} />
              </div>

              <h3 className="text-xl font-bold text-stone-900">
                Order Received Successfully!
              </h3>
              <p className="text-xs text-brand-primary font-semibold mt-1 flex items-center justify-center gap-1">
                <Sparkles size={13} /> Status: Order Received • Fresh Cut Initiated
              </p>

              {/* Order Details Card */}
              <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-4 my-5 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Order ID:</span>
                  <span className="font-bold text-stone-900 font-mono">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Date & Time:</span>
                  <span className="font-semibold text-stone-900">{placedOrder.date}</span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Customer:</span>
                  <span className="font-semibold text-stone-900">
                    {placedOrder.customerName ?? "Customer"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Payment:</span>
                  <span className="font-bold text-brand-primary uppercase">
                    {placedOrder.paymentMethod.toUpperCase()} (Collect ₹{placedOrder.total})
                  </span>
                </div>
                <div className="flex justify-between border-b border-stone-200 pb-2">
                  <span className="text-stone-500">Total Amount:</span>
                  <span className="font-bold text-brand-primary">
                    ₹{placedOrder.total}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2 pt-0.5">
                  <span className="text-stone-500 shrink-0">Delivery Point:</span>
                  <span className="font-medium text-stone-900 text-right leading-relaxed max-w-[220px]">
                    {placedOrder.address.addressLine}, {placedOrder.address.city} - {placedOrder.address.pincode}
                  </span>
                </div>
                {placedOrder.geoLocation?.latitude != null && (
                  <div className="flex justify-between items-center pt-2 border-t border-stone-200 mt-1">
                    <span className="text-stone-500">GPS Pin Attached:</span>
                    <span className="text-[10px] font-mono font-bold text-brand-primary bg-red-100 px-2 py-0.5 rounded">
                      YES ({placedOrder.geoLocation.latitude.toFixed(4)}, {placedOrder.geoLocation.longitude?.toFixed(4)})
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Thank you for ordering with Freshoo! Both your customer receipt and our internal hub dispatch alert have been prepared.
              </p>

              {/* Action Buttons: Explicit customer choice */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Link
                  href={`/order/${placedOrder.id}`}
                  className="flex-1 py-3 text-center bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Track Order Online
                </Link>
                <Link
                  href="/shop"
                  className="flex-1 py-3 text-center border border-stone-200 hover:bg-stone-50 text-stone-800 font-bold rounded-xl text-xs transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      <Footer />
    </div>
  );
}
