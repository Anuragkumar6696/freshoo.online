"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { Logo } from "@/components/Logo";
import {
  ChevronRight,
  TrendingUp,
  Award,
  Users,
  Smartphone,
  Star,
  Quote,
  CheckCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { products } = useApp();

  const bestSellers = products.filter((p) => p.isBestSeller);

  const categoriesList = [
    {
      name: "Chicken",
      count: products.filter((p) => p.category === "Chicken").length,
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=300",
      bg: "bg-red-50 hover:bg-red-100/75 border-red-100",
      text: "text-brand-primary",
    },
    {
      name: "Mutton",
      count: products.filter((p) => p.category === "Mutton").length,
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=300",
      bg: "bg-amber-50 hover:bg-amber-100/75 border-amber-100",
      text: "text-amber-800",
    },
    {
      name: "Fish",
      count: products.filter((p) => p.category === "Fish").length,
      image: "https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=300",
      bg: "bg-blue-50 hover:bg-blue-100/75 border-blue-100",
      text: "text-blue-700",
    },
    {
      name: "Eggs",
      count: products.filter((p) => p.category === "Eggs").length,
      image: "https://images.unsplash.com/photo-1516448424440-9dbca97779c1?auto=format&fit=crop&q=80&w=300",
      bg: "bg-orange-50 hover:bg-orange-100/75 border-orange-100",
      text: "text-orange-700",
    },
  ];

  const testimonials = [
    {
      id: 1,
      name: "Rohan Mehra",
      location: "Rohini Sector 22, Delhi",
      rating: 5,
      review:
        "The curry cut chicken was incredibly fresh and soft. It really is cut only after order placement. Highly recommended!",
      date: "2 days ago",
    },
    {
      id: 2,
      name: "Neha Gupta",
      location: "Saket, Delhi",
      rating: 5,
      review:
        "Finally, a meat delivery brand that gets it right! Vacuum packaging was clean, there was no odor, and the weight was exactly what was ordered.",
      date: "1 week ago",
    },
    {
      id: 3,
      name: "Dr. Alok Verma",
      location: "Rohini Sector 22, Delhi",
      rating: 5,
      review:
        "Impressive hygiene standards. As a doctor, I'm very selective about seafood and meat, but Freshoo's quality is top-notch.",
      date: "3 weeks ago",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfdfd]">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-red-50/50 via-white to-slate-50 py-12 sm:py-16 border-b border-slate-200/50">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -mr-48 -mt-24 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[100px] -ml-48 -mb-24 animate-pulse" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-slate-200/60 rounded-2xl shadow-premium"
            >
              <div className="flex h-3 w-3 rounded-full bg-brand-primary relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-primary opacity-75"></span>
              </div>
              <span className="text-xs font-black text-slate-800 uppercase tracking-widest">
                🚀 20-Minute Hyperlocal Delivery
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-slate-950 leading-[1.05] tracking-tight"
            >
              The Freshest <br />
              <span className="gradient-text">Meat & Eggs</span> <br />
              In Delhi
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 font-bold leading-relaxed max-w-xl"
            >
              Cleaned, hygienically vacuum-packed, and cut only after you order. From farm-fresh chicken to premium mutton and seafood, delivered in 20 minutes.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Link
                href="/shop"
                className="bg-brand-primary hover:bg-red-700 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-500/30 hover:shadow-red-500/40 hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                Order Fresh Now
              </Link>
              <Link
                href="/about"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-premium hover:-translate-y-1 active:scale-95 cursor-pointer"
              >
                Our Quality Story
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="flex items-center gap-8 pt-8 border-t border-slate-100"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight">Zero</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Chemicals</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight">100%</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Hygienic</span>
              </div>
              <div className="h-10 w-px bg-slate-200" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-900 tracking-tight">₹0</span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivery Fee</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="lg:col-span-6 relative"
          >
            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/10 border-4 border-white aspect-[3/4] lg:aspect-auto">
              <img
                src="/hero.png"
                alt="Freshoo Premium Meat & Eggs Variety"
                className="w-full h-full object-cover lg:max-h-[700px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/20 shadow-2xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                          <img src={`https://i.pravatar.cc/100?img=${i+20}`} alt="Happy Customer" />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 bg-emerald-500/90 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                      <CheckCircle size={12} strokeWidth={3} />
                      FSSAI Certified
                    </div>
                  </div>
                  <p className="text-white text-sm font-bold leading-snug mt-4">
                    &quot;The vacuum packing is so clean, and the meat is incredibly tender. Best in Delhi!&quot;
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative background elements */}
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center md:text-left mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              Browse Categories
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Select a category to view freshly cut selections.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-extrabold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
          >
            View Shop Page <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categoriesList.map((cat) => (
            <Link
              key={cat.name}
              href={`/shop?category=${cat.name}`}
              className={`group flex items-center gap-4 p-4 border rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer ${cat.bg}`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-14 h-14 object-cover rounded-xl bg-white border border-gray-100 shrink-0 shadow-sm"
              />
              <div className="min-w-0">
                <h3 className={`font-display font-extrabold text-sm text-gray-900 group-hover:text-brand-primary transition-colors`}>
                  {cat.name}
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5 font-semibold">
                  {cat.count} Items Available
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Sellers Grid */}
      <section className="py-16 bg-gray-50/50 border-y border-gray-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center md:text-left mb-10 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-bold uppercase tracking-wider mb-1">
                <TrendingUp size={14} /> Most Demanded Cuts
              </div>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
                Best Sellers in Your Area
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-xs font-extrabold text-brand-primary hover:underline flex items-center gap-1 shrink-0"
            >
              See All Products <ChevronRight size={14} />
            </Link>
          </div>

          {/* Grid list of Product Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </section>

      {/* Freshness/Hygiene Certification Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-3xl text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
          {/* Subtle decorations */}
          <div className="absolute right-0 bottom-0 w-80 h-80 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4 -z-10" />
          <div className="absolute left-10 top-10 w-24 h-24 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 -z-10" />

          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-wider">
              <Award size={14} /> Trusted Local Partner
            </span>

            <h2 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl leading-tight">
              Hygienically Cut and Packed under Expert Supervision
            </h2>

            <p className="text-xs sm:text-sm text-red-100 font-medium leading-relaxed">
              We maintain absolute cold-chain hygiene from farm sourcing to final delivery. Every cut is cleaned with pure mineral water, vacuum packed to retain juiciness, and dispatched in refrigerated bags. No preservatives or chemical washes, ever.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs font-bold text-red-50">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-white shrink-0" />
                <span>Double Sanitized Cutting Knives</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-white shrink-0" />
                <span>100% Biodegradable Vacuum Bags</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-white shrink-0" />
                <span>Zero Contact Delivery Available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-white shrink-0" />
                <span>FSSAI Certified Local Franchises</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews/Testimonials */}
      <section className="py-16 bg-gray-50/40 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-bold uppercase tracking-wider mb-2">
              <Users size={14} /> Customer Love
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              What Meat Lovers Say About Us
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              We completed 120+ orders in Sector 22, Rohini and Saket during launch week with 4.8★ reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test) => (
              <div
                key={test.id}
                className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} size={14} fill="currentColor" />
                      ))}
                    </div>
                    <Quote className="text-red-100 shrink-0" size={24} />
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed font-semibold italic">
                    &quot;{test.review}&quot;
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-50 mt-6 flex items-center justify-between text-xs font-semibold">
                  <div>
                    <h4 className="text-gray-900 font-extrabold">{test.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{test.location}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">{test.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Franchise Call to Action Banner */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-red-100 rounded-3xl bg-red-50/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-100 text-brand-primary text-[10px] font-black uppercase tracking-wider">
                Franchise Program
              </span>
              <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900">
                Partner with Delhi&apos;s Fastest Growing Meat Brand
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                Interested in launching a Freshoo hub in your sector? We provide tech stack support, logistics, sourcing, and marketing.
              </p>
            </div>
            <Link
              href="/franchise"
              className="px-6 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-red-700 transition-colors shadow-md shrink-0 cursor-pointer text-center w-full md:w-auto"
            >
              Explore Franchise Benefits
            </Link>
          </div>
        </div>
      </section>

      {/* Mobile App Promotion Section */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 text-xs text-brand-primary font-bold uppercase tracking-wider">
              <Smartphone size={14} /> Quick Hyperlocal App
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              Download the Freshoo App for Seamless Ordering
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed font-semibold max-w-md mx-auto lg:mx-0">
              Get express deliveries under 30 minutes, push alerts on fresh daily stock arrivals, customized weight chops, and exclusive loyalty rewards. Available soon for iOS and Android.
            </p>

            {/* Mock Badge Buttons */}
            <div className="flex justify-center lg:justify-start gap-4">
              <button
                type="button"
                className="px-5 py-2 border border-gray-200 hover:border-gray-300 rounded-xl bg-white flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <Smartphone className="text-gray-700 shrink-0" size={24} />
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Get it on</p>
                  <p className="text-xs font-black text-gray-900 leading-none">Google Play</p>
                </div>
              </button>
              <button
                type="button"
                className="px-5 py-2 border border-gray-200 hover:border-gray-300 rounded-xl bg-white flex items-center gap-3 text-left transition-colors cursor-pointer"
              >
                <Smartphone className="text-gray-700 shrink-0" size={24} />
                <div>
                  <p className="text-[9px] text-gray-400 uppercase font-black tracking-wider">Download on the</p>
                  <p className="text-xs font-black text-gray-900 leading-none">App Store</p>
                </div>
              </button>
            </div>
          </div>

          <div className="flex justify-center relative">
            {/* Mock phone mockups */}
            <div className="w-56 h-96 bg-gray-900 rounded-[32px] border-[6px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col p-2 text-white shrink-0">
              <div className="w-16 h-3 bg-gray-800 rounded-full mx-auto mb-2 shrink-0" />
              <div className="flex-1 bg-white rounded-2xl p-3 text-gray-900 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                  <Logo size="sm" variant="iconOnly" />
                  <span className="text-[9px] font-black text-brand-primary">SEC 22 ROHINI</span>
                </div>
                <div className="text-center py-6">
                  <p className="text-xs font-black text-gray-900 leading-tight">Fresh Meat Delivered in 30 Mins</p>
                  <span className="inline-block mt-2 text-[8px] bg-red-50 text-brand-primary font-bold px-1.5 py-0.5 rounded">₹0 Delivery Fees</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-2 bg-gray-50 flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-[9px] text-gray-800">Curry Cut Chicken</h5>
                    <p className="text-[8px] font-black text-brand-primary">₹299/kg</p>
                  </div>
                  <span className="text-[8px] bg-brand-primary text-white font-black px-2 py-0.5 rounded-full">ADD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
