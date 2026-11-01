"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import Link from "next/link";

export interface ToastData {
  message: string;
  subtext?: string;
  id: number;
}

interface ToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", damping: 24, stiffness: 320 }}
          className="fixed bottom-6 right-4 sm:right-8 z-[9999] max-w-sm w-[calc(100vw-2rem)] sm:w-auto"
        >
          <div className="bg-stone-900/95 backdrop-blur-md text-white border border-stone-800 shadow-2xl rounded-2xl p-3.5 sm:p-4 flex items-center justify-between gap-3.5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left text-white" style={{ color: "#ffffff" }}>
                <p
                  className="text-xs sm:text-sm font-extrabold text-white tracking-tight"
                  style={{ color: "#ffffff" }}
                >
                  {toast.message}
                </p>
                {toast.subtext && (
                  <p
                    className="text-[11px] text-white font-medium truncate max-w-[190px] sm:max-w-[240px] mt-0.5"
                    style={{ color: "#ffffff" }}
                  >
                    {toast.subtext}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Link
                href="/cart"
                onClick={onClose}
                className="px-2.5 py-1.5 bg-brand-primary hover:bg-red-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                style={{ color: "#ffffff" }}
              >
                <span>Cart</span>
                <ArrowRight size={12} />
              </Link>
              <button
                onClick={onClose}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
                style={{ color: "#ffffff" }}
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;

