import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/context/Providers";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ea580c",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://chaitanya-shree.vercel.app"),
  title: {
    default: "चैतन्य श्री | Complete Wedding & Festive Collections",
    template: "%s | चैतन्य श्री",
  },
  description:
    "चैतन्य श्री - Shubh Vivah, Bridal Lehengas, Royal Groom Sherwanis, Wedding Cards, Traditional Pooja Samagri & Bridal Jewellery.",
  keywords: [
    "wedding store",
    "bridal lehengas",
    "sherwani",
    "chaitanya shree",
    "चैतन्य श्री",
    "wedding cards",
    "pooja samagri",
    "bridal jewellery",
    "shubh vivah",
  ],
  authors: [{ name: "चैतन्य श्री" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "चैतन्य श्री Wedding Store",
    title: "चैतन्य श्री | Complete Wedding & Festive Collections",
    description: "Explore bridal lehengas, royal sherwanis, wedding cards & pooja samagri.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "चैतन्य श्री",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "चैतन्य श्री | Wedding & Festive Collection",
    description: "Handcrafted bridal & groom wear, wedding accessories and cards.",
  },
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col selection:bg-orange-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
