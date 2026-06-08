"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { X, Mail, Phone, Lock, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { setUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("otp");
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Input details, Step 2: OTP verification
  
  // Form States
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setError("");
    setStep(1);
    onClose();
  };

  const handleOAuthLogin = () => {
    // Mock Google Login
    setUser({
      name: "Ranit Bose (Google)",
      email: "ranit.bose@google.com",
      phone: "+91 9988776655",
      addresses: [
        { id: "addr-google", tag: "Home", addressLine: "A-102, Saket Greens", city: "New Delhi", pincode: "110017" }
      ]
    });
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (loginMethod === "otp") {
        if (step === 1) {
          if (!phone || phone.length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
          }
          // Advance to OTP input
          setStep(2);
        } else {
          if (otp !== "1234") {
            setError("Invalid OTP! Try using '1234' for demo verification.");
            return;
          }
          // Mock login success
          setUser({
            name: "Anurag Roy",
            email: "anurag.roy@example.com",
            phone: `+91 ${phone}`,
            addresses: [
              { id: "addr-user", tag: "Home", addressLine: "Pocket 22, Sector 22, Rohini", city: "Delhi", pincode: "110086" }
            ]
          });
          handleClose();
        }
      } else {
        // Password method
        if (!email || !password) {
          setError("All fields are required.");
          return;
        }
        setUser({
          name: "Vinay Kumar",
          email: email,
          phone: "+91 9999888877",
          addresses: []
        });
        handleClose();
      }
    } else {
      // Signup
      if (!fullName || !phone || !email || !password) {
        setError("All fields are required.");
        return;
      }
      setUser({
        name: fullName,
        email: email,
        phone: phone,
        addresses: []
      });
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={handleClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 overflow-hidden mx-4"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Title */}
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-extrabold text-gray-900">
                {isLogin ? "Welcome Back!" : "Create Account"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {isLogin
                  ? "Login to check order status & details"
                  : "Sign up to get fresh meats and seafood"}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-100">
                {error}
              </div>
            )}

            {/* Login Method Toggle */}
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

            {/* Form */}
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
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          placeholder="Enter 10-digit number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                          className="w-full pl-14 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary outline-none transition-all text-sm font-semibold"
                        />
                      </div>
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
                        For mock testing, enter code <span className="font-bold text-gray-700">1234</span>
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
                        <a href="#" className="text-xs text-brand-primary hover:underline">
                          Forgot?
                        </a>
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
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="password"
                        required
                        placeholder="Choose password"
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
                className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl text-sm transition-colors hover:bg-red-700 shadow-md cursor-pointer mt-2"
              >
                {isLogin
                  ? loginMethod === "otp" && step === 1
                    ? "Send OTP"
                    : "Verify & Login"
                  : "Register Now"}
              </button>
            </form>

            {/* Social Logins */}
            {step === 1 && (
              <>
                <div className="relative my-6 text-center">
                  <span className="absolute inset-x-0 top-1/2 border-b border-gray-200 -z-10" />
                  <span className="bg-white px-3 text-xs text-gray-400 font-semibold">
                    OR CONTINUE WITH
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={handleOAuthLogin}
                    className="flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors font-semibold cursor-pointer"
                  >
                    <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Sign in with Google</span>
                  </button>
                </div>
              </>
            )}

            {/* Switch Mode Footer */}
            {step === 1 && (
              <div className="mt-6 text-center text-sm">
                <span className="text-gray-500">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                </span>
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-brand-primary hover:underline cursor-pointer"
                >
                  {isLogin ? "Sign Up" : "Log In"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
