"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Product } from "@/context/AppContext";
import { Plus, Minus, Star, Shield, HelpCircle } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateCartQuantity } = useApp();
  const [selectedWeight, setSelectedWeight] = useState(product.weights[0].weight);

  const activeWeightOption = product.weights.find((w) => w.weight === selectedWeight) || product.weights[0];
  const cartItemId = `${product.id}-${selectedWeight}`;
  
  // Check if this specific weight option of the product is in the cart
  const cartItem = cart.find((item) => item.id === cartItemId);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedWeight);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(cartItemId, quantityInCart + 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCartQuantity(cartItemId, quantityInCart - 1);
  };

  const hasDiscount = activeWeightOption.originalPrice && activeWeightOption.originalPrice > activeWeightOption.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((activeWeightOption.originalPrice! - activeWeightOption.price) /
          activeWeightOption.originalPrice!) *
          100
      )
    : 0;

  return (
    <div className="group relative flex flex-col bg-white border border-slate-200/60 rounded-3xl overflow-hidden hover:shadow-premium shadow-hover transition-all duration-500 card-gradient">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/20">
          {discountPercent}% OFF
        </div>
      )}

      {/* Image Area */}
      <Link href={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-slate-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>

      {/* Body Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Rating and Freshness Badge */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200/50 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {product.freshnessBadge}
          </span>
          <div className="flex items-center gap-1 text-amber-500 text-xs font-black bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
            <Star size={12} fill="currentColor" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <Link
          href={`/product/${product.id}`}
          className="font-display font-black text-base text-slate-800 group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight mb-3 flex-1"
        >
          {product.name}
        </Link>

        {/* Weights Selector */}
        <div className="mb-4">
          {product.weights.length > 1 ? (
            <div className="relative group/select">
              <select
                value={selectedWeight}
                onChange={(e) => setSelectedWeight(e.target.value)}
                className="w-full text-xs font-black text-slate-600 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl px-3 py-2 outline-none appearance-none cursor-pointer pr-10 transition-all hover:border-brand-primary/30 hover:ring-4 hover:ring-red-50"
              >
                {product.weights.map((w) => (
                  <option key={w.weight} value={w.weight}>
                    {w.weight} - ₹{w.price}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover/select:text-brand-primary transition-colors">
                <HelpCircle size={14} strokeWidth={3} />
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 inline-block">
              {activeWeightOption.weight}
            </div>
          )}
        </div>

        {/* Price & Add Button */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900">₹{activeWeightOption.price}</span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-bold">₹{activeWeightOption.originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Price</span>
          </div>

          {quantityInCart > 0 ? (
            <div className="flex items-center bg-brand-primary text-white rounded-xl shadow-lg shadow-red-500/20 overflow-hidden ring-2 ring-red-100">
              <button
                onClick={handleDecrement}
                className="p-2.5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-8 text-center font-black text-sm">{quantityInCart}</span>
              <button
                onClick={handleIncrement}
                className="p-2.5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-slate-900 hover:bg-brand-primary text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-red-500/20 active:scale-95 cursor-pointer group/btn"
            >
              Add <Plus size={14} strokeWidth={3} className="group-hover/btn:rotate-90 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Chevron helper
const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="2.5"
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);
