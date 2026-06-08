"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  Tag,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    selectedLocation,
    updateCartQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartTotal,
    getCartDiscount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    user,
    isStoreOpen,
    storeSettings,
  } = useApp();

  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState("");

  // Set default address
  React.useEffect(() => {
    if (user?.addresses && user.addresses.length > 0 && !selectedAddressId) {
      setSelectedAddressId(user.addresses[0].id);
    }
  }, [user, selectedAddressId]);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess(false);

    if (!couponCode.trim()) return;

    const success = applyCoupon(couponCode);
    if (success) {
      setCouponSuccess(true);
      setCouponCode("");
    } else {
      setCouponError("Invalid coupon code! Try 'WELCOME20' or 'FRESH100' (min ₹499).");
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !selectedLocation) return;
    
    // Save chosen address in session storage for checkout page
    if (selectedAddressId) {
      sessionStorage.setItem("freshoo_checkout_address_id", selectedAddressId);
    }
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Shopping Cart</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-8">
          Shopping Cart ({totalCartItems} items)
        </h1>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items and Address Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Closed Warning Message */}
              {!isStoreOpen() && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 text-amber-850 text-xs font-semibold">
                  <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Store is Closed Right Now</p>
                    <p className="text-[11px] text-amber-700 font-medium mt-0.5">
                      Operational hours are {storeSettings.openingTime} to {storeSettings.closingTime} (2 PM – 2 AM). You can compile your cart now and checkout once open!
                    </p>
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white p-6 space-y-4">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-3 border-b border-gray-100">
                  Cart Items
                </h3>

                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0 items-center">
                      {/* Image */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-xl bg-gray-50 border border-gray-100 shrink-0"
                      />

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mt-0.5">
                          {item.selectedWeight} • {item.product.freshnessBadge}
                        </p>
                      </div>

                      {/* Quantity Selector */}
                      <div className="flex items-center gap-2.5 border border-gray-200 rounded-lg bg-gray-50 p-1 shrink-0">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-white rounded transition-colors text-gray-500 cursor-pointer"
                        >
                          <Minus size={12} strokeWidth={3} />
                        </button>
                        <span className="text-xs font-extrabold px-1 text-gray-700 min-w-[14px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-white rounded transition-colors text-gray-500 cursor-pointer"
                        >
                          <Plus size={12} strokeWidth={3} />
                        </button>
                      </div>

                      {/* Price & Delete */}
                      <div className="flex items-center gap-3 shrink-0 text-right min-w-[80px] justify-end">
                        <span className="text-xs sm:text-sm font-extrabold text-gray-900">
                          ₹{item.price * item.quantity}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1.5 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address Selection */}
              {user && user.addresses.length > 0 && (
                <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
                  <h3 className="font-display font-extrabold text-sm text-gray-900 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                    <MapPin size={18} className="text-brand-primary" /> Delivery Destination Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {user.addresses.map((addr) => {
                      const isSelected = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-brand-primary bg-red-50/20 text-brand-primary ring-2 ring-red-100"
                              : "border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold uppercase tracking-wider text-[9px] bg-red-50 text-brand-primary px-2 py-0.5 rounded">
                              {addr.tag}
                            </span>
                            {isSelected && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
                          </div>
                          <p className="font-medium text-xs text-gray-800 line-clamp-2 leading-relaxed">
                            {addr.addressLine}, {addr.city} - {addr.pincode}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Calculations Bill Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo code Section */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-xs text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag size={16} className="text-brand-primary" /> Apply Promo Code
                </h3>

                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code (e.g. WELCOME20)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs font-semibold uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {couponError && <p className="text-[10px] text-red-500 font-bold">{couponError}</p>}
                {couponSuccess && <p className="text-[10px] text-emerald-600 font-bold">Coupon applied successfully!</p>}

                {appliedCoupon && (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-800 font-bold">
                    <div className="flex items-center gap-2">
                      <Tag size={14} />
                      <span>{appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-emerald-700 hover:text-red-600 text-[10px] font-black underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Bill Summary */}
              <div className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm space-y-4 font-semibold text-xs text-gray-700">
                <h3 className="font-display font-extrabold text-sm text-gray-900 pb-2 border-b border-gray-100">
                  Bill Summary
                </h3>

                <div className="space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-gray-900 font-bold">₹{getCartSubtotal()}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo Savings</span>
                      <span>-₹{getCartDiscount()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery Charges</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tax & Packing Fee</span>
                    <span className="text-emerald-600 font-bold">FREE</span>
                  </div>

                  <hr className="border-gray-100 my-2" />

                  <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
                    <span>Grand Total</span>
                    <span className="text-brand-primary text-md">₹{getCartTotal()}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  disabled={!isStoreOpen() || !selectedLocation}
                  onClick={handleCheckout}
                  className={`w-full py-3.5 font-bold rounded-xl text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${
                    !isStoreOpen() || !selectedLocation
                      ? "bg-gray-300 shadow-none cursor-not-allowed"
                      : "bg-brand-primary hover:bg-red-700 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  Proceed to Checkout <ArrowRight size={14} strokeWidth={3} />
                </button>

                {!selectedLocation && (
                  <p className="text-[10px] text-center text-red-500 font-bold">
                    * Please select delivery area in header.
                  </p>
                )}
              </div>

              {/* Secure payment certificate */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 font-semibold">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Secure SSL Checkouts • FSSAI Sanitized Delivery</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 border border-gray-100 rounded-3xl bg-gray-50/20 max-w-md mx-auto space-y-4">
            <div className="inline-flex p-4 rounded-full bg-red-50 text-brand-primary">
              <ShoppingBag size={40} />
            </div>
            <h3 className="font-display font-extrabold text-gray-900 text-lg">
              Your cart is empty
            </h3>
            <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
              Add some fresh meat cuts or seafood to begin compiling your hyperlocal basket.
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-sm"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
