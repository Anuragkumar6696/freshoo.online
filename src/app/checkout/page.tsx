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
const isAddressValid = (addr: string) => addr.trim().length >= 10;

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
  const [newAddressCity] = useState("Delhi");
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

  // Auto-trigger geolocation capture on checkout page load
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      !checkoutGeoLocation &&
      "geolocation" in navigator
    ) {
      const t = setTimeout(async () => {
        setGeoCapturing(true);
        const geo = await captureGeoLocation();
        setGeoCapturing(false);
        if (!geo) {
          setGeoError(
            "Location access was denied. You can still checkout; however, sharing your location helps ensure faster and accurate delivery."
          );
        }
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Protect route: empty cart -> redirect to shop
  useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      router.push("/shop");
    }
  }, [cart, placedOrder, router]);

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
        "Unable to capture location. Please ensure browser permissions are granted and try again."
      );
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
      e.customerName = "Please enter your full name (min 2 characters).";
    if (!isPhoneValid(customerPhone))
      e.customerPhone = "Please enter a valid 10-digit mobile number.";
    if (!isEmailValid(customerEmail))
      e.customerEmail = "Please enter a valid email address.";

    if (addressMode === "saved") {
      if (!selectedAddressId || !activeSavedAddress) {
        e.address = "Please select a saved delivery address.";
      }
    } else {
      if (!isAddressValid(newAddressLine)) {
        e.address =
          "Please enter your full street address (house/building, street, sector, locality).";
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
      city: newAddressCity,
      pincode: newAddressPincode.replace(/\D/g, ""),
      geoLocation: currentGeo ?? null,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const addressPayload = resolveAddressForOrder();
    if (!addressPayload) return;

    setIsSubmitting(true);

    const isGuest = !user;

    // Ensure address has geotag where possible
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
        setPlacedOrder(order);
        setSelectedAddressId("");
        setNewAddressLine("");
        setNewAddressPincode("");
        // Auto redirect home after 2 seconds, close popup
        setTimeout(() => {
          setPlacedOrder(null);
          router.push("/");
        }, 2000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit =
    !isSubmitting &&
    cart.length > 0 &&
    (addressMode === "saved"
      ? !!selectedAddressId && !!activeSavedAddress
      : isAddressValid(newAddressLine) && isPincodeValid(newAddressPincode));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link href="/cart" className="hover:text-brand-primary">
            Cart
          </Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Checkout</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              Secure Checkout
            </h1>
            <p className="text-xs text-gray-500 mt-1.5 font-semibold">
              {user
                ? `Signed in as ${user.name}. You may also edit your details below.`
                : "Checking out as a Guest — no account required. Your details are used only for delivery."}
            </p>
          </div>
          {!user && (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-brand-primary hover:bg-red-50/40 text-xs font-extrabold text-gray-700 hover:text-brand-primary transition-colors whitespace-nowrap"
            >
              <LogIn size={14} />
              Sign In Instead
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            {/* Guest / Customer Identity Details */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <User size={18} className="text-brand-primary" /> Contact &
                Customer Details
                {user && (
                  <span className="ml-auto text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    Logged In
                  </span>
                )}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={15}
                    />
                    <input
                      type="text"
                      placeholder="E.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border rounded-xl outline-none font-bold text-gray-800 transition-all ${
                        errors.customerName
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:bg-white"
                          : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-red-50 focus:bg-white"
                      }`}
                    />
                  </div>
                  {errors.customerName && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">
                      {errors.customerName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                    Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                      size={15}
                    />
                    <span className="absolute left-9 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400 select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={customerPhone.replace(/^\+91\s?/, "")}
                      onChange={(e) =>
                        setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      maxLength={10}
                      className={`w-full pl-[72px] pr-3.5 py-2.5 bg-gray-50 border rounded-xl outline-none font-bold text-gray-800 transition-all ${
                        errors.customerPhone
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:bg-white"
                          : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-red-50 focus:bg-white"
                      }`}
                    />
                  </div>
                  {errors.customerPhone && (
                    <p className="mt-1.5 text-[10px] font-bold text-red-500">
                      {errors.customerPhone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                  <input
                    type="email"
                    placeholder="you@example.com — for order updates"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className={`w-full pl-10 pr-3.5 py-2.5 bg-gray-50 border rounded-xl outline-none font-bold text-gray-800 transition-all ${
                      errors.customerEmail
                        ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:bg-white"
                        : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-red-50 focus:bg-white"
                    }`}
                  />
                </div>
                {errors.customerEmail && (
                  <p className="mt-1.5 text-[10px] font-bold text-red-500">
                    {errors.customerEmail}
                  </p>
                )}
              </div>
            </div>

            {/* Exact Geolocation Capture */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <Navigation size={18} className="text-brand-primary" /> Exact
                Delivery Location (GPS)
              </h3>

              {geoCapturing ? (
                <div className="flex items-center gap-3 p-4 bg-sky-50 border border-sky-100 rounded-xl text-sky-700">
                  <Loader2 size={18} className="animate-spin shrink-0" />
                  <div>
                    <p className="font-extrabold">Capturing your GPS location…</p>
                    <p className="text-[11px] font-medium text-sky-600 mt-0.5">
                      This helps our delivery partner reach your doorstep precisely.
                    </p>
                  </div>
                </div>
              ) : currentGeo && currentGeo.latitude !== null ? (
                <div className="flex items-start justify-between gap-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-emerald-100 shrink-0 mt-0.5">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-extrabold">GPS Location Locked</p>
                      <p className="text-[11px] font-medium text-emerald-700 mt-0.5 font-mono">
                        {currentGeo.latitude.toFixed(5)},{" "}
                        {currentGeo.longitude.toFixed(5)}
                      </p>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        Accuracy: ~{Math.round(currentGeo.accuracy ?? 999)}m •
                        Captured{" "}
                        {currentGeo.capturedAt
                          ? new Date(currentGeo.capturedAt).toLocaleTimeString(
                              "en-IN"
                            )
                          : "just now"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={triggerGeoCapture}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white border border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                    >
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={clearGeo}
                      className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 hover:text-emerald-800 transition-colors opacity-80"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={`p-4 border rounded-xl ${
                    geoError
                      ? "bg-amber-50 border-amber-100 text-amber-800"
                      : "bg-gray-50 border-gray-100 text-gray-600"
                  }`}
                >
                  {geoError ? (
                    <p className="text-[11px] font-semibold leading-relaxed">
                      {geoError}
                    </p>
                  ) : (
                    <p className="text-[11px] font-semibold leading-relaxed">
                      Share your live location so we can pinpoint your exact
                      building/house for a quicker and contactless drop.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={triggerGeoCapture}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-primary hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider shadow-sm transition-colors"
                  >
                    <Navigation size={13} />{" "}
                    {geoError ? "Grant Access & Retry" : "Capture Exact GPS Now"}
                  </button>
                </div>
              )}
            </div>

            {/* Delivery Address */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-primary" /> Delivery
                Address
              </h3>

              {user && user.addresses.length > 0 && (
                <div className="flex bg-gray-100 p-1 rounded-xl text-[11px] font-black uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setAddressMode("saved")}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      addressMode === "saved"
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Saved Addresses
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode("new")}
                    className={`flex-1 py-2 rounded-lg transition-all ${
                      addressMode === "new"
                        ? "bg-white text-brand-primary shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    New Address
                  </button>
                </div>
              )}

              {addressMode === "saved" && user?.addresses && (
                <>
                  <div className="space-y-3">
                    {user.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`w-full text-left p-4 rounded-xl border flex items-start justify-between transition-all ${
                            isSelected
                              ? "border-brand-primary bg-red-50/20 ring-2 ring-red-100"
                              : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            <div
                              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                                isSelected
                                  ? "bg-brand-primary text-white"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {addr.tag === "Work" ? (
                                <Building2 size={14} />
                              ) : addr.tag === "Other" ? (
                                <MapIcon size={14} />
                              ) : (
                                <Home size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="font-black text-[9px] uppercase px-2 py-0.5 rounded bg-red-50 text-brand-primary">
                                  {addr.tag}
                                </span>
                              </div>
                              <p className="font-medium text-xs text-gray-800 leading-relaxed break-words">
                                {addr.addressLine}, {addr.city} - {addr.pincode}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2
                              size={16}
                              className="text-brand-primary shrink-0 mt-1"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {errors.address && (
                    <p className="text-[10px] font-bold text-red-500">
                      {errors.address}
                    </p>
                  )}
                </>
              )}

              {addressMode === "new" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-400 mb-2 font-bold uppercase tracking-wider text-[10px]">
                      Address Label
                    </label>
                    <div className="flex gap-2">
                      {(["Home", "Work", "Other"] as AddressTag[]).map((t) => {
                        const Icon =
                          t === "Work"
                            ? Building2
                            : t === "Other"
                            ? MapIcon
                            : Home;
                        const active = newAddressTag === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setNewAddressTag(t)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg text-[11px] font-black uppercase transition-all ${
                              active
                                ? "border-brand-primary bg-red-50 text-brand-primary"
                                : "border-gray-200 hover:bg-gray-50 text-gray-600"
                            }`}
                          >
                            <Icon size={13} />
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                      Street / Building / House Address *
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Flat / House No., Building Name, Street, Sector / Locality (e.g., H-16/22, Pocket 22, Sector 22, Rohini)"
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      className={`w-full p-3 bg-gray-50 border rounded-xl outline-none font-medium transition-all resize-none ${
                        errors.address
                          ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:bg-white"
                          : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-red-50 focus:bg-white"
                      }`}
                    />
                    {errors.address && (
                      <p className="mt-1.5 text-[10px] font-bold text-red-500">
                        {errors.address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        City
                      </label>
                      <input
                        type="text"
                        disabled
                        value={newAddressCity}
                        className="w-full px-3 py-2.5 bg-gray-100 border border-gray-200 rounded-xl outline-none font-bold text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider text-[10px]">
                        Pincode *
                      </label>
                      <input
                        type="text"
                        placeholder="110086"
                        maxLength={6}
                        value={newAddressPincode}
                        onChange={(e) =>
                          setNewAddressPincode(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        className={`w-full px-3 py-2.5 bg-gray-50 border rounded-xl outline-none font-bold transition-all ${
                          errors.pincode
                            ? "border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:bg-white"
                            : "border-gray-200 focus:border-brand-primary focus:ring-2 focus:ring-red-50 focus:bg-white"
                        }`}
                      />
                      {errors.pincode && (
                        <p className="mt-1.5 text-[10px] font-bold text-red-500">
                          {errors.pincode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <MessageSquare size={18} className="text-brand-primary" />{" "}
                Special Delivery Instructions
              </h3>
              <div>
                <textarea
                  placeholder="E.g. Ring bell only, call after reaching gate, hand to security guard, avoid calling post 11 PM…"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-2 focus:ring-red-50 outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Payment Method - COD ONLY */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <CreditCard size={18} className="text-brand-primary" /> Payment
                Method
              </h3>

              <div className="space-y-3">
                <div className="w-full p-4 rounded-xl border-2 border-brand-primary bg-red-50/30 ring-2 ring-red-100 text-brand-primary flex items-start justify-between">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-brand-primary text-white shrink-0">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-gray-900 text-xs flex items-center gap-2 flex-wrap">
                        Cash on Delivery (COD)
                        <span className="px-2 py-0.5 rounded-full bg-brand-primary text-white text-[9px] font-black uppercase tracking-wider">
                          Recommended
                        </span>
                      </p>
                      <p className="text-[11px] font-medium text-gray-500 mt-1 leading-relaxed">
                        Pay with cash or UPI when your order arrives at your
                        doorstep. No prepayment required — 100% secure.
                      </p>
                    </div>
                  </div>
                  <div className="p-1 rounded-full bg-white border border-brand-primary shrink-0 mt-1">
                    <div className="w-3 h-3 rounded-full bg-brand-primary" />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-dashed border-gray-200 text-[10px] font-bold text-gray-400 text-center">
                  Prepaid methods (UPI, Cards, Wallets) will be enabled soon.
                </div>
              </div>
            </div>
          </form>

          {/* Right Side Summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700 lg:sticky lg:top-28">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
                Order Summary
              </h3>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-bold text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold mt-0.5">
                        {item.selectedWeight} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-extrabold text-gray-900 shrink-0">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <hr className="border-gray-100" />

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Cart Subtotal</span>
                  <span className="text-gray-900 font-bold">
                    ₹{getCartSubtotal()}
                  </span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-xs text-emerald-600 font-bold">
                    <span>Coupon Applied</span>
                    <span>-₹{getCartDiscount()}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Delivery Charges</span>
                  <span className="text-emerald-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total</span>
                  <span className="text-brand-primary text-md">
                    ₹{getCartTotal()}
                  </span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canSubmit || isSubmitting}
                onClick={handleSubmit}
                className={`w-full py-3.5 font-extrabold rounded-xl text-xs text-white shadow-md flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
                  !canSubmit || isSubmitting
                    ? "bg-gray-300 shadow-none cursor-not-allowed"
                    : "bg-brand-primary hover:bg-red-700 hover:shadow-lg cursor-pointer active:scale-[0.99]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Confirming Order…
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    Place Order • ₹{getCartTotal()}
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-gray-500 font-bold leading-relaxed">
                By placing this order you agree to Freshoo&apos;s hygiene
                promise and hyperlocal delivery terms.
              </p>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-2.5 text-emerald-800 text-[10px] leading-relaxed">
              <ShieldCheck
                size={18}
                className="text-emerald-600 shrink-0"
              />
              <div>
                <p className="font-bold">Hygiene Sealed Delivery</p>
                <p className="text-gray-500 font-semibold mt-0.5">
                  Double bagged & sanitized container. Delivery boy undergoes
                  temperature screening daily.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {placedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden mx-4 my-6 text-center font-semibold text-xs text-gray-700"
            >
              <button
                onClick={() => router.push("/")}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600 mb-4">
                <CheckCircle2 size={36} className="animate-pulse" />
              </div>

              <h3 className="font-display font-black text-2xl text-gray-900">
                Order Placed Successfully!
              </h3>
              <p className="text-xs text-emerald-600 font-bold mt-1 uppercase tracking-wide flex items-center justify-center gap-1">
                <Sparkles size={12} /> Fresh Cut Initiated
              </p>

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 my-6 text-left space-y-2.5 font-bold">
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-gray-400">Order ID:</span>
                  <span className="text-gray-900">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-gray-400">Date & Time:</span>
                  <span className="text-gray-900">{placedOrder.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-gray-400">Customer:</span>
                  <span className="text-gray-900">
                    {placedOrder.customerName ?? "Guest"}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-gray-400">Payment:</span>
                  <span className="text-brand-primary uppercase font-extrabold">
                    {placedOrder.paymentMethod.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="text-gray-400">Paid Amount:</span>
                  <span className="text-brand-primary">
                    ₹{placedOrder.total}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-400 shrink-0">
                    Delivery Point:
                  </span>
                  <span className="text-gray-900 text-right leading-relaxed break-all max-w-[180px]">
                    {placedOrder.address.addressLine}, {placedOrder.address.city}
                    {" - "}{placedOrder.address.pincode}
                  </span>
                </div>
                {placedOrder.geoLocation?.latitude !== null &&
                  placedOrder.geoLocation?.latitude !== undefined && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-1">
                      <span className="text-gray-400">GPS Attached:</span>
                      <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        YES
                      </span>
                    </div>
                  )}
              </div>

              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Thank you for choosing Freshoo. Our butchers will now custom
                chop your cuts and dispatch under cold containment. Order
                receipt has been prepared for the store admin.
              </p>

              <div className="flex gap-3 mt-8">
                <Link
                  href="/"
                  className="flex-1 py-3 text-center border border-gray-200 hover:bg-gray-50 font-extrabold rounded-xl text-xs text-gray-700 transition-colors"
                >
                  Go to Home
                </Link>
                <Link
                  href={placedOrder.isGuestOrder ? "/shop" : "/account"}
                  className="flex-1 py-3 text-center bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-colors"
                >
                  {placedOrder.isGuestOrder
                    ? "Order More"
                    : "View Order Status"}
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
