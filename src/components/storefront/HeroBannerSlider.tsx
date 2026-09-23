"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, ShieldCheck, Clock } from "lucide-react";
import { Banner } from "@/types";

interface HeroBannerSliderProps {
  banners: Banner[];
}

export function HeroBannerSlider({ banners }: HeroBannerSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  if (!banners || banners.length === 0) return null;

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const current = banners[currentSlide];

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-emerald-950/10 border border-slate-200/80 dark:border-slate-800 bg-slate-900 group">
      {/* Background Banner Image */}
      <div className="relative h-[250px] sm:h-[340px] md:h-[440px] w-full overflow-hidden">
        <img
          src={current.image}
          alt={current.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-all duration-1000 ease-out"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 sm:via-slate-950/70 to-transparent flex items-center" />

        {/* Content Box */}
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-10 md:px-14 flex items-center">
          <div className="max-w-xl space-y-2.5 sm:space-y-4 text-white">
            {current.tag && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{current.tag}</span>
              </div>
            )}

            <h1 className="font-heading font-extrabold text-lg sm:text-3xl md:text-5xl leading-tight text-white drop-shadow-md">
              {current.title}
            </h1>

            {current.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-200 leading-relaxed drop-shadow-xs max-w-md line-clamp-2 sm:line-clamp-none">
                {current.subtitle}
              </p>
            )}

            <div className="pt-1 sm:pt-2 flex items-center gap-2 sm:gap-3">
              <Link
                href={current.link || "/products"}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <span>{current.buttonText || "Shop Now"}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
              <Link
                href="/products?deal=true"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-colors"
              >
                Today's Deals
              </Link>
            </div>

            {/* Micro value props */}
            <div className="pt-2 hidden sm:flex items-center gap-6 text-slate-300 text-xs font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" /> 45-Min Fast Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% Quality Checked
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows (Desktop) */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-white/10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentSlide ? "w-6 bg-emerald-500" : "w-1.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
