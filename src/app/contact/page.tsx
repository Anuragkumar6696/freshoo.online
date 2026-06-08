"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  MessageCircle,
  Phone,
  Mail,
  HelpCircle,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1000);
  };

  const handleCloseSuccess = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
  };

  const faqs = [
    {
      q: "Is the meat really fresh and never frozen?",
      a: "Yes, 100%. Unlike conventional supermarkets or cold storage facilities, we do not store frozen meats. All poultry, mutton, and fish are sourced fresh daily and custom chopped only after your order is confirmed in the app.",
    },
    {
      q: "How do you manage cold chain temperatures?",
      a: "From farm transit to our sector cutting hubs, the temperature is strictly regulated below 4°C. The cuts are double-sanitized, packed in vacuum pouches, and carried in refrigerated courier containers directly to you.",
    },
    {
      q: "When can I place an order, and what are delivery slots?",
      a: "Our customer service app accepts orders 24/7. Hyperlocal cutting and deliveries operate daily between 2:00 PM and 2:00 AM. Orders placed outside this timeframe will be scheduled for the next opening slot.",
    },
    {
      q: "What are your delivery locations in Delhi?",
      a: "We currently cover Rohini Sector 22 and Saket. We are launching franchise dark stores across Dwarka, Janakpuri, and Vasant Kunj soon. Set your address in the header to view service ranges.",
    },
    {
      q: "Do you charge extra for home delivery?",
      a: "No delivery charges! All meat orders are delivered completely free of shipping fees, with no minimum order constraints. Market prices are guaranteed.",
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
          <span className="text-gray-600">Contact Us</span>
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 mb-8 text-center">
          Get in Touch
        </h1>

        {/* Contact info grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 text-center font-semibold text-xs text-gray-700">
          <div className="border border-gray-100 p-6 rounded-2xl bg-white shadow-sm space-y-3">
            <div className="p-3 bg-red-50 text-brand-primary rounded-xl inline-block">
              <Phone size={20} />
            </div>
            <h4 className="font-display font-extrabold text-sm text-gray-900">Phone Support</h4>
            <p className="text-gray-400">Call us for immediate order changes</p>
            <a href="tel:+919310593167" className="text-brand-primary font-bold hover:underline block text-xs">
              +91 93105 93167
            </a>
          </div>

          <div className="border border-gray-100 p-6 rounded-2xl bg-white shadow-sm space-y-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl inline-block">
              <MessageCircle size={20} />
            </div>
            <h4 className="font-display font-extrabold text-sm text-gray-900">WhatsApp Chat</h4>
            <p className="text-gray-400">Chat with support agents on mobile</p>
            <a
              href="https://wa.me/919310593167"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 font-bold hover:underline block text-xs"
            >
              Launch Chat (Mock)
            </a>
          </div>

          <div className="border border-gray-100 p-6 rounded-2xl bg-white shadow-sm space-y-3">
            <div className="p-3 bg-red-50 text-brand-primary rounded-xl inline-block">
              <Mail size={20} />
            </div>
            <h4 className="font-display font-extrabold text-sm text-gray-900">Email Inquiry</h4>
            <p className="text-gray-400">Write to us for franchise or complaints</p>
            <a href="mailto:freshoo.online@gmail.com" className="text-brand-primary font-bold hover:underline block text-xs"> 
              freshoo.online@gmail.com
            </a>
          </div>
        </section>

        {/* Form & FAQ Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          {/* FAQ accordion */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
                <HelpCircle size={24} className="text-brand-primary" /> Frequently Asked Questions
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                Browse our typical customer inquiries regarding sourcing, cold temperature logistics, and orders.
              </p>
            </div>

            {/* Accordion List */}
            <div className="space-y-3 font-semibold text-xs text-gray-700">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div key={idx} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4.5 text-left font-bold text-gray-900 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer text-xs"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-400 transition-transform ${isOpen ? "rotate-185" : ""}`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="p-4.5 pt-0 text-gray-500 leading-relaxed font-semibold border-t border-gray-50 bg-gray-50/20 text-xs">
                            {faq.a}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Panel */}
          <div className="lg:col-span-5 border border-gray-100 rounded-3xl p-6 bg-white shadow-md space-y-6">
            <div>
              <h3 className="font-display font-black text-lg text-gray-900">Send a Message</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-semibold">Fill out details below and we will email back.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 font-bold text-xs text-gray-600">
              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              <div>
                <label className="block mb-1 text-gray-400 uppercase tracking-wider text-[9px]">Message Description</label>
                <textarea
                  required
                  placeholder="How can we help you? Reference your Order ID if applicable."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-primary hover:bg-red-700 text-white font-extrabold rounded-xl transition-all shadow-md cursor-pointer text-xs"
              >
                {loading ? "Sending Message..." : "Send Feedback"}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      <AnimatePresence>
        {submitted && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-30" onClick={handleCloseSuccess} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl text-center space-y-4 font-semibold text-xs text-gray-700"
            >
              <div className="inline-flex p-3 rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-display font-black text-xl text-gray-900">Message Dispatched!</h3>
              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Thank you, <strong className="text-gray-700">{name}</strong>. Your message has been routed to our customer support desk. We will respond to <strong className="text-gray-700">{email}</strong> within 12 hours.
              </p>
              <button
                onClick={handleCloseSuccess}
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
