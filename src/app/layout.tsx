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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://freshmart-ecommerce.vercel.app"),
  title: {
    default: "FreshMart | Online Grocery & Local Supermarket",
    template: "%s | FreshMart Local Shop",
  },
  description:
    "Order fresh farm fruits, crisp vegetables, dairy, bakery, daily staples, household essentials with lightning-fast 45-minute local delivery.",
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
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "FreshMart Local Supermarket",
    title: "FreshMart | Online Grocery & Daily Staples Delivery",
    description: "Order fresh farm fruits, vegetables & groceries with express 45-min delivery.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
        width: 1200,
        height: 630,
        alt: "FreshMart Supermarket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FreshMart | Local Supermarket",
    description: "Order fresh groceries with express local delivery.",
  },
  icons: {
    icon: "/favicon.ico",
  },
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
