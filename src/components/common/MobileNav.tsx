"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Package, User, Sparkles } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { itemCount, subtotal, openCart } = useCart();
  const { user } = useAuth();

  // Hide bottom nav on admin routes
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {/* Floating Mini Cart Bar for mobile when items are in cart */}
      {itemCount > 0 && !pathname.startsWith("/cart") && !pathname.startsWith("/checkout") && (
        <div className="fixed bottom-[68px] left-3 right-3 z-40 md:hidden animate-in slide-in-from-bottom-3 duration-300">
          <div
            onClick={openCart}
            className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-600 text-white p-3 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer active:scale-98 transition-all border border-amber-400/40"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center font-extrabold text-xs shadow-inner">
                {itemCount}
              </div>
              <div>
                <p className="text-[11px] text-amber-100 font-medium leading-none">Your Cart Subtotal</p>
                <p className="text-xs font-extrabold text-white leading-tight">
                  {formatCurrency(subtotal)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-extrabold bg-white text-orange-950 px-3 py-1.5 rounded-xl shadow-xs">
              <span>View Cart</span>
              <span>➔</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 md:hidden pt-1 pb-safe px-2 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] transition-colors">
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 ${
              pathname === "/"
                ? "text-orange-600 dark:text-orange-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Home</span>
          </Link>

          {/* Categories */}
          <Link
            href="/products"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 ${
              pathname.startsWith("/products") && !pathname.includes("/products/")
                ? "text-orange-600 dark:text-orange-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Categories</span>
          </Link>

          {/* Cart Trigger Button */}
          <button
            onClick={openCart}
            className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 relative text-slate-500 dark:text-slate-400"
            aria-label="Open Cart"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-orange-600 text-white font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse-soft shadow-xs">
                  {itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-tight">Cart</span>
          </button>

          {/* Orders */}
          <Link
            href="/orders"
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 ${
              pathname.startsWith("/orders")
                ? "text-orange-600 dark:text-orange-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Orders</span>
          </Link>

          {/* Account */}
          <Link
            href={user ? "/account/profile" : "/auth/login"}
            className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 ${
              pathname.startsWith("/account") || pathname.startsWith("/auth")
                ? "text-orange-600 dark:text-orange-400 font-extrabold"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] leading-tight">{user ? "Account" : "Sign In"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
