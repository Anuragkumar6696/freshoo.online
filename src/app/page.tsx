"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import {
  ChevronRight,
  ChevronDown,
  Truck,
  PhoneCall,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  Tag,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

export default function Home() {
  const { products } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const bestSellers = products.filter((p) => p.isBestSeller);
  const featuredProducts = bestSellers.length > 0 ? bestSellers : products.slice(0, 4);

  const categoriesList = [
    {
      name: "Chicken",
      description: "Curry cuts, boneless breast & tender portions",
      count: products.filter((p) => p.category === "Chicken").length,
      image: "/chicken1.png",
      tag: "Fresh Cut",
    },
    {
      name: "Mutton",
      description: "Fresh goat curry cut & tender chops",
      count: products.filter((p) => p.category === "Mutton").length,
      image: "/mutton-fresh.png",
      tag: "Premium",
    },
    {
      name: "Fish",
      description: "Cleaned steaks & freshwater fillets",
      count: products.filter((p) => p.category === "Fish").length,
      image: "/fish.png",
      tag: "Daily Catch",
    },
    {
      name: "Eggs",
      description: "Farm-fresh high protein brown & white eggs",
      count: products.filter((p) => p.category === "Eggs").length,
      image: "/egg.jpeg",
      tag: "Farm Direct",
    },
  ];

  const faqs = [
    {
      q: "Where does Freshoo currently deliver?",
      a: "Freshoo operates hyperlocally from two active hubs: 1) Siddharth Vihar Hub, Ghaziabad (serving Siddharth Vihar, Pratap Vihar, Indirapuram, Crossings Republik, Vasundhara, and Vaishali) and 2) Rohini Sector 22 Hub, Delhi (covering Rohini Sectors 21–25, Pitampura, and North-West Delhi) with an ultra-fresh 15 km delivery radius.",
    },
    {
      q: "What are the 4 Freshoo Core Guarantees (MSPs)?",
      a: "1) Fresh Cut on Order: Meat is cut strictly after you place your order on website or WhatsApp—never pre-chopped or frozen. 2) Fair Market Price: Honest local market-based pricing with zero inflated app markups. 3) ~20-Minute Express Delivery: Dispatched instantly from your nearest hub in thermal insulation bags. 4) Zero Delivery Charges (₹0): Completely free doorstep delivery on every order.",
    },
    {
      q: "Can I place my order directly on WhatsApp?",
      a: "Yes! You can order directly through our website or by sending your order details and delivery location via WhatsApp to +91 93105 93167. Our team confirms your cut preference and dispatches immediately.",
    },
    {
      q: "How does Freshoo guarantee absolute freshness?",
      a: "Unlike supermarkets and cold-storage platforms where meat sits in chilled display trays for days, Freshoo maintains a strict zero-inventory cold-chain model. Meat is hygienically processed with purified water only upon order receipt, vacuum-packed, and delivered chilled to your kitchen within ~20 minutes.",
    },
    {
      q: "What payment methods are supported?",
      a: "We support Cash on Delivery (COD) and instant UPI at your doorstep (Google Pay, PhonePe, Paytm). You inspect your sealed hygienic package before making payment.",
    },
    {
      q: "What are your delivery charges?",
      a: "Under our current startup policy, express hyperlocal delivery is completely FREE (₹0 delivery fee) for all orders within our service areas in Ghaziabad and Delhi.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 w-full max-w-full overflow-x-hidden">
      <Header />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/50 via-stone-50 to-stone-50 py-10 sm:py-16 border-b border-stone-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-red-200 rounded-full shadow-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-primary animate-pulse" />
                <span className="text-[11px] font-extrabold text-brand-primary uppercase tracking-wider">
                  Active Hubs: Ghaziabad (Siddharth Vihar) & Delhi (Rohini Sec 22)
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-950 leading-[1.12] tracking-tight">
                Farm-Fresh Meat & Seafood.{" "}
                <span className="text-brand-primary">Cut After You Order.</span>
              </h1>

              <p className="text-sm sm:text-base text-stone-600 font-medium leading-relaxed max-w-xl">
                Cleaned, custom-chopped, and vacuum-sealed only after order placement on Website or WhatsApp. Delivered cold and fresh within ~20 minutes from our Ghaziabad & Delhi hubs.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/shop"
                  style={{ color: "#ffffff" }}
                  className="px-7 py-3.5 bg-brand-primary hover:bg-red-700 !text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-white font-bold">Explore Products</span>
                  <ArrowRight size={15} className="text-white" />
                </Link>

                <a
                  href="https://wa.me/919310593167?text=Hi%20Freshoo%2C%20I%20want%20to%20order%20fresh%20meat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 !text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm text-center flex items-center justify-center gap-2 cursor-pointer"
                  style={{ color: "#ffffff" }}
                >
                  <MessageCircle size={15} className="text-white" />
                  <span className="text-white font-bold">Order on WhatsApp</span>
                </a>

                <Link
                  href="/franchise"
                  className="px-5 py-3.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-xs text-center"
                >
                  Our Hubs & Franchise
                </Link>
              </div>

              {/* Core 4 MSP Highlights */}
              <div className="pt-6 border-t border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl">
                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-brand-primary mb-1">
                    <Sparkles size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">MSP #1</span>
                  </div>
                  <span className="text-sm font-black text-stone-900 block">Fresh Cut</span>
                  <span className="text-[11px] font-medium text-stone-500">Only after order</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-brand-primary mb-1">
                    <Tag size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">MSP #2</span>
                  </div>
                  <span className="text-sm font-black text-stone-900 block">Market Price</span>
                  <span className="text-[11px] font-medium text-stone-500">Fair mandi rates</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-brand-primary mb-1">
                    <Clock size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">MSP #3</span>
                  </div>
                  <span className="text-sm font-black text-stone-900 block">~20 Mins</span>
                  <span className="text-[11px] font-medium text-stone-500">Hyperlocal delivery</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200/80 shadow-xs">
                  <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">MSP #4</span>
                  </div>
                  <span className="text-sm font-black text-emerald-600 block">₹0 Fee</span>
                  <span className="text-[11px] font-medium text-stone-500">Zero delivery fee</span>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl overflow-hidden bg-white border border-stone-200 shadow-xl p-3 sm:p-4">
                <div className="aspect-4/3 rounded-2xl overflow-hidden bg-stone-100 relative">
                  <img
                    src="/hero.png"
                    alt="Freshoo Fresh Meat Selection"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wide">
                    Chilled • Never Frozen
                  </div>
                </div>

                {/* Active Hubs Quick Indicator */}
                <div className="p-4 bg-stone-50 rounded-2xl mt-3 border border-stone-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-stone-200">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-100 text-brand-primary">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Ghaziabad Hub</p>
                        <p className="text-[11px] text-stone-500">Siddharth Vihar & Indirapuram</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Live Dispatch
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-red-100 text-brand-primary">
                        <MapPin size={15} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">Delhi Hub</p>
                        <p className="text-[11px] text-stone-500">Rohini Sector 22 & Pitampura</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Live Dispatch
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
              Selected Sourcing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs font-bold text-brand-primary hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            Browse Full Catalogue <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.name}`}
              className="group bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 hover:border-brand-primary hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square rounded-xl bg-stone-50 overflow-hidden mb-3 border border-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-sm text-stone-900 group-hover:text-brand-primary transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                    {cat.tag}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-brand-primary">
                <span>View Options</span>
                <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* POPULAR PRODUCTS SECTION */}
      <section className="py-12 bg-white border-y border-stone-200/80 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
                Fresh Cuts
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Popular Fresh Selections
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-bold text-brand-primary hover:underline flex items-center gap-1"
            >
              View All ({products.length}) <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW FRESHOO WORKS */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
            Cold Chain Integrity
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
            How Freshoo Works
          </h2>
          <p className="text-xs text-stone-500 mt-2">
            Order on website or WhatsApp. Every cut is freshly prepared with zero cold-storage holding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-primary font-bold text-sm flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-sm text-stone-900 mb-2">1. You Place Your Order</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Order on our website or text our official WhatsApp at <strong>+91 93105 93167</strong>. Select portion weights (500g or 1kg) and your delivery address.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-primary font-bold text-sm flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-sm text-stone-900 mb-2">2. Custom Hygienic Cut</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Our trained master butchers custom-slice your meat fresh, wash it with purified water, and seal it in food-grade vacuum packaging.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-brand-primary font-bold text-sm flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-sm text-stone-900 mb-2">3. ~20-Minute Express Delivery</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Dispatched in thermal containment pouches directly from our nearest hub (Ghaziabad or Rohini) straight to your doorstep for ₹0 delivery fee.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICE COVERAGE & INTERACTIVE FAQ ACCORDION */}
      <section className="py-12 bg-stone-100/70 border-t border-stone-200 w-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold text-brand-primary uppercase tracking-wider">
              Transparency
            </span>
            <h2 className="text-2xl font-bold text-stone-900 mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Click any question below to view details about delivery, cuts, and hubs.
            </p>
          </div>

          {/* Interactive Accordion */}
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-stone-900 cursor-pointer hover:bg-stone-50/70 transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <HelpCircle size={16} className="text-brand-primary shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    <ChevronDown
                      size={17}
                      className={`text-stone-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-brand-primary" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 pt-1 text-xs text-stone-600 pl-9 sm:pl-11 leading-relaxed border-t border-stone-100 bg-stone-50/30">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Support Strip */}
          <div className="mt-8 p-5 bg-white rounded-2xl border border-red-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div>
              <p className="text-xs font-bold text-stone-900">Have questions or want to place a custom order?</p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Our customer care team is available from 7:00 AM to 11:00 PM every day.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="tel:+919310593167"
                style={{ color: "#ffffff" }}
                className="px-4 py-2.5 bg-brand-primary hover:bg-red-700 !text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <PhoneCall size={13} className="text-white" />
                <span className="text-white font-bold">Call +91 93105 93167</span>
              </a>

              <a
                href="https://wa.me/919310593167?text=Hi%20Freshoo%2C%20I%20have%20a%20question%20about%20ordering"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#ffffff" }}
                className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 !text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <MessageCircle size={14} className="text-white" />
                <span className="text-white font-bold">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
