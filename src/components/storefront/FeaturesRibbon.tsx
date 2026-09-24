"use client";

import React from "react";
import { Truck, ShieldCheck, Sparkles, Gem, Clock, Award } from "lucide-react";

export function FeaturesRibbon() {
  const features = [
    {
      icon: Sparkles,
      title: "Royal Vivah Collection",
      description: "Authentic bridal lehengas & sherwanis",
    },
    {
      icon: Gem,
      title: "Custom Fitting & Tailoring",
      description: "Personalized embroidery & perfect fits",
    },
    {
      icon: Truck,
      title: "Pan-India Express Dispatch",
      description: "Safe & insured doorstep delivery",
    },
    {
      icon: ShieldCheck,
      title: "100% Genuine Quality",
      description: "Pure silks, rich zardozi & trusted fabrics",
    },
  ];

  return (
    <section className="py-6 border-y border-orange-200/60 dark:border-slate-800 bg-orange-50/40 dark:bg-slate-900/70 backdrop-blur-xs my-6 rounded-3xl transition-colors">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="flex items-start gap-3 p-2">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60 flex items-center justify-center flex-shrink-0 shadow-xs">
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
