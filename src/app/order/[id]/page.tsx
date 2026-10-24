"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ChevronLeft,
  Truck,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function fetchOrder() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
        const data = await res.json();
        if (res.ok && data?.data?.order) {
          if (isMounted) setOrder(data.data.order);
        } else {
          if (isMounted) setError(data?.error || "Order not found");
        }
      } catch (err: any) {
        if (isMounted) setError(err?.message || "Failed to load order details");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchOrder();

    return () => {
      isMounted = false;
    };
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-800">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-800 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Products
          </Link>
          <span className="text-xs font-bold text-stone-400">
            Order Reference: <span className="font-mono text-stone-700">{id}</span>
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
            <Loader2 size={28} className="animate-spin text-emerald-700 mx-auto mb-3" />
            <p className="text-xs font-semibold text-stone-500">Loading order receipt…</p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-10 text-center shadow-xs">
            <AlertCircle size={32} className="text-amber-600 mx-auto mb-3" />
            <h2 className="text-base font-bold text-stone-900 mb-1">Order Not Found</h2>
            <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
              {error || "We could not find an order matching this ID. Please verify the ID or check your confirmation email."}
            </p>
            <Link
              href="/"
              className="inline-block px-5 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Header Banner */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-stone-900">Order {order.id || order.friendlyId}</h1>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      order.status === "Order Confirmed"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-blue-50 text-blue-800 border border-blue-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  Placed on {order.date} • Payment: {order.paymentMethod?.toUpperCase()} ({order.paymentStatus || "Pending"})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/shop"
                  className="px-4 py-2 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl transition-colors shadow-xs"
                >
                  Order More
                </Link>
              </div>
            </div>

            {/* Status Progress (Exactly Two Allowed Order Statuses) */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                Fulfillment Status
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    order.status === "Order Received" || order.status === "Order Confirmed"
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-900"
                      : "border-stone-200 bg-stone-50 text-stone-400"
                  }`}
                >
                  <CheckCircle2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold">1. Order Received</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Order logged and notified to butchers.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 ${
                    order.status === "Order Confirmed"
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-900"
                      : "border-stone-200 bg-stone-50 text-stone-400"
                  }`}
                >
                  {order.status === "Order Confirmed" ? (
                    <CheckCircle2 size={20} className="text-emerald-700 shrink-0 mt-0.5" />
                  ) : (
                    <Clock size={20} className="text-stone-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-xs font-bold">2. Order Confirmed</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Confirmed by store admin for delivery.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items & Breakdown */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
              <h2 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                Ordered Items ({(order.items || []).length})
              </h2>

              <div className="divide-y divide-stone-100">
                {(order.items || []).map((it: any, idx: number) => (
                  <div key={idx} className="py-3 first:pt-0 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                        <img
                          src={it.product?.image || "/chicken1.png"}
                          alt={it.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{it.product?.name}</p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {it.selectedWeight} × {it.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">
                      ₹{it.price * it.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-stone-900">₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Discount</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Delivery Charges</span>
                  <span>FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-stone-200 text-sm font-bold text-stone-900">
                  <span>Total Amount</span>
                  <span className="text-emerald-800 text-base">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Delivery Point & Hub Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={16} className="text-emerald-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Delivery Address
                  </h3>
                </div>
                <p className="text-xs font-medium text-stone-800 leading-relaxed">
                  {order.address?.addressLine}, {order.address?.city} - {order.address?.pincode}
                </p>
                {order.geoLocation?.latitude && (
                  <div className="mt-3 pt-3 border-t border-stone-100">
                    <a
                      href={`https://www.google.com/maps?q=${order.geoLocation.latitude},${order.geoLocation.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
                    >
                      <ExternalLink size={13} /> View Delivery GPS Pin on Google Maps
                    </a>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Truck size={16} className="text-emerald-700" />
                  <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                    Fulfillment Hub
                  </h3>
                </div>
                <p className="text-xs font-bold text-stone-900">
                  {order.franchise?.name || "Rohini Sector 22 Hub (Main)"}
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  Target Delivery: ~20 mins within freshness service area.
                </p>
                <div className="mt-3 pt-3 border-t border-stone-100 text-[11px] text-stone-600">
                  Need assistance? Call Freshoo Support at{" "}
                  <a href="tel:+919310593167" className="font-bold text-emerald-700 hover:underline">
                    +91 93105 93167
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

