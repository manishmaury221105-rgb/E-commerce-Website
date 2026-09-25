"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Tag,
  Users,
  Settings,
  Store,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAdmin, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/products", label: "Products & Stock", icon: Package },
    { href: "/admin/categories", label: "Categories & Banners", icon: Layers },
    { href: "/admin/orders", label: "Orders & Delivery", icon: ShoppingBag },
    { href: "/admin/coupons", label: "Coupons & Discounts", icon: Tag },
    { href: "/admin/customers", label: "Customers CRM", icon: Users },
    { href: "/admin/settings", label: "Store Settings", icon: Settings },
  ];

  if (!mounted || (isLoading && !user && !timedOut)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-semibold">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in or not admin
  if (!user || (!isAdmin && user.role !== "ADMIN" && user.role !== "STAFF")) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 p-8 rounded-3xl text-center space-y-5 shadow-2xl text-white">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-xl text-white">Admin Access Restricted</h2>
            <p className="text-xs text-slate-400 mt-1">
              Please sign in with administrator credentials to manage the store.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/auth/login?redirect=/admin"
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md shadow-orange-600/20"
            >
              Sign In to Admin Account
            </Link>
            <Link
              href="/"
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold text-xs py-2.5 rounded-xl transition-colors"
            >
              Return to Public Store
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* 1. Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-5 justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 px-2">
            <img
              src="/logo.png"
              alt="चैतन्य श्री"
              className="h-10 w-auto object-contain rounded-lg"
            />
            <div>
              <span className="font-heading font-extrabold text-sm tracking-tight text-orange-400">
                चैतन्य श्री <span className="text-amber-300 text-[10px] font-mono font-bold bg-amber-950/80 px-1 py-0.5 rounded border border-amber-800/40">ADMIN</span>
              </span>
              <p className="text-[10px] text-slate-400">Wedding Store Panel</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 font-bold"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-medium transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4 text-orange-400" />
              <span>View Storefront</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </Link>

          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 transition-colors font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* 2. Mobile Top Nav Header */}
      <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 bg-slate-800 text-slate-300 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <img
            src="/logo.png"
            alt="चैतन्य श्री"
            className="h-7 w-auto object-contain rounded-md"
          />
          <span className="font-heading font-extrabold text-sm text-orange-400">चैतन्य श्री Admin</span>
        </div>
        <Link
          href="/"
          target="_blank"
          className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1 rounded-lg flex items-center gap-1"
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop</span>
        </Link>
      </div>

      {/* Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-64 bg-slate-900 p-5 flex flex-col justify-between z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-heading font-bold text-white text-sm">Navigation</span>
                <button onClick={() => setIsMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <nav className="space-y-1 text-xs">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                        isActive
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 p-2.5 text-rose-400 text-xs font-bold"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. Main Admin Workspace */}
      <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
