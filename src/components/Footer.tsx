"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import {
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  ThumbsUp,
  Truck,
  Heart,
  ChevronRight,
} from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b1120] text-slate-300 mt-20 pt-20 pb-10 font-medium relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-30" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -mr-48 -mt-24" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px] -ml-48 -mb-24" />

      {/* Brand Trust Promises banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 border-b border-slate-800/40">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center gap-6 group">
            <div className="p-4 bg-slate-800/40 text-brand-primary rounded-2xl shrink-0 group-hover:scale-110 transition-all duration-500 shadow-xl border border-slate-700/30">
              <Truck size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-display font-black text-xl text-white mb-2 tracking-tight">
                Zero Delivery Charges
              </h4>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                Fresh meat delivered to your doorstep without any delivery fees. No hidden costs.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 group">
            <div className="p-4 bg-slate-800/40 text-brand-primary rounded-2xl shrink-0 group-hover:scale-110 transition-all duration-500 shadow-xl border border-slate-700/30">
              <ThumbsUp size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-display font-black text-xl text-white mb-2 tracking-tight">
                Fresh Cut Guarantee
              </h4>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                Never frozen. Hygienically cut only after your order is confirmed for maximum taste.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 group">
            <div className="p-4 bg-slate-800/40 text-brand-primary rounded-2xl shrink-0 group-hover:scale-110 transition-all duration-500 shadow-xl border border-slate-700/30">
              <ShieldAlert size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-display font-black text-xl text-white mb-2 tracking-tight">
                Hygienic Standards
              </h4>
              <p className="text-sm text-slate-400 font-bold leading-relaxed">
                Double-washed cuts packed in food-grade, vacuum-sealed pouches for safety.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="space-y-8">
          <div className="relative group inline-block">
            <div className="absolute -inset-2 bg-gradient-to-r from-brand-primary to-red-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white p-2.5 rounded-xl shadow-2xl">
              <Logo variant="horizontal" size="sm" />
            </div>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-bold">
            Freshoo is Delhi&apos;s premium hyperlocal meat delivery startup. We promise 100% fresh, chemical-free meat cut directly post-order for unmatched tenderness.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-slate-800/80 hover:bg-brand-primary hover:text-white border border-slate-700 rounded-2xl transition-all duration-300 text-slate-400 flex items-center justify-center hover:-translate-y-1 shadow-lg"
              title="Facebook"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="p-3 bg-slate-800/80 hover:bg-brand-primary hover:text-white border border-slate-700 rounded-2xl transition-all duration-300 text-slate-400 flex items-center justify-center hover:-translate-y-1 shadow-lg"
              title="Instagram"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div className="lg:pl-8">
          <h4 className="text-white text-lg font-black uppercase tracking-widest border-l-4 border-brand-primary pl-4 mb-8 block">
            Categories
          </h4>
          <ul className="space-y-4">
            {["Chicken", "Mutton", "Fish & Seafood", "Eggs"].map((cat) => (
              <li key={cat}>
                <Link
                  href={`/shop?category=${cat}`}
                  className="text-slate-300 hover:text-brand-primary transition-all duration-300 flex items-center gap-2 font-bold"
                >
                  <ChevronRight size={14} className="text-brand-primary" />
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="text-white text-lg font-black uppercase tracking-widest border-l-4 border-brand-primary pl-4 mb-8 block">
            Quick Links
          </h4>
          <ul className="space-y-4">
            {[
              { label: "About Us", href: "/about" },
              { label: "Franchise", href: "/franchise" },
              { label: "Contact Us", href: "/contact" },
              { label: "Privacy Policy", href: "/privacy" },
            ].map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-slate-300 hover:text-brand-primary transition-all duration-300 flex items-center gap-2 font-bold"
                >
                  <ChevronRight size={14} className="text-brand-primary" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className="text-white text-lg font-black uppercase tracking-widest border-l-4 border-brand-primary pl-4 mb-8 block">
            Get in Touch
          </h4>
          <div className="space-y-6">
            <div className="flex items-start gap-4 group">
              <div className="p-2 bg-slate-800 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shadow-md">
                <MapPin size={18} />
              </div>
              <p className="text-sm font-bold text-slate-300 leading-relaxed">
                Rohini Sector 22 & Saket,<br />Delhi, India
              </p>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-2 bg-slate-800 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shadow-md">
                <Phone size={18} />
              </div>
              <a href="tel:+919310593167" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                +91 93105 93167
              </a>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="p-2 bg-slate-800 rounded-lg text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors duration-300 shadow-md">
                <Mail size={18} />
              </div>
              <a href="mailto:freshoo.online@gmail.com" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
                freshoo.online@gmail.com    
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
        <p>© 2024 Freshoo India. All Rights Reserved.</p>
        <div className="flex items-center gap-2">
          Made with <Heart size={10} className="text-brand-primary fill-brand-primary animate-pulse" /> in Delhi
        </div>
      </div>
    </footer>
  );
};
