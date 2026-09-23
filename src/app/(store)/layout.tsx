import React from "react";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { MobileNav } from "@/components/common/MobileNav";
import { WhatsAppWidget } from "@/components/common/WhatsAppWidget";
import { CartDrawer } from "@/components/common/CartDrawer";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <WhatsAppWidget />
      <CartDrawer />
    </div>
  );
}
