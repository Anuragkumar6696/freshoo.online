"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  Star,
  Shield,
  Clock,
  ArrowLeft,
  ShoppingBag,
  Check,
  ChevronRight,
  Sparkles,
  Award,
  Truck,
  Plus,
  Minus,
} from "lucide-react";

interface ProductDetailsClientProps {
  id: string;
}

export const ProductDetailsClient: React.FC<ProductDetailsClientProps> = ({ id }) => {
  const router = useRouter();
  const { products, cart, addToCart, updateCartQuantity, selectedLocation } = useApp();

  const product = products.find((p) => p.id === id);
  
  // States
  const [selectedWeight, setSelectedWeight] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "hygiene" | "recipes">("details");
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Set default selected weight once product is found
  React.useEffect(() => {
    if (product && !selectedWeight) {
      setSelectedWeight(product.weights[0].weight);
    }
  }, [product, selectedWeight]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="font-display font-black text-2xl text-gray-900">Product Not Found</h2>
          <p className="text-sm text-gray-500">The product you are trying to view does not exist or has been removed.</p>
          <Link
            href="/shop"
            className="inline-block px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl text-xs hover:bg-red-700"
          >
            Back to Shop
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Weight pricing breakdown
  const activeWeightOption = product.weights.find((w) => w.weight === selectedWeight) || product.weights[0];
  const cartItemId = `${product.id}-${selectedWeight}`;
  const cartItem = cart.find((item) => item.id === cartItemId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    addToCart(product, selectedWeight);
  };

  const handleIncrement = () => {
    updateCartQuantity(cartItemId, quantityInCart + 1);
  };

  const handleDecrement = () => {
    updateCartQuantity(cartItemId, quantityInCart - 1);
  };

  const handleBuyNow = () => {
    if (quantityInCart === 0) {
      addToCart(product, selectedWeight);
    }
    router.push("/checkout");
  };

  // Mock product image gallery: Using raw stock, vacuum pack, and finished dish angles
  const galleryImages = [
    product.image,
    "https://images.unsplash.com/photo-1606787366850-de6330128bfc?auto=format&fit=crop&q=80&w=600", // Cooking/prepared representation
    "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=600", // Alternative packaging/view
  ];

  const hasDiscount = activeWeightOption.originalPrice && activeWeightOption.originalPrice > activeWeightOption.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((activeWeightOption.originalPrice! - activeWeightOption.price) /
          activeWeightOption.originalPrice!) *
          100
      )
    : 0;

  // Filter related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Mock specifications
  const specs = [
    { label: "Storage Temp", value: "0°C to 4°C Chilled" },
    { label: "Shelf Life", value: "48 Hours" },
    { label: "Source", value: "FSSAI Registered Local Farms" },
    { label: "Type", value: product.category === "Eggs" ? "Vegetarian" : "Non-Vegetarian" },
    { label: "Hygiene", value: "Vacuum sealed, cut in clean hubs" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <Link href="/shop" className="hover:text-brand-primary">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600 truncate max-w-[200px]">{product.name}</span>
        </div>

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-brand-primary font-bold mb-6 cursor-pointer"
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Product Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          {/* Gallery Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Big Image */}
            <div className="relative aspect-square border border-gray-100 rounded-3xl overflow-hidden bg-gray-50 shadow-sm">
              <img
                src={galleryImages[activeImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
              {hasDiscount && (
                <div className="absolute top-4 left-4 bg-brand-primary text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md">
                  {discountPercent}% OFF
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square border rounded-xl overflow-hidden bg-gray-50 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-brand-primary ring-2 ring-red-100"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header Details */}
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-50 text-brand-primary px-3 py-1 rounded-full border border-red-100/50">
                <Sparkles size={12} />
                {product.freshnessBadge}
              </span>

              <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-gray-900 leading-tight">
                {product.name}
              </h2>

              <div className="flex items-center gap-4 text-xs font-semibold">
                {/* Rating */}
                <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                  <Star size={13} fill="currentColor" />
                  <span className="text-gray-700">{product.rating}</span>
                </div>
                {/* Reviews */}
                <span className="text-gray-400">
                  {product.reviewsCount} Customer Reviews
                </span>
                {/* Category */}
                <span className="text-gray-500 uppercase tracking-wide text-[10px] bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                  Category: {product.category}
                </span>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
              {product.description}
            </p>

            {/* Weight Chips Selector */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">
                Select Portion Weight
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {product.weights.map((w) => {
                  const isSelected = selectedWeight === w.weight;
                  return (
                    <button
                      key={w.weight}
                      onClick={() => setSelectedWeight(w.weight)}
                      className={`px-4 py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer ${
                        isSelected
                          ? "border-brand-primary bg-red-50/40 text-brand-primary ring-2 ring-red-100 shadow-sm font-extrabold"
                          : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {w.weight} - ₹{w.price}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price section */}
            <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-gray-900">
                    ₹{activeWeightOption.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-sm text-gray-400 line-through font-semibold">
                      ₹{activeWeightOption.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  * Inclusive of all taxes • Zero Delivery Charge
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {quantityInCart > 0 ? (
                  <div className="flex items-center gap-3 border border-brand-primary bg-brand-primary text-white rounded-xl p-1.5 shadow-md">
                    <button
                      onClick={handleDecrement}
                      className="p-1 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus size={14} strokeWidth={3} />
                    </button>
                    <span className="text-xs font-black px-1.5 min-w-[20px] text-center">
                      {quantityInCart}
                    </span>
                    <button
                      onClick={handleIncrement}
                      className="p-1 hover:bg-red-700 rounded-lg transition-colors cursor-pointer"
                      title="Increase quantity"
                    >
                      <Plus size={14} strokeWidth={3} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="px-6 py-3 border border-brand-primary text-brand-primary font-bold rounded-xl text-xs hover:bg-brand-primary hover:text-white transition-all shadow-sm cursor-pointer"
                  >
                    Add to Cart
                  </button>
                )}

                <button
                  onClick={handleBuyNow}
                  className="px-6 py-3 bg-brand-primary text-white font-extrabold rounded-xl text-xs hover:bg-red-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Buy Now
                </button>
              </div>
            </div>

            {/* Quick Delivery notice */}
            <div className="border border-gray-100 rounded-2xl p-4 space-y-3 font-semibold text-xs text-gray-500">
              <div className="flex items-center gap-3">
                <Truck size={16} className="text-brand-primary" />
                <span>
                  {selectedLocation ? (
                    <span>Delivering in <strong>30-45 minutes</strong> to {selectedLocation.split(",")[0]}.</span>
                  ) : (
                    <span className="text-red-500 font-bold">Please select delivery location to view express slots.</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <Clock size={16} className="text-brand-primary" />
                <span>Store Schedule: 2:00 PM – 2:00 AM. Orders placed outside slot are scheduled for next slot.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Specs / FAQ / Cooking */}
        <section className="border-t border-gray-100 pt-10 mb-16">
          <div className="flex border-b border-gray-100 gap-6 mb-6 font-bold text-sm">
            <button
              onClick={() => setActiveTab("details")}
              className={`pb-3 transition-colors border-b-2 cursor-pointer ${
                activeTab === "details"
                  ? "text-brand-primary border-brand-primary"
                  : "text-gray-400 border-transparent hover:text-gray-700"
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab("hygiene")}
              className={`pb-3 transition-colors border-b-2 cursor-pointer ${
                activeTab === "hygiene"
                  ? "text-brand-primary border-brand-primary"
                  : "text-gray-400 border-transparent hover:text-gray-700"
              }`}
            >
              Hygiene & Sourcing
            </button>
          </div>

          <div className="max-w-3xl">
            {activeTab === "details" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                {specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between p-3 border-b border-gray-100">
                    <span className="text-gray-400">{spec.label}</span>
                    <span className="text-gray-900 font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "hygiene" && (
              <div className="space-y-4 text-xs font-semibold text-gray-600 leading-relaxed">
                <p>
                  At <strong className="text-gray-900">Freshoo</strong>, quality is our obsession. We believe you should know exactly where your food comes from. All meats are procured daily from verified, poultry-safe local farms.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span>No chemicals or formaldehyde spray.</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="p-1 rounded-full bg-emerald-100 text-emerald-700">
                      <Check size={14} strokeWidth={3} />
                    </div>
                    <span>Water temperature kept below 4°C.</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-gray-100 pt-12">
            <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 mb-8">
              Related Products
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};
