import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/context/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#16a34a",
};

export const metadata: Metadata = {
  title: "FreshMart | Online Grocery & Local Supermarket",
  description:
    "Order fresh farm fruits, crisp vegetables, dairy, bakery, daily staples, household essentials and electronics with lightning-fast 45-minute local delivery.",
  keywords: [
    "e-commerce",
    "local grocery delivery",
    "fresh fruits",
    "farm vegetables",
    "online supermarket",
    "cash on delivery",
    "express delivery",
  ],
  authors: [{ name: "FreshMart" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col selection:bg-emerald-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
