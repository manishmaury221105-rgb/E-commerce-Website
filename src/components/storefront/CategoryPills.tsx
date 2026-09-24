"use client";

import React from "react";
import Link from "next/link";
import { Category } from "@/types";
import { ArrowRight } from "lucide-react";

interface CategoryPillsProps {
  categories: Category[];
}

export function CategoryPills({ categories }: CategoryPillsProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4 sm:py-6">
      <div className="flex items-center justify-between mb-3.5 sm:mb-5 px-1">
        <div>
          <h2 className="font-heading font-extrabold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">
            Wedding Categories
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Bridal wear, groom attire & vivah essentials</p>
        </div>
        <Link
          href="/products"
          className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 flex items-center gap-1 group"
        >
          <span>See All</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of categories (4 cols on mobile, 8 on desktop) */}
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-3.5">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group flex flex-col items-center p-2 sm:p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 hover:border-orange-500 dark:hover:border-orange-400 hover:shadow-md hover:shadow-orange-500/10 transition-all duration-200 text-center active:scale-95"
          >
            {/* Image Box */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative mb-1.5 sm:mb-2 p-0.5 group-hover:scale-105 transition-transform duration-200">
              <img
                src={cat.image || "https://placehold.co/200x200?text=Category"}
                alt={cat.name}
                className="w-full h-full object-cover rounded-lg sm:rounded-xl"
              />
            </div>
            <h3 className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2 leading-tight">
              {cat.name}
            </h3>
            {cat.productCount !== undefined && (
              <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 hidden sm:inline">
                {cat.productCount} items
              </span>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
