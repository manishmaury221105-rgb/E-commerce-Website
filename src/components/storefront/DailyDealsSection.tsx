"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Clock, ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";

interface DailyDealsSectionProps {
  products: Product[];
}

export function DailyDealsSection({ products }: DailyDealsSectionProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 28, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dealProducts = products.filter((p) => p.isDailyDeal).slice(0, 4);
  if (dealProducts.length === 0) return null;

  return (
    <section className="py-4 sm:py-8">
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/30 dark:to-teal-950/30 p-4 sm:p-7 rounded-3xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs transition-colors">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-amber-950 flex items-center justify-center font-bold shadow-md shadow-amber-500/20 flex-shrink-0">
              <Zap className="w-5 h-5 fill-amber-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                  Deals of the Day
                </h2>
                <span className="bg-rose-500 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                  Limited Time
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Fresh discounts up to 35% OFF</p>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 shadow-xs w-fit">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Ends in:</span>
            <div className="flex items-center gap-1 font-mono font-extrabold text-sm text-amber-900 dark:text-amber-300">
              <span className="bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-md">
                {String(timeLeft.hours).padStart(2, "0")}h
              </span>
              <span>:</span>
              <span className="bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-md">
                {String(timeLeft.minutes).padStart(2, "0")}m
              </span>
              <span>:</span>
              <span className="bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 rounded-md">
                {String(timeLeft.seconds).padStart(2, "0")}s
              </span>
            </div>
          </div>
        </div>

        {/* Products Grid: 2 cols on mobile, 2 cols on small tablet, 3 cols on iPad landscape, 4 cols on laptop */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {dealProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>

        {/* View all deals link */}
        <div className="mt-5 text-center">
          <Link
            href="/products?deal=true"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 bg-white dark:bg-slate-900 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all shadow-xs active:scale-95"
          >
            <span>Explore All Flash Deals</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
