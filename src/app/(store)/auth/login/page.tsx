"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Lock, Mail, ArrowRight, ShieldAlert } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

function LoginForm() {
  const { login } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectUrl = searchParams.get("redirect") || "";
  const authError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authError === "admin_required") {
      error("Administrator authentication required to access Admin Panel.");
    } else if (authError === "unauthorized_role") {
      error("Access denied. Your account does not have administrator privileges.");
    }
  }, [authError, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error("Please provide both email and password");
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      success(`Welcome back, ${res.user?.name}!`);
      const target = redirectUrl || (res.user?.role === "ADMIN" || res.user?.role === "STAFF" ? "/admin" : "/orders");
      setTimeout(() => {
        window.location.href = target;
      }, 500);
    } else {
      error(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="py-10 max-w-md mx-auto space-y-6">
      {/* Login Card */}
      <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="चैतन्य श्री"
            className="h-14 w-auto object-contain mx-auto"
          />
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Sign In to <span className="text-orange-600">चैतन्य श्री</span>
          </h1>
          <p className="text-xs text-slate-500">
            Access your wedding orders, saved addresses & custom bookings
          </p>
        </div>

        {authError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-600" />
            <span>Admin privileges required to view that page.</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Admin ID</label>
            <div className="relative">
              <input
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manish@2211 or your email"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:outline-none focus:border-orange-500"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md shadow-orange-600/20 active:scale-95 transition-all"
          >
            {loading ? "Signing in..." : "Sign In"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">or</span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Firebase Google Auth */}
        <GoogleSignInButton redirectTo={redirectUrl || "/orders"} text="Sign in with Google" />

        {/* Quick 1-Click Login Helper */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-center">
            ⚡ Quick 1-Click Login (Demo / Admin)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setEmail("manish@2211");
                setPassword("m@221105");
              }}
              className="px-2.5 py-2 bg-white hover:bg-orange-50 border border-slate-200 hover:border-orange-300 rounded-xl text-left text-[11px] transition-all shadow-sm group"
            >
              <div className="font-bold text-slate-800 group-hover:text-orange-600">👑 Admin Login</div>
              <div className="text-slate-400 text-[10px]">manish@2211</div>
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("customer@chaitanya.com");
                setPassword("customer123");
              }}
              className="px-2.5 py-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-xl text-left text-[11px] transition-all shadow-sm group"
            >
              <div className="font-bold text-slate-800 group-hover:text-teal-700">🛍️ Customer Demo</div>
              <div className="text-slate-400 text-[10px]">Auto-fill customer</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don't have an account yet?{" "}
          <Link href="/auth/register" className="font-bold text-orange-600 hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
