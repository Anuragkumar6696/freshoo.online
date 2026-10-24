"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Mail, Phone, Lock, User, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setError("");
    setSuccess("");
    setLoading(false);
    onClose();
  };

  const handleToggleMode = (modeIsLogin: boolean) => {
    setIsLogin(modeIsLogin);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        const trimmedIdentifier = identifier.trim();
        if (!trimmedIdentifier || !password) {
          setError("Please enter your email or phone number and password.");
          return;
        }

        const result = await login({
          identifier: trimmedIdentifier,
          password,
        });

        if (!result.success) {
          setError(result.error || "Invalid credentials. Try admin@freshoo.in / Admin@123");
          return;
        }

        handleClose();
      } else {
        if (!fullName.trim() || !phone.trim() || !email.trim() || !password) {
          setError("All fields are required.");
          return;
        }

        const cleanPhone = phone.replace(/\D/g, "");
        if (cleanPhone.length < 10) {
          setError("Please enter a valid 10-digit mobile number.");
          return;
        }

        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          return;
        }

        const result = await register({
          name: fullName.trim(),
          phone: cleanPhone,
          email: email.toLowerCase().trim(),
          password,
        });

        if (!result.success) {
          setError(result.error || "Could not create account.");
          return;
        }

        handleClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950"
            onClick={handleClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 overflow-y-auto max-h-[90vh] mx-3 sm:mx-4 border border-slate-100"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <h3 className="font-display text-2xl font-black text-slate-900 tracking-tight">
                {isLogin ? "Welcome Back to Freshoo" : "Create Your Account"}
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {isLogin
                  ? "Sign in to track orders, saved addresses & exclusive offers"
                  : "Join Freshoo for fresh meat cut right after you order"}
              </p>
            </div>

            {/* Mode Switcher Tabs (Login vs Sign Up) */}
            <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isLogin
                    ? "bg-white text-red-600 shadow-sm font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode(false)}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  !isLogin
                    ? "bg-white text-red-600 shadow-sm font-extrabold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100 flex items-start gap-2">
                <span>{error}</span>
              </div>
            )}
            {success && !error && (
              <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                <>
                  {/* Login: Email or Phone */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="name@example.com or 10-digit mobile"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Login: Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-normal">
                      Demo accounts: <strong className="text-slate-600">admin@freshoo.in / Admin@123</strong> or <strong className="text-slate-600">user@freshoo.in / User@123</strong>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* Signup: Full Name */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Signup: Phone */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-bold">
                        +91
                      </span>
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-14 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Signup: Email */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  {/* Signup: Password */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-red-600 focus:bg-white focus:ring-1 focus:ring-red-600 outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-display font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Please wait…</span>
                  </>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </button>

              {/* Toggle Prompt */}
              <div className="text-center text-xs text-slate-500 pt-2">
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(false)}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => handleToggleMode(true)}
                      className="text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
