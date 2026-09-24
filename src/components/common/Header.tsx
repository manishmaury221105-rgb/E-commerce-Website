"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  MapPin,
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  ShieldCheck,
  Heart,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { formatCurrency } from "@/lib/utils";
import { Category } from "@/types";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, subtotal, openCart } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      {/* 1. Top Announcement Ribbon */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-rose-700 text-white text-xs py-1.5 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="bg-amber-300 text-amber-950 font-extrabold px-1.5 py-0.5 rounded-sm text-[10px] uppercase tracking-wider shadow-xs">
              ✨ Shubh Vivah
            </span>
            <span className="truncate text-[11px] sm:text-xs font-medium">
              चैतन्य श्री वेडिंग स्पेशल: सभी शादी कलेक्शन्स पर 20% तक छूट! Use code <strong className="underline font-bold">SHUBHVIVAH</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-orange-100 flex-shrink-0 text-xs">
            <a
              href="https://wa.me/917380492118?text=Hi%20Chaitanya%20Shree,%20I%20need%20help%20with%20wedding%20collection"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>WhatsApp Help</span>
            </a>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              <span>+91 73804 92118</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-3 md:gap-6">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="h-10 md:h-13 w-auto flex items-center group-hover:scale-105 transition-transform duration-200">
              <img
                src="/logo.png"
                alt="चैतन्य श्री"
                className="h-10 md:h-12 w-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-extrabold text-xl md:text-2xl tracking-tight text-orange-600 dark:text-orange-400">
                  चैतन्य <span className="text-amber-600 dark:text-amber-400">श्री</span>
                </span>
                <span className="bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full hidden sm:inline-block">
                  WEDDING STORE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Royal Wedding & Festive Collection</p>
            </div>
          </Link>

          {/* Delivery Location Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-orange-50/60 dark:bg-slate-800 rounded-xl border border-orange-200/60 dark:border-slate-700 text-xs">
            <MapPin className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0 animate-bounce" />
            <div>
              <p className="text-slate-500 dark:text-slate-400 font-medium leading-none">All India Delivery</p>
              <p className="font-bold text-slate-800 dark:text-slate-200 leading-tight">Express Wedding Dispatch</p>
            </div>
          </div>

          {/* Live Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl relative hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Bridal Lehengas, Sherwanis, Wedding Cards, Pooja Items..."
                className="w-full bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 focus:bg-white dark:focus:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 pl-11 pr-24 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-sm transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition-all shadow-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Dark / Light Mode Switcher */}
            <ThemeToggle />

            {/* Mobile Drawer Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User Account / Login Dropdown */}
            <div className="relative">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl hover:bg-orange-50 dark:hover:bg-slate-800 border border-transparent hover:border-orange-200 dark:hover:border-slate-700 transition-all text-xs font-medium text-slate-700 dark:text-slate-300"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">Hi,</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[90px]">{user.name.split(" ")[0]}</p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                        <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 rounded-md">
                          {user.role}
                        </span>
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <Link
                        href="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        href="/account/addresses"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span>Saved Addresses</span>
                      </Link>

                      <Link
                        href="/account/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Profile Settings</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-slate-700 font-semibold text-xs transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="hidden sm:inline">Sign In</span>
                </Link>
              )}
            </div>

            {/* Quick Cart Trigger Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-md shadow-orange-600/20 active:scale-95"
              aria-label="Open cart"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-300 text-amber-950 font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse-soft shadow-xs">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold">
                {itemCount > 0 ? formatCurrency(subtotal) : "Cart"}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Sub-Nav / Category Strip */}
        <div className="hidden md:flex items-center justify-between py-2.5 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-6">
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span>Wedding Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCategoryMenuOpen ? "rotate-180" : ""}`} />
              </button>

              {isCategoryMenuOpen && (
                <div
                  className="absolute left-0 mt-3 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-3 z-50 grid gap-1 animate-in fade-in duration-150"
                  onClick={() => setIsCategoryMenuOpen(false)}
                >
                  <Link
                    href="/products"
                    className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-between"
                  >
                    <span>View All Collections</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold">➔</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      className="px-4 py-2 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-400 text-xs flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded-full">
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Category Links */}
            <div className="flex items-center gap-5">
              {categories.slice(0, 5).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/products?deal=true" className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 hover:text-rose-700">
                <span>🔥 Vivah Offers</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
            <Link href="/orders" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
              Track Order
            </Link>
            <a
              href="https://wa.me/917380492118?text=Hi%20Chaitanya%20Shree,%20I%20want%20to%20place%20a%20wedding%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 dark:text-orange-400 font-semibold hover:underline"
            >
              Custom Wedding Inquiry
            </a>
          </div>
        </div>

        {/* 4. Mobile Search Input Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search lehengas, sherwanis, wedding items..."
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 pl-10 pr-20 py-2.5 rounded-full border border-slate-200 dark:border-slate-700 text-xs focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 bg-orange-600 active:scale-95 text-white text-[11px] font-bold px-3.5 py-1 rounded-full shadow-xs"
            >
              Go
            </button>
          </form>
        </div>
      </div>

      {/* 5. Mobile Slide-Over Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="fixed inset-y-0 left-0 max-w-[300px] w-full bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between overflow-y-auto border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-300">
            <div className="space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <img
                    src="/logo.png"
                    alt="चैतन्य श्री"
                    className="h-8 w-auto object-contain rounded-md"
                  />
                  <span className="font-heading font-extrabold text-base text-orange-600 dark:text-orange-400">
                    चैतन्य <span className="text-amber-600 dark:text-amber-400">श्री</span>
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Deals Link */}
              <Link
                href="/products?deal=true"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-950 dark:text-orange-300 text-xs font-bold active:scale-98"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">✨</span>
                  <span>Vivah Special Offers</span>
                </div>
                <span className="bg-orange-600 text-white px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">
                  Up to 30% OFF
                </span>
              </Link>

              {/* Categories Navigation */}
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                  Wedding Collections
                </h4>
                <div className="space-y-1">
                  <Link
                    href="/products"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40"
                  >
                    <span>All Collections</span>
                    <span>➔</span>
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.productCount !== undefined && (
                        <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs">
                <Link
                  href="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  <Package className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span>Track My Orders</span>
                </Link>

                <a
                  href="https://wa.me/917380492118?text=Hi%20Chaitanya%20Shree,%20I%20need%20help%20with%20wedding%20orders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Wedding Support</span>
                </a>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-slate-800 font-bold"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Control Panel</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Account & Logout in Drawer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-bold flex items-center justify-center text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-md"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
