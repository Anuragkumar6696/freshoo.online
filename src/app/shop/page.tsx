"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp, Product } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
  MapPin,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { products, selectedLocation, isStoreOpen } = useApp();

  // URL parameters
  const categoryParam = searchParams.get("category");
  const searchParam = searchParams.get("search");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory("All");
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    } else {
      setSearchQuery("");
    }
  }, [searchParam]);

  // Handle Search Input Form
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter & Sort Logic
  const filteredProducts = products
    .filter((prod) => {
      // Search filter
      const matchesSearch =
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        selectedCategory === "All" || prod.category === selectedCategory;

      // Price filter (checks if ANY weight option satisfies the price limit)
      const matchesPrice = prod.weights.some((w) => w.price <= maxPrice);

      // Weight filter
      const matchesWeight =
        selectedWeight === "All" ||
        prod.weights.some((w) => w.weight.toLowerCase() === selectedWeight.toLowerCase());

      return matchesSearch && matchesCategory && matchesPrice && matchesWeight;
    })
    .sort((a, b) => {
      // Get baseline price for sorting
      const priceA = a.weights[0].price;
      const priceB = b.weights[0].price;

      if (sortBy === "price-asc") return priceA - priceB;
      if (sortBy === "price-desc") return priceB - priceA;
      if (sortBy === "rating") return b.rating - a.rating;
      // Default: Popularity (rating * count)
      return b.rating * b.reviewsCount - a.rating * a.reviewsCount;
    });

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setMaxPrice(1000);
    setSelectedWeight("All");
    setSortBy("popular");
    router.push("/shop");
  };

  const categories = ["All", "Chicken", "Mutton", "Fish", "Eggs"];
  const weightFilters = ["All", "500g", "1kg", "6 Pcs", "12 Pcs"];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Breadcrumb & Location Notice */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold mb-1">
              <Link href="/" className="hover:text-brand-primary">Home</Link>
              <span>/</span>
              <span className="text-gray-600">Shop</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              {selectedCategory === "All" ? "Fresh Cuts Inventory" : `${selectedCategory} Products`}
            </h1>
          </div>

          {/* Location details */}
          <div className="bg-red-50/40 border border-red-100/50 rounded-2xl p-3.5 flex items-center gap-3 max-w-sm">
            <MapPin size={18} className="text-brand-primary shrink-0 animate-pulse" />
            <div className="text-xs font-semibold text-gray-700">
              {selectedLocation ? (
                <>
                  <p className="font-bold text-brand-primary">Delivering to: {selectedLocation.split(",")[0]}</p>
                  <p className="text-[10px] text-gray-400 font-medium">Standard hyperlocal express delivery (30-45 mins)</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-red-600">No Delivery Location Selected</p>
                  <p className="text-[10px] text-gray-500 font-medium">Set area in header to check product delivery slots</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Product Grid wrapper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block space-y-6 self-start border border-gray-100 rounded-2xl p-6 bg-white shadow-sm font-semibold text-xs text-gray-700">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <span className="font-display font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                <SlidersHorizontal size={16} /> Filters
              </span>
              <button
                onClick={resetFilters}
                className="text-[10px] text-brand-primary font-black hover:underline cursor-pointer"
              >
                CLEAR ALL
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-gray-900">Category</h4>
              <div className="space-y-1 font-semibold">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors cursor-pointer text-xs ${
                      selectedCategory === cat
                        ? "bg-red-50 text-brand-primary font-bold"
                        : "hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Price Slider */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-gray-900">Max Price</h4>
                <span className="text-brand-primary font-bold">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-brand-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>₹50</span>
                <span>₹1000</span>
              </div>
            </div>

            {/* Weight Options */}
            <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="font-bold text-xs text-gray-900">Portion Weight</h4>
              <div className="flex flex-wrap gap-1.5">
                {weightFilters.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      selectedWeight === w
                        ? "border-brand-primary bg-red-50/50 text-brand-primary"
                        : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Safety badge */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex gap-2.5 text-emerald-800 text-[10px] leading-relaxed">
              <Sparkles size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">Freshoo Safety Promise</p>
                <p className="text-gray-500 font-medium mt-0.5">
                  100% fresh water cleaning. Cut in a sanitized temperature-controlled hub.
                </p>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 border border-gray-100/50 p-3 rounded-2xl font-bold text-xs text-gray-600">
              <div>
                Showing <span className="text-gray-900">{filteredProducts.length}</span> Cuts
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer shadow-sm"
                >
                  <SlidersHorizontal size={14} /> Filter
                </button>

                {/* Sort dropdown */}
                <div className="flex items-center gap-1.5">
                  <span>Sort By:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 outline-none appearance-none cursor-pointer pr-7 hover:border-gray-300 shadow-sm"
                    >
                      <option value="popular">Popularity</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="rating">Rating</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Active filters display tags */}
            {(selectedCategory !== "All" || maxPrice < 1000 || selectedWeight !== "All" || searchQuery) && (
              <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-gray-500">
                <span>Active Filters:</span>
                {selectedCategory !== "All" && (
                  <span className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg">
                    {selectedCategory}
                    <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedCategory("All")} />
                  </span>
                )}
                {maxPrice < 1000 && (
                  <span className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg">
                    Under ₹{maxPrice}
                    <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setMaxPrice(1000)} />
                  </span>
                )}
                {selectedWeight !== "All" && (
                  <span className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg">
                    {selectedWeight}
                    <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSelectedWeight("All")} />
                  </span>
                )}
                {searchQuery && (
                  <span className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg">
                    Search: "{searchQuery}"
                    <X size={10} className="cursor-pointer text-gray-400 hover:text-gray-600" onClick={() => setSearchQuery("")} />
                  </span>
                )}
                <button onClick={resetFilters} className="text-brand-primary hover:underline">Reset</button>
              </div>
            )}

            {/* Grid List */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 border border-gray-100 rounded-3xl p-8 space-y-4">
                <div className="inline-flex p-4 rounded-full bg-red-50 text-brand-primary">
                  <Search size={36} />
                </div>
                <h3 className="font-display font-extrabold text-gray-900 text-lg">
                  No fresh cuts found
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any items matching your selected filters. Try broadening your criteria or resetting the settings.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs hover:bg-red-700 cursor-pointer transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setShowMobileFilters(false)}
            />

            {/* Bottom Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-x-0 bottom-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl p-6 overflow-y-auto flex flex-col font-semibold text-xs text-gray-700"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                <h3 className="font-display font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  <SlidersHorizontal size={16} /> Filters
                </h3>
                <div className="flex items-center gap-4">
                  <button onClick={resetFilters} className="text-[10px] text-brand-primary font-black hover:underline cursor-pointer">
                    RESET
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Category */}
              <div className="space-y-3 mb-6">
                <h4 className="font-bold text-xs text-gray-900">Category</h4>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        selectedCategory === cat
                          ? "border-brand-primary bg-red-50 text-brand-primary"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900">Max Price</h4>
                  <span className="text-brand-primary font-bold">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={1000}
                  step={10}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer"
                />
              </div>

              {/* Weight */}
              <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-xs text-gray-900">Portion Weight</h4>
                <div className="flex flex-wrap gap-2">
                  {weightFilters.map((w) => (
                    <button
                      key={w}
                      onClick={() => setSelectedWeight(w)}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        selectedWeight === w
                          ? "border-brand-primary bg-red-50 text-brand-primary"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-3 bg-brand-primary text-white font-extrabold rounded-xl mt-4 hover:bg-red-700 cursor-pointer shadow-md text-xs text-center"
              >
                Apply Filters
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-brand-primary">Loading Shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
