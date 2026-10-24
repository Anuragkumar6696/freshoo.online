"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import {
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
  Truck,
  Tag,
  Clock,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-200 mt-16 font-sans relative overflow-hidden border-t-2 border-red-600/30">
      {/* 4 CORE VALUE PILLARS (MSPs) */}
      <div className="border-b border-slate-800 bg-slate-900/90 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* MSP 1 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-red-500 shadow-md transition-all">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400 shrink-0 border border-red-500/30">
                <Tag size={22} className="text-red-400" />
              </div>
              <div>
                <h4
                  className="font-extrabold text-base tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  Fresh Cut On Order
                </h4>
                <p
                  className="text-xs mt-1.5 leading-relaxed font-normal"
                  style={{ color: "#cbd5e1" }}
                >
                  Cut strictly after you place your order via Web or WhatsApp. Never frozen.
                </p>
              </div>
            </div>

            {/* MSP 2 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-red-500 shadow-md transition-all">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400 shrink-0 border border-red-500/30">
                <Tag size={22} className="text-red-400" />
              </div>
              <div>
                <h4
                  className="font-extrabold text-base tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  Fair Market Price
                </h4>
                <p
                  className="text-xs mt-1.5 leading-relaxed font-normal"
                  style={{ color: "#cbd5e1" }}
                >
                  Honest daily mandi market pricing without hidden application markups.
                </p>
              </div>
            </div>

            {/* MSP 3 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-red-500 shadow-md transition-all">
              <div className="p-3 rounded-xl bg-red-500/20 text-red-400 shrink-0 border border-red-500/30">
                <Clock size={22} className="text-red-400" />
              </div>
              <div>
                <h4
                  className="font-extrabold text-base tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  ~20-Min Delivery
                </h4>
                <p
                  className="text-xs mt-1.5 leading-relaxed font-normal"
                  style={{ color: "#cbd5e1" }}
                >
                  Chilled express dispatch from your nearest hub in thermal insulation bags.
                </p>
              </div>
            </div>

            {/* MSP 4 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700/80 hover:border-emerald-500 shadow-md transition-all">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 border border-emerald-500/30">
                <Truck size={22} className="text-emerald-400" />
              </div>
              <div>
                <h4
                  className="font-extrabold text-base tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  ₹0 Delivery Fee
                </h4>
                <p
                  className="text-xs mt-1.5 leading-relaxed font-normal"
                  style={{ color: "#cbd5e1" }}
                >
                  Completely free doorstep delivery across our Ghaziabad and Delhi zones.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FOOTER COLUMNS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
        {/* Brand & Slogan Column */}
        <div className="lg:col-span-4 space-y-5">
          <div className="inline-block">
            <Logo variant="light" size="md" />
          </div>

          <p
            className="text-xs sm:text-sm leading-relaxed font-normal"
            style={{ color: "#cbd5e1" }}
          >
            Freshoo is the NCR&apos;s premier farm-fresh hyperlocal meat delivery service. We operate with a strict zero-inventory cold-chain model: your chicken, mutton, and fish are custom-cut only after you order, vacuum-sealed, and delivered cold within ~20 minutes.
          </p>

          {/* Quick WhatsApp Action */}
          <div className="pt-2">
            <a
              href="https://wa.me/919310593167?text=Hi%20Freshoo%2C%20I%20want%20to%20order%20fresh%20meat"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#ffffff" }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 !text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
            >
              <MessageCircle size={16} className="text-white" />
              <span className="text-white font-bold">Order on WhatsApp (+91 93105 93167)</span>
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div className="lg:col-span-2 space-y-4">
          <h4
            className="font-bold text-sm tracking-wider uppercase border-l-2 border-brand-primary pl-3"
            style={{ color: "#ffffff" }}
          >
            Categories
          </h4>
          <ul className="space-y-2.5 text-xs font-semibold">
            {[
              { name: "Fresh Chicken", href: "/shop?category=Chicken" },
              { name: "Tender Mutton", href: "/shop?category=Mutton" },
              { name: "Fish & Seafood", href: "/shop?category=Fish" },
              { name: "Farm Fresh Eggs", href: "/shop?category=Eggs" },
            ].map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="hover:!text-red-400 transition-colors flex items-center gap-1.5"
                  style={{ color: "#cbd5e1" }}
                >
                  <ChevronRight size={13} className="text-red-500" />
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Operational Hubs Column */}
        <div className="lg:col-span-3 space-y-4">
          <h4
            className="font-bold text-sm tracking-wider uppercase border-l-2 border-brand-primary pl-3"
            style={{ color: "#ffffff" }}
          >
            Active Hubs
          </h4>
          <div className="space-y-3.5 text-xs">
            {/* Hub 1: Ghaziabad */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <div
                className="flex items-center gap-1.5 font-bold mb-1"
                style={{ color: "#ffffff" }}
              >
                <MapPin size={14} className="text-red-500 shrink-0" />
                <span>Ghaziabad Hub</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">
                  Live
                </span>
              </div>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "#cbd5e1" }}
              >
                Siddharth Vihar, Near NH-24 / DME, Ghaziabad, UP 201009
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: "#94a3b8" }}
              >
                Coverage: Siddharth Vihar, Pratap Vihar, Indirapuram, Crossings Republik, Vasundhara
              </p>
            </div>

            {/* Hub 2: Delhi */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700/80">
              <div
                className="flex items-center gap-1.5 font-bold mb-1"
                style={{ color: "#ffffff" }}
              >
                <MapPin size={14} className="text-red-500 shrink-0" />
                <span>Delhi Hub</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">
                  Live
                </span>
              </div>
              <p
                className="text-[11px] leading-relaxed"
                style={{ color: "#cbd5e1" }}
              >
                Pocket 4, Sector 22, Rohini, New Delhi 110086
              </p>
              <p
                className="text-[10px] mt-1"
                style={{ color: "#94a3b8" }}
              >
                Coverage: Rohini Sec 21–25, Pitampura, Prashant Vihar, North-West Delhi
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Support Column */}
        <div className="lg:col-span-3 space-y-4">
          <h4
            className="font-bold text-sm tracking-wider uppercase border-l-2 border-brand-primary pl-3"
            style={{ color: "#ffffff" }}
          >
            Customer Support
          </h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-red-500 shrink-0">
                <Phone size={15} />
              </div>
              <div>
                <span
                  className="text-[10px] uppercase font-bold block"
                  style={{ color: "#94a3b8" }}
                >
                  Helpline / Order
                </span>
                <a
                  href="tel:+919310593167"
                  className="font-bold hover:!text-red-400 transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  +91 93105 93167
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-red-500 shrink-0">
                <Mail size={15} />
              </div>
              <div>
                <span
                  className="text-[10px] uppercase font-bold block"
                  style={{ color: "#94a3b8" }}
                >
                  Email Inquiries
                </span>
                <a
                  href="mailto:freshoo.online@gmail.com"
                  className="font-bold hover:!text-red-400 transition-colors"
                  style={{ color: "#ffffff" }}
                >
                  freshoo.online@gmail.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-lg text-emerald-400 shrink-0">
                <Clock size={15} />
              </div>
              <div>
                <span
                  className="text-[10px] uppercase font-bold block"
                  style={{ color: "#94a3b8" }}
                >
                  Operating Hours
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "#cbd5e1" }}
                >
                  7:00 AM – 11:00 PM (Daily)
                </span>
              </div>
            </div>

            <div
              className="pt-2 flex items-center gap-2 text-[11px] font-medium"
              style={{ color: "#cbd5e1" }}
            >
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span>100% FSSAI Certified Hygienic Meat Processing</span>
            </div>
          </div>
        </div>
      </div>

      {/* COPYRIGHT & COMPLIANCE BAR */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p
            className="font-medium text-center sm:text-left"
            style={{ color: "#94a3b8" }}
          >
            © {new Date().getFullYear()} Freshoo India. All Rights Reserved. • Fresh • Cut • Deliver
          </p>

          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <Link
              href="/about"
              className="hover:!text-white transition-colors"
              style={{ color: "#94a3b8" }}
            >
              About
            </Link>
            <span style={{ color: "#64748b" }}>•</span>
            <Link
              href="/franchise"
              className="hover:!text-white transition-colors"
              style={{ color: "#94a3b8" }}
            >
              Franchise
            </Link>
            <span style={{ color: "#64748b" }}>•</span>
            <Link
              href="/privacy"
              className="hover:!text-white transition-colors"
              style={{ color: "#94a3b8" }}
            >
              Privacy Policy
            </Link>
            <span style={{ color: "#64748b" }}>•</span>
            <Link
              href="/contact"
              className="hover:!text-white transition-colors"
              style={{ color: "#94a3b8" }}
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
