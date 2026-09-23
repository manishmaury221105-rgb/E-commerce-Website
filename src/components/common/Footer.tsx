"use client";

import React from "react";
import Link from "next/link";
import { ShoppingBag, Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Truck, RefreshCcw } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">45 Min Delivery</h4>
              <p className="text-slate-400 text-[11px]">Free over ₹499 order</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Genuine</h4>
              <p className="text-slate-400 text-[11px]">Direct from local farms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <RefreshCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Easy Returns</h4>
              <p className="text-slate-400 text-[11px]">No questions asked</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">WhatsApp Help</h4>
              <p className="text-slate-400 text-[11px]">Direct chat with shop</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="font-heading font-extrabold text-xl text-white">
                Fresh<span className="text-emerald-500">Mart</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Your neighborhood's favorite local shop. Handpicked farm vegetables, organic groceries, daily essentials, and quick home utilities delivered to your doorstep in under 45 minutes.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Shop #14, Main Market Square, Near Central Clock Tower</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <span>Mon - Sun: 7:00 AM - 10:30 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                <a href="tel:+917380492118" className="hover:text-emerald-400 transition-colors">
                  +91 73804 92118
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Categories</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/products?category=fruits-vegetables" className="hover:text-emerald-400 transition-colors">
                  Fresh Fruits & Veggies
                </Link>
              </li>
              <li>
                <Link href="/products?category=dairy-bakery" className="hover:text-emerald-400 transition-colors">
                  Dairy, Bread & Eggs
                </Link>
              </li>
              <li>
                <Link href="/products?category=grocery-staples" className="hover:text-emerald-400 transition-colors">
                  Daily Grocery & Staples
                </Link>
              </li>
              <li>
                <Link href="/products?category=snacks-munchies" className="hover:text-emerald-400 transition-colors">
                  Snacks & Munchies
                </Link>
              </li>
              <li>
                <Link href="/products?category=beverages" className="hover:text-emerald-400 transition-colors">
                  Cold Drinks & Teas
                </Link>
              </li>
              <li>
                <Link href="/products?category=electronics-utilities" className="hover:text-emerald-400 transition-colors">
                  Electronics & Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Service</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/orders" className="hover:text-emerald-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="hover:text-emerald-400 transition-colors">
                  Address Management
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/917380492118"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1 text-emerald-400 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp Us
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-emerald-400 transition-colors">
                  Customer Login
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-amber-400 hover:underline font-semibold">
                  Admin Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Safe & Secure</h4>
            <p className="text-slate-400 mb-3 text-[11px]">
              We support Cash on Delivery, instant UPI (Google Pay, PhonePe, Paytm), and all major Credit/Debit cards.
            </p>
            <div className="flex flex-wrap gap-1.5 text-slate-900 font-bold text-[10px]">
              <span className="bg-slate-200 px-2 py-1 rounded">💵 Cash on Delivery</span>
              <span className="bg-slate-200 px-2 py-1 rounded">⚡ Instant UPI</span>
              <span className="bg-slate-200 px-2 py-1 rounded">💳 Cards</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} FreshMart Local Supermarket. All rights reserved.</p>
          <p>
            Built for local businesses • Fast, Modern & Production-Ready
          </p>
        </div>
      </div>
    </footer>
  );
}
