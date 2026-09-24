"use client";

import React from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, Clock, ShieldCheck, Truck, Sparkles, Gem } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-10 border-b border-slate-800 text-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-orange-400 border border-orange-800/40 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Express Dispatch</h4>
              <p className="text-slate-400 text-[11px]">Free delivery on ₹999+</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-orange-400 border border-orange-800/40 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">100% Authentic</h4>
              <p className="text-slate-400 text-[11px]">Handcrafted royal designs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-orange-400 border border-orange-800/40 flex items-center justify-center flex-shrink-0">
              <Gem className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Custom Fitting</h4>
              <p className="text-slate-400 text-[11px]">Bridal & Groom tailoring</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/80 text-orange-400 border border-orange-800/40 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Wedding Concierge</h4>
              <p className="text-slate-400 text-[11px]">Direct WhatsApp support</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 py-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="चैतन्य श्री"
                className="h-10 w-auto object-contain rounded-lg"
              />
              <span className="font-heading font-extrabold text-xl text-orange-500">
                चैतन्य <span className="text-amber-500">श्री</span>
              </span>
            </Link>
            <p className="text-slate-400 leading-relaxed text-xs max-w-sm">
              Your premier destination for auspicious wedding & festive collections. Handpicked bridal lehengas, royal sherwanis, wedding cards, traditional pooja samagri, and bridal jewellery.
            </p>
            <div className="pt-2 flex flex-col gap-1.5 text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>Shop #14, Royal Heritage Complex, Main Wedding Bazaar</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <span>Mon - Sun: 9:00 AM - 10:00 PM</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                <a href="tel:+917380492118" className="hover:text-orange-400 transition-colors">
                  +91 73804 92118
                </a>
              </div>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Wedding Categories</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/products?category=bridal-lehengas" className="hover:text-orange-400 transition-colors">
                  Bridal Lehengas & Sarees
                </Link>
              </li>
              <li>
                <Link href="/products?category=groom-collection" className="hover:text-orange-400 transition-colors">
                  Groom Sherwanis & Kurta
                </Link>
              </li>
              <li>
                <Link href="/products?category=wedding-cards" className="hover:text-orange-400 transition-colors">
                  Shubh Vivah Cards & Box
                </Link>
              </li>
              <li>
                <Link href="/products?category=pooja-samagri" className="hover:text-orange-400 transition-colors">
                  Vivah Pooja Samagri
                </Link>
              </li>
              <li>
                <Link href="/products?category=jewellery-accessories" className="hover:text-orange-400 transition-colors">
                  Jewellery & Accessories
                </Link>
              </li>
              <li>
                <Link href="/products?category=festive-gifts" className="hover:text-orange-400 transition-colors">
                  Wedding Favors & Gifts
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Customer Care</h4>
            <ul className="space-y-2 text-slate-400">
              <li>
                <Link href="/orders" className="hover:text-orange-400 transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/account/addresses" className="hover:text-orange-400 transition-colors">
                  Saved Delivery Addresses
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/917380492118?text=Hi%20Chaitanya%20Shree,%20I%20need%20assistance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-orange-400 transition-colors flex items-center gap-1 text-orange-400 font-semibold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp Helpdesk
                </a>
              </li>
              <li>
                <Link href="/auth/login" className="hover:text-orange-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-amber-400 hover:underline font-semibold">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Safe & Auspicious</h4>
            <p className="text-slate-400 mb-3 text-[11px]">
              We accept Cash on Delivery, instant UPI (Google Pay, PhonePe, Paytm), and major Credit/Debit cards.
            </p>
            <div className="flex flex-wrap gap-1.5 text-slate-900 font-bold text-[10px]">
              <span className="bg-amber-100 text-amber-950 px-2 py-1 rounded">💵 Cash on Delivery</span>
              <span className="bg-amber-100 text-amber-950 px-2 py-1 rounded">⚡ Instant UPI</span>
              <span className="bg-amber-100 text-amber-950 px-2 py-1 rounded">💳 Cards & EMI</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <p>© {new Date().getFullYear()} चैतन्य श्री (Chaitanya Shree). All rights reserved.</p>
          <p>
            ✨ Shubh Vivah Collections • Crafted with Traditional Elegance
          </p>
        </div>
      </div>
    </footer>
  );
}
