"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Mail, Phone, Lock, User, ShieldCheck, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setError("");
    setSuccess("");
    setStep(1);
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isLogin) {
        if (loginMethod === "otp") {
          if (step === 1) {
            const digitsOnly = phone.replace(/\D/g, "");
            if (digitsOnly.length < 10) {
              setError("Please enter a valid 10-digit mobile number.");
              return;
            }
            setSuccess("OTP sent! For demo, enter 1234.");
            setStep(2);
            return;
          }
          if (otp !== "1234") {
            setError("Invalid OTP! Try using '1234' for demo verification.");
            return;
          }
          const result = await login({
            identifier: phone,
            otp: "1234",
            method: "otp",
          });
          if (!result.success) {
            setError(result.error || "OTP login failed.");
            return;
          }
          handleClose();
          return;
        }
        if (!email || !password) {
          setError("Please enter email and password.");
          return;
        }
        const result = await login({ identifier: email, password });
        if (!result.success) {
          setError(result.error || "Invalid credentials. Try admin@freshoo.in / Admin@123");
          return;
        }
        handleClose();
      } else {
        if (!fullName || !phone || !email || !password) {
          setError("All fields are required.");
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters long.");
          return;
        }
        const result = await register({
          name: fullName,
          phone: phone.replace(/\D/g, ""),
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden mx-4"
          >
            <button
              onClick={handleClose}
              disabled={loading}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-5">
              <h3 className="font-display text-2xl font-extrabold text-gray-900">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin
                  ? "Login to check order status & details"
                  : "Sign up to get fresh meats and seafood"}
              </p>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
                {error}
              </div>
            )}
            {success && !error && (
              <div className="mb-3 p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-100">
                {success}
              </div>
            )}

            {isLogin && step === 1 && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    loginMethod === "otp"
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  OTP Login
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                    loginMethod === "password"
                      ? "bg-white text-brand-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  Password Login
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isLogin ? (
                loginMethod === "otp" ? (
                  step === 1 ? (
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">
                          +91
                        </span>
                        <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-14 pr-12 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Demo: use the registered demo phone 9876543210, or any number with OTP 1234 if an account exists.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                          Enter OTP Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs text-brand-primary font-semibold hover:underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <div className="relative">
                        <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          required
                          maxLength={4}
                          placeholder="Enter code (default '1234')"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm font-semibold text-center tracking-[0.5em]"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5 text-center">
                        Demo: enter <span className="font-bold text-gray-700">1234</span>
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                          Password
                        </label>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">
                        Demo accounts: <strong>admin@freshoo.in / Admin@123</strong> or <strong>user@freshoo.in / User@123</strong>
                      </p>
                    </div>
                  </>
                )
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="Mobile Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-red-700 text-white text-sm font-display font-extrabold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Please wait…</span>
                  </>
                ) : (
                  <span>
                    {isLogin
                      ? loginMethod === "otp"
                        ? step === 1
                          ? "Send OTP"
                          : "Verify OTP & Login"
                        : "Login"
                      : "Create Account"}
                  </span>
                )}
              </button>

              <div className="text-center text-xs text-gray-500 pt-1">
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(false);
                        setStep(1);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-brand-primary font-bold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already a member?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(true);
                        setStep(1);
                        setError("");
                        setSuccess("");
                      }}
                      className="text-brand-primary font-bold hover:underline"
                    >
                      Login
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
