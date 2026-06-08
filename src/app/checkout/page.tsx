"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Order } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  MapPin,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  } = useApp();

  // Selected Address State
  const [addressId, setAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Sync chosen address from Cart page session storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedAddrId = sessionStorage.getItem("freshoo_checkout_address_id");
      if (savedAddrId) {
        setAddressId(savedAddrId);
      } else if (user?.addresses && user.addresses.length > 0) {
        setAddressId(user.addresses[0].id);
      }
    }
  }, [user]);

  // Protect route
  useEffect(() => {
    if (cart.length === 0 && !placedOrder) {
      router.push("/shop");
    }
  }, [cart, placedOrder, router]);

  const activeAddress = user?.addresses.find((a) => a.id === addressId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressId) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const order = placeOrder(addressId, paymentMethod, instructions);
      if (order) {
        setPlacedOrder(order);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("freshoo_checkout_address_id");
        }
      }
      setIsSubmitting(false);
    }, 1500);
  };

  const paymentModes = [
    { id: "cod", title: "Cash on Delivery", desc: "Pay with cash/UPI at door" },
    { id: "upi", title: "Instant UPI QR (Mock)", desc: "Scan and pay using any UPI app" },
    { id: "card", title: "Credit/Debit Card (Mock)", desc: "All Indian banks supported" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <Link href="/cart" className="hover:text-brand-primary">Cart</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Checkout</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-8">
          Secure Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Details Column */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
            {/* Customer Contact */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
                Customer Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider">Name</label>
                  <input
                    type="text"
                    disabled
                    value={user?.name || "Guest User"}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1.5 font-bold uppercase tracking-wider">Phone</label>
                  <input
                    type="text"
                    disabled
                    value={user?.phone || ""}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none font-bold text-gray-600"
                  />
                </div>
              </div>
            </div>

            {/* Address Verification */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-primary" /> Delivery Address
              </h3>

              {user?.addresses && user.addresses.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr) => {
                    const isSelected = addressId === addr.id;
                    return (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => setAddressId(addr.id)}
                        className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "border-brand-primary bg-red-50/20 text-brand-primary ring-2 ring-red-100"
                            : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-black text-[9px] bg-red-50 text-brand-primary px-2 py-0.5 rounded uppercase">
                            {addr.tag}
                          </span>
                          <span className="font-medium text-xs text-gray-800">
                            {addr.addressLine}, {addr.city} - {addr.pincode}
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-brand-primary shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 bg-red-50 border border-red-100 rounded-xl">
                  <p className="font-bold text-red-600 text-xs">No address found in profile.</p>
                  <p className="text-[10px] text-gray-500 mt-1">Please add a shipping address in your My Account Dashboard.</p>
                </div>
              )}
            </div>

            {/* Delivery Instructions */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <MessageSquare size={18} className="text-brand-primary" /> Special Delivery Instructions
              </h3>
              <div>
                <textarea
                  placeholder="E.g. Ring bell only, call after reaching gate, leave with guard..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                />
              </div>
            </div>

            {/* Payment Selection */}
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
                <CreditCard size={18} className="text-brand-primary" /> Choose Payment Option
              </h3>

              <div className="space-y-3">
                {paymentModes.map((mode) => {
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id)}
                      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-red-50/20 text-brand-primary ring-2 ring-red-100"
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-gray-900 text-xs">{mode.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{mode.desc}</p>
                      </div>
                      <div className="p-1 rounded-full border border-gray-300 bg-white">
                        <div
                          className={`w-3 h-3 rounded-full transition-all ${
                            isSelected ? "bg-brand-primary scale-100" : "scale-0"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Checkout Right Side Panel summary */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
              <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
                Order Items
              </h3>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 text-xs">
                    <div className="min-w-0 flex-1 pr-4">
                      <p className="font-bold text-gray-900 truncate">{item.product.name}</p>
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
                  <span className="text-gray-900 font-bold">₹{getCartSubtotal()}</span>
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
                  <span className="text-brand-primary text-md">₹{getCartTotal()}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting || !addressId || cart.length === 0}
                onClick={handleSubmit}
                className={`w-full py-3.5 font-bold rounded-xl text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${
                  isSubmitting || !addressId || cart.length === 0
                    ? "bg-gray-300 shadow-none cursor-not-allowed"
                    : "bg-brand-primary hover:bg-red-700 hover:shadow-lg cursor-pointer"
                }`}
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Place Order (₹{getCartTotal()})</span>
                  </>
                )}
              </button>

              {!activeAddress && (
                <p className="text-[10px] text-center text-red-500 font-bold">
                  * Address must be selected to complete checkout.
                </p>
              )}
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex gap-2.5 text-emerald-800 text-[10px] leading-relaxed">
              <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Hygiene Sealed Delivery</p>
                <p className="text-gray-500 font-semibold mt-0.5">
                  Double bagged & sanitized container. Delivery boy undergoes temperature screening daily.
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
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 overflow-hidden mx-4 text-center font-semibold text-xs text-gray-700"
            >
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
                  <span className="text-gray-400">Paid Amount:</span>
                  <span className="text-brand-primary">₹{placedOrder.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Point:</span>
                  <span className="text-gray-900 truncate max-w-[180px]">
                    {placedOrder.address.addressLine}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Thank you for choosing Freshoo. Your order details are logged. Our butchers will now custom chop your cuts and dispatch under cold containment.
              </p>

              <div className="flex gap-3 mt-8">
                <Link
                  href="/"
                  className="flex-1 py-3 text-center border border-gray-200 hover:bg-gray-50 font-bold rounded-xl text-xs text-gray-700 transition-colors"
                >
                  Go to Home
                </Link>
                <Link
                  href="/account"
                  className="flex-1 py-3 text-center bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-colors"
                >
                  View Order Status
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
