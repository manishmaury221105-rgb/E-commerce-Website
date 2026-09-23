"use client";

import React from "react";
import { Truck, ShieldCheck, RefreshCw, MessageCircle, Clock, Award } from "lucide-react";

export function FeaturesRibbon() {
  const features = [
    {
      icon: Clock,
      title: "45-Min Fast Delivery",
      description: "Direct to your doorstep from local store",
    },
    {
      icon: ShieldCheck,
      title: "100% Farm Fresh",
      description: "Organic, pesticide-safe handpicked items",
    },
    {
      icon: RefreshCw,
      title: "Zero-Hassle Returns",
      description: "Instant doorstep replacement or refund",
    },
    {
      icon: Award,
      title: "Best Local Prices",
      description: "Wholesale savings directly to customers",
    },
  ];

  return (
    <section className="py-6 border-y border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs my-6 rounded-3xl transition-colors">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="flex items-start gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {feat.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
