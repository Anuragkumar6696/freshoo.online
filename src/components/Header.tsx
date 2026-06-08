"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Logo } from "./Logo";
import { LocationSelector } from "./LocationSelector";
import { AuthModal } from "./AuthModal";
import {
  MapPin,
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Clock,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cart,
    selectedLocation,
    getStoreStatusLabel,
    isStoreOpen,
    storeSettings,
    updateCartQuantity,
    removeFromCart,
    getCartSubtotal,
    getCartTotal,
    getCartDiscount,
    appliedCoupon,
    user,
    setUser,
  } = useApp();

  const [searchVal, setSearchVal] = useState("");
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const storeStatus = getStoreStatusLabel();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchVal.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsUserDropdownOpen(false);
    router.push("/");
  };

  const navLinks = [
    { label: "Shop", href: "/shop" },
    { label: "About Us", href: "/about" },
    { label: "Franchise", href: "/franchise" },
    { label: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#fdfdfd] border-b border-gray-200 shadow-sm">
        {/* Top Mini Bar */}
        <div className="bg-slate-900 py-2 px-4 sm:px-6 lg:px-8 text-[11px] font-bold text-white tracking-wider uppercase">
          <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-2 text-emerald-400">
                <Clock size={14} strokeWidth={2.5} />
                Fresh Cut Guarantee: Cut only after your order placement.
              </span>
            </div>
            <div className="flex items-center gap-6">
              <span className="opacity-90">Delivery Hours: 2:00 PM – 2:00 AM Daily</span>
              {user?.name && (
                <span className="hidden md:inline bg-brand-primary text-white px-3 py-1 rounded-full text-[10px] font-black">
                  HELLO, {user.name.split(" ")[0].toUpperCase()}!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          {/* Logo */}
          <Link href="/" className="shrink-0 active:scale-95">
            <Logo size="md" />
          </Link>

          {/* Location Display */}
          <button
            onClick={() => setIsLocationOpen(true)}
            className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 border border-gray-200 text-left transition-all cursor-pointer w-48 shadow-sm"
          >
            <div className="p-1.5 rounded-lg bg-red-50 text-brand-primary shrink-0">
              <MapPin size={18} />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1 text-[10px] font-black text-brand-primary uppercase tracking-widest">
                Deliver To <ChevronDown size={10} strokeWidth={3} />
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {selectedLocation ? selectedLocation.split(",")[0] : "Select Location"}
              </div>
            </div>
          </button>

          {/* Search Bar - Expanded */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-xl relative group mx-2"
          >
            <input
              type="text"
              placeholder="Search chicken, mutton, fish..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-red-50 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-brand-primary transition-colors cursor-pointer"
            >
              <Search size={18} strokeWidth={2.5} />
            </button>
          </form>

          {/* Navigation Links */}
          <div className="hidden xl:flex items-center gap-8 font-black text-[13px] uppercase tracking-widest">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors cursor-pointer py-1 relative group whitespace-nowrap ${
                    isActive ? "text-brand-primary" : "text-slate-700 hover:text-brand-primary"
                  }`}
                >
                  {link.label}
                  {isActive && <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-brand-primary" />}
                </Link>
              );
            })}
          </div>

          {/* Interactive Actions (Auth & Cart & Store Status) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Store Status Indicator */}
            <div
              className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black ${storeStatus.color} shadow-sm border border-current/10`}
              title={storeStatus.nextTime}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {storeStatus.label}
            </div>

            {/* User Account Area */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-800 transition-colors font-bold text-xs cursor-pointer"
                >
                  <User size={16} className="text-slate-500" />
                  <span className="max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                <AnimatePresence>
                  {isUserDropdownOpen && (
                    <>
                      {/* Dropdown Backdrop */}
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-20 font-semibold text-xs"
                      >
                        <Link
                          href="/account"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-brand-primary transition-colors"
                        >
                          Customer Dashboard
                        </Link>
                        <Link
                          href="/admin"
                          onClick={() => setIsUserDropdownOpen(false)}
                          className="block px-4 py-2 text-brand-primary bg-red-50/20 hover:bg-red-50/50 transition-colors font-bold border-y border-red-50/40"
                        >
                          ⚙️ Admin Control Panel
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 text-slate-800 transition-colors font-bold text-xs cursor-pointer"
              >
                <User size={16} className="text-slate-500" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 px-5 py-2.5 bg-brand-primary text-white font-black rounded-xl transition-all hover:bg-red-700 shadow-md hover:shadow-lg active:scale-95 cursor-pointer text-xs uppercase tracking-widest"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cart</span>
              {totalCartItems > 0 && (
                <span className="bg-white text-brand-primary min-w-[20px] h-5 rounded-md flex items-center justify-center text-[10px] font-black px-1 leading-none">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* Hamburger Mobile Menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 lg:hidden text-gray-500 hover:bg-gray-50 rounded-full cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search fresh chicken, fish, mutton..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-gray-50 border border-gray-100 rounded-full outline-none text-xs"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <Search size={16} />
            </button>
          </form>
        </div>
      </header>

      {/* Slide-out Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 max-w-full flex pl-10"
            >
              <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-brand-primary" />
                    <h3 className="font-display font-extrabold text-lg text-gray-900">
                      Shopping Cart
                    </h3>
                    <span className="text-xs text-gray-400 font-bold">
                      ({totalCartItems} items)
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Closed Warning Message */}
                {!isStoreOpen() && (
                  <div className="bg-amber-50 border-b border-amber-100 p-4 flex gap-3 text-amber-800 text-xs font-semibold">
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
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length > 0 ? (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow"
                      >
                        {/* Image */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-50 border border-gray-100 shrink-0"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-xs truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-[10px] font-bold text-brand-primary uppercase tracking-wide mt-0.5">
                            {item.selectedWeight} • {item.product.freshnessBadge}
                          </p>

                          {/* Controls */}
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 p-1">
                              <button
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity - 1)
                                }
                                className="p-0.5 hover:bg-white rounded transition-colors text-gray-500 cursor-pointer"
                              >
                                <Minus size={12} strokeWidth={3} />
                              </button>
                              <span className="text-xs font-extrabold px-1 text-gray-700">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateCartQuantity(item.id, item.quantity + 1)
                                }
                                className="p-0.5 hover:bg-white rounded transition-colors text-gray-500 cursor-pointer"
                              >
                                <Plus size={12} strokeWidth={3} />
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-gray-900">
                                ₹{item.price * item.quantity}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <div className="inline-flex p-4 rounded-full bg-gray-50 text-gray-400 mb-4">
                        <ShoppingBag size={40} />
                      </div>
                      <h4 className="font-display font-extrabold text-gray-900 text-md">
                        Your cart is empty
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Add some fresh cuts to get started!
                      </p>
                      <button
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push("/shop");
                        }}
                        className="mt-6 px-6 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-full hover:bg-red-700 cursor-pointer transition-colors"
                      >
                        Shop Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer calculations */}
                {cart.length > 0 && (
                  <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                    <div className="space-y-1.5 text-xs text-gray-600 font-semibold">
                      <div className="flex justify-between">
                        <span>Item Subtotal</span>
                        <span className="text-gray-900">₹{getCartSubtotal()}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600">
                          <span>Coupon Discount ({appliedCoupon.code})</span>
                          <span>-₹{getCartDiscount()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span className="text-emerald-600 font-bold">FREE</span>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900">
                        <span>Grand Total</span>
                        <span className="text-brand-primary text-md">₹{getCartTotal()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href="/cart"
                        onClick={() => setIsCartOpen(false)}
                        className="flex-1 py-3 text-center border border-gray-200 hover:bg-gray-50 font-bold rounded-xl text-xs text-gray-700 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        disabled={!isStoreOpen() || !selectedLocation}
                        onClick={() => {
                          setIsCartOpen(false);
                          router.push("/checkout");
                        }}
                        className={`flex-1 py-3 font-bold rounded-xl text-xs text-white shadow-md flex items-center justify-center gap-1.5 transition-all ${
                          !isStoreOpen() || !selectedLocation
                            ? "bg-gray-300 shadow-none cursor-not-allowed"
                            : "bg-brand-primary hover:bg-red-700 hover:shadow-lg cursor-pointer"
                        }`}
                      >
                        <span>Checkout</span>
                      </button>
                    </div>

                    {!selectedLocation && (
                      <p className="text-[10px] text-center text-red-500 font-bold">
                        * Please select a delivery area before checkout.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Slide-out */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Menu Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Indicator */}
              <div
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold mb-6 ${storeStatus.color}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                {storeStatus.label} ({storeStatus.nextTime})
              </div>

              {/* Navigation links */}
              <nav className="flex flex-col gap-4 font-bold text-sm text-gray-700 flex-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="py-2 hover:text-brand-primary border-b border-gray-50 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {user && (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 hover:text-brand-primary border-b border-gray-50 transition-colors"
                    >
                      My Dashboard
                    </Link>
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 text-brand-primary font-extrabold border-b border-gray-50 transition-colors"
                    >
                      ⚙️ Admin Dashboard
                    </Link>
                  </>
                )}
              </nav>

              {/* Footer / Auth in Mobile menu */}
              <div className="pt-6 border-t border-gray-100">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="w-full py-2.5 text-center bg-gray-50 text-red-600 font-bold rounded-xl text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    Logout Account
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsAuthOpen(true);
                    }}
                    className="w-full py-2.5 text-center bg-brand-primary text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Modals */}
      <LocationSelector
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
