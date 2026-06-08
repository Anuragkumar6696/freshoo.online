"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Award,
  TrendingUp,
  MapPin,
  CheckCircle2,
  DollarSign,
  Briefcase,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FranchisePage() {
  // Form States
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [investment, setInvestment] = useState("5-10");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setEmail("");
    setTargetLocation("");
    setInvestment("5-10");
    setMessage("");
    setSubmitted(false);
  };

  const benefits = [
    {
      title: "Strong Brand Recognition",
      desc: "Partner with Delhi's premium hyperlocal meat delivery startup focused on 100% fresh, cut-after-order meat.",
      icon: <Award className="text-brand-primary" size={20} />,
    },
    {
      title: "Logistics & Sourcing Support",
      desc: "Freshoo manages direct sourcing from bio-secure farms and handles regular cold-chain supply dispatches.",
      icon: <Briefcase className="text-brand-primary" size={20} />,
    },
    {
      title: "Proprietary Software Systems",
      desc: "Get access to our advanced order routing algorithms, delivery boy tracking apps, and admin dashboards.",
      icon: <TrendingUp className="text-brand-primary" size={20} />,
    },
    {
      title: "High Margins & Quick ROI",
      desc: "Hyperlocal e-commerce guarantees repeat customers. Average payback period ranges between 10-14 months.",
      icon: <DollarSign className="text-brand-primary" size={20} />,
    },
  ];

  const investmentModels = [
    { model: "Freshoo Lite (Dark Store)", space: "150-250 Sq. Ft.", cost: "₹4L - ₹6L", pay: "10-12 Months" },
    { model: "Freshoo Premium (Retail Outlet)", space: "350-500 Sq. Ft.", cost: "₹8L - ₹12L", pay: "12-14 Months" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-8 font-semibold text-xs text-gray-400">
          <Link href="/" className="hover:text-brand-primary">Home</Link>
          <ChevronRight size={12} />
          <span className="text-gray-600">Franchise Program</span>
        </div>

        {/* Hero Banner Header */}
        <section className="relative overflow-hidden bg-gradient-to-br from-red-50/40 via-white to-gray-50/30 rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm mb-16 text-center lg:text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100/50 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider">
              <Sparkles size={12} /> Franchising Open for Delhi NCR
            </span>
            <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 leading-tight">
              Launch a <span className="text-brand-primary">Freshoo Outlet</span> in Your Local Locality
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-semibold leading-relaxed max-w-xl mx-auto lg:mx-0">
              Join the hyperlocal meat delivery revolution. We provide end-to-end setups, trained butchers, tech stack tool integration, farm sourcing networks, and marketing campaigns to build a highly profitable recurring business.
            </p>
          </div>
          <div className="lg:col-span-4 shrink-0 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm text-center">
            <p className="text-2xl font-black text-brand-primary">₹4 Lakhs+</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">Starting Investment Model</p>
            <hr className="my-4 border-gray-100" />
            <p className="text-xs font-bold text-gray-700">payback period: 10-14 Months</p>
          </div>
        </section>

        {/* Benefits Grid */}
        <section className="mb-20 space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-gray-900">
              Why Partner with Freshoo?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              We provide all the training, supply chain logistics, and software to make your business a success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className="border border-gray-100 rounded-2xl p-6 bg-white shadow-sm flex items-start gap-4"
              >
                <div className="p-3 bg-red-50 text-brand-primary rounded-xl shrink-0">
                  {benefit.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-display font-extrabold text-sm text-gray-900">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Investment Options & Form Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* Investment Details Table */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <h3 className="font-display font-black text-2xl text-gray-900">
                Franchise Investment Models
              </h3>
              <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                Choose the model that fits your budget. We provide the equipment, POS software, storefront layout design, and initial farm connections.
              </p>
            </div>

            <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm font-semibold text-xs text-gray-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200/50 font-bold text-gray-600">
                    <th className="p-4">Outlet Model</th>
                    <th className="p-4">Required Area</th>
                    <th className="p-4">Setup Investment</th>
                    <th className="p-4">Est. Payback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {investmentModels.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="p-4 font-bold text-gray-900">{row.model}</td>
                      <td className="p-4 text-gray-500">{row.space}</td>
                      <td className="p-4 text-brand-primary font-bold">{row.cost}</td>
                      <td className="p-4 text-emerald-600 font-bold">{row.pay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-red-50/40 border border-red-100/50 rounded-2xl p-4 flex gap-3 text-brand-primary font-semibold text-[10px] leading-relaxed">
              <MapPin size={18} className="shrink-0" />
              <div>
                <p className="font-bold">Delhi expansion priorities</p>
                <p className="text-gray-500 mt-0.5">
                  Currently prioritizing candidate inquiries for Rohini Sector 16/18/24, Saket, Vasant Kunj, Dwarka Sector 10/12, and Karol Bagh.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="lg:col-span-5 border border-gray-100 rounded-3xl p-6 bg-white shadow-md space-y-6">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">Franchise Inquiry Form</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-semibold">Submit details below and our BD team will reach out.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-bold text-xs text-gray-600">
              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Anurag Sen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="98765XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Preferred Territory Location</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Dwarka Sector 12, Delhi"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                />
              </div>

              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Investment Capacity</label>
                <select
                  value={investment}
                  onChange={(e) => setInvestment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none transition-all text-xs appearance-none font-bold text-gray-700 cursor-pointer"
                >
                  <option value="4-6">₹4 Lakhs – ₹6 Lakhs</option>
                  <option value="6-10">₹6 Lakhs – ₹10 Lakhs</option>
                  <option value="10-15">₹10 Lakhs – ₹15 Lakhs</option>
                  <option value="15+">Above ₹15 Lakhs</option>
                </select>
              </div>

              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Describe Business Background (Optional)</label>
                <textarea
                  placeholder="Mention previous retail/logistics experience, if any."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
              >
                {loading ? "Submitting Inquiry..." : "Submit Application"}
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Form Submission Success Modal */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={resetForm} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 font-semibold text-xs text-gray-700"
            >
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-display font-black text-xl text-gray-900">Application Submitted!</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Thank you, <strong className="text-gray-700">{name}</strong>. Our Business Development team will review your preferred target location (<strong className="text-gray-700">{targetLocation}</strong>) and contact you within 24 hours.
              </p>
              <button
                onClick={resetForm}
                className="w-full py-2.5 bg-brand-primary hover:bg-red-700 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors text-xs"
              >
                Close Window
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
