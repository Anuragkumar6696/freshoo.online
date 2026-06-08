"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Award, Heart, ChevronRight, TrendingUp, Users } from "lucide-react";

export default function AboutPage() {
  const founders = [
    {
      name: "Anurag",
      role: "Operations & Farm Sourcing",
      bio: "Leads our cold-chain compliance and ensures direct relations with certified, bio-secure poultry farms.",
      avatar: "/Gemini_Generated_Image_ninwwzninwwzninw.png",
    },
    {
      name: "Ranit",
      role: "Product & Technology",
      bio: "Architected the hyperlocal dispatch tech stack and our automated slot allocation engines.",
      avatar: "/Gemini_Generated_Image_xhvifixhvifixhvi.png",
    },
    {
      name: "Vinay",
      role: "Marketing & Strategy",
      bio: "Spearheads our sector-level micro-campaigns and brand positioning strategies across Delhi.",
      avatar: "/1000098711.jpg",
    },
    {
      name: "Farhan",
      role: "Customer Experience & Logistics",
      bio: "Manages our delivery fleet training program and guarantees the 30-minute doorstep commitment.",
      avatar: "/IMG-20260608-WA0039.jpg",
    },
  ];

  const milestones = [
    {
      year: "Q1 2026",
      title: "Ideation & Farm Tie-ups",
      desc: "Anurag, Ranit, Vinay, and Farhan aligned to solve the lack of truly fresh, chemical-free meat delivery options in Delhi. Established direct sourcing nodes with bio-secure, pesticide-free poultry farms.",
    },
    {
      year: "Q2 2026",
      title: "Beta Launch - Rohini Sector 22",
      desc: "Initialized our first micro-cutting hub. Successfully fulfilled 120+ orders during the pilot launch phase with a strong positive response and 4.8★ rating from our Rohini Sector 22 customers.",
    },
    {
      year: "Next Goal",
      title: "Delhi NCR Franchise Network",
      desc: "Expanding next to Saket, Dwarka, and Karol Bagh, mapping hyperlocal cutting hubs to cover Delhi NCR with zero-fee express deliveries.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Our Story</span>
        </div>

        {/* Hero story section */}
        <section className="text-center max-w-3xl mx-auto space-y-6 mb-16">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-50 text-brand-primary px-3 py-1 rounded-full border border-red-100/50">
            <Heart size={12} /> Meet the Team Behind Freshoo
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-tight">
            We Cut Meat Only <br />
            <span className="text-brand-primary">After You Order.</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed">
            Freshoo was founded with a singular, clear promise: to end the compromise of frozen, pre-cut, chemical-coated meats. We connect customers directly with fresh, clean cuts prepared in sanitized local hubs under strict hygienic cold-chain regulations.
          </p>
        </section>

        {/* Milestones Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 mb-20 border-y border-gray-100 text-center font-semibold text-xs text-gray-700">
          <div className="space-y-2">
            <TrendingUp size={24} className="text-brand-primary mx-auto" />
            <h3 className="font-display font-black text-2xl text-gray-900">120+ Orders</h3>
            <p className="text-gray-400">Delivered during Rohini Sector 22 pilot phase</p>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-gray-100 py-6 md:py-0">
            <Users size={24} className="text-brand-primary mx-auto" />
            <h3 className="font-display font-black text-2xl text-gray-900">4 Founders</h3>
            <p className="text-gray-400">Committed to revolutionizing meat delivery</p>
          </div>
          <div className="space-y-2">
            <Award size={24} className="text-brand-primary mx-auto" />
            <h3 className="font-display font-black text-2xl text-gray-900">100% Fresh</h3>
            <p className="text-gray-400">Chemical-free, farm-sourced local meats</p>
          </div>
        </section>

        {/* Founders Grid */}
        <section className="mb-20 space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              Meet Our Founders
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              The co-founding team driving Freshoo&apos;s operational excellence and technology.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {founders.map((founder) => (
            <div
              key={founder.name}
              className="border border-gray-100 rounded-3xl p-6 bg-white hover:shadow-premium shadow-hover transition-all text-center space-y-4"
            >
              <img
                src={founder.avatar}
                alt={founder.name}
                className="w-20 h-20 rounded-full object-cover mx-auto bg-gray-50 border border-gray-200"
              />
              <div>
                <h4 className="font-display font-black text-sm text-gray-900">{founder.name}</h4>
                <p className="text-[10px] text-brand-primary font-bold mt-0.5 uppercase tracking-wide">
                  {founder.role}
                </p>
              </div>
              <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                {founder.bio}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
            Our Startup Journey
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            How we went from an idea on paper to building Delhi&apos;s freshest meat delivery startup.
            </p>
          </div>

          <div className="max-w-3xl mx-auto relative border-l border-gray-100 pl-8 space-y-10 py-2">
            {milestones.map((stone, idx) => (
              <div key={idx} className="relative space-y-2 font-semibold text-xs text-gray-700">
                {/* Year tag dot */}
                <span className="absolute -left-12 top-1 w-8 h-8 rounded-full bg-red-50 text-brand-primary flex items-center justify-center font-display font-black border border-red-200/50 shadow-sm text-[10px]">
                  {idx + 1}
                </span>
                <span className="inline-block px-2 py-0.5 rounded bg-brand-primary text-white text-[9px] font-black uppercase">
                  {stone.year}
                </span>
                <h4 className="font-display font-extrabold text-sm text-gray-900">
                  {stone.title}
                </h4>
                <p className="text-gray-500 leading-relaxed font-semibold">
                  {stone.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
