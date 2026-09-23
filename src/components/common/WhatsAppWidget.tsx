"use client";

import React, { useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { generateWhatsAppSupportLink } from "@/lib/utils";

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState("");
  const phone = "+917380492118";

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateWhatsAppSupportLink(
      phone,
      customMsg || "Hello FreshMart! I would like to place an order / ask about delivery."
    );
    window.open(url, "_blank");
    setIsOpen(false);
    setCustomMsg("");
  };

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-3.5 sm:right-6 z-40 flex flex-col items-end">
      {/* Pop-up Chat Card */}
      {isOpen && (
        <div className="mb-2.5 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-3.5 sm:p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-700 rounded-full"></span>
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm leading-tight">FreshMart WhatsApp Help</h4>
                <p className="text-[10px] sm:text-[11px] text-emerald-100">Typically replies in 2 mins</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-850 space-y-2.5">
            <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none shadow-xs border border-slate-100 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
              <p className="font-medium">
                👋 Hello! How can we help you today?
              </p>
              <p className="mt-1 text-slate-500 dark:text-slate-400 text-[11px]">
                Ask for item availability, delivery updates, or send your grocery list!
              </p>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  window.open(
                    generateWhatsAppSupportLink(phone, "Hi, is 45-minute delivery available in my area right now?"),
                    "_blank"
                  );
                }}
                className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-colors text-left font-medium active:scale-98"
              >
                📍 Check delivery in my area
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open(
                    generateWhatsAppSupportLink(phone, "Hi FreshMart, I would like to place an order from my list."),
                    "_blank"
                  );
                }}
                className="text-[11px] bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/60 transition-colors text-left font-medium active:scale-98"
              >
                📝 Order via handwritten grocery list
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="relative mt-1">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your message..."
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-3 pr-10 py-2 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors active:scale-90"
                aria-label="Send WhatsApp message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 sm:px-4 sm:py-3 rounded-full shadow-2xl shadow-emerald-950/40 active:scale-90 transition-all duration-200 group border-2 border-white dark:border-slate-800"
        aria-label="Chat with us on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          WhatsApp Us
        </span>
      </button>
    </div>
  );
}
