import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { HeroBannerSlider } from "@/components/storefront/HeroBannerSlider";
import { CategoryPills } from "@/components/storefront/CategoryPills";
import { FeaturesRibbon } from "@/components/storefront/FeaturesRibbon";
import { DailyDealsSection } from "@/components/storefront/DailyDealsSection";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, HeartHandshake, PhoneCall } from "lucide-react";
import { Product, Banner, Category } from "@/types";

export const revalidate = 0; // Dynamic data

async function getHomePageData() {
  try {
    const [banners, categories, products] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.category.findMany({
        orderBy: { order: "asc" },
        include: {
          _count: { select: { products: true } },
        },
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
        },
      }),
    ]);

    const parsedBanners: Banner[] = banners.map((b) => ({
      ...b,
    }));

    const parsedCategories: Category[] = categories.map((c) => ({
      ...c,
      productCount: c._count?.products || 0,
    }));

    const parsedProducts: Product[] = products.map((p) => ({
      ...p,
      images: Array.isArray(p.images)
        ? p.images
        : typeof p.images === "string"
        ? JSON.parse(p.images || "[]")
        : [],
      dealEndsAt: p.dealEndsAt ? p.dealEndsAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      category: p.category
        ? {
            id: p.category.id,
            name: p.category.name,
            slug: p.category.slug,
            isFeatured: p.category.isFeatured,
            order: p.category.order,
          }
        : undefined,
    }));

    return {
      banners: parsedBanners,
      categories: parsedCategories,
      products: parsedProducts,
    };
  } catch (error) {
    console.error("Home page data fetch error:", error);
    return {
      banners: [],
      categories: [],
      products: [],
    };
  }
}

export default async function HomePage() {
  const { banners, categories, products } = await getHomePageData();

  const featuredProducts = products.filter((p) => p.isFeatured);
  const groceryProducts = products.filter((p) => p.category?.slug === "grocery-staples");
  const freshFruits = products.filter((p) => p.category?.slug === "fruits-vegetables");

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Hero Carousel */}
      <HeroBannerSlider banners={banners} />

      {/* 2. Value Propositions Ribbon */}
      <FeaturesRibbon />

      {/* 3. Categories Grid */}
      <CategoryPills categories={categories} />

      {/* 4. Daily Deals with Live Timer */}
      <DailyDealsSection products={products} />

      {/* 5. Featured Products Showcase */}
      <section className="py-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                Featured Highlights
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked popular items from our store</p>
            </div>
          </div>
          <Link
            href="/products?featured=true"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {featuredProducts.slice(0, 8).map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. Special Promotional Callout Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
            LOCAL COMMUNITY SUPPORT
          </span>
          <h3 className="font-heading font-extrabold text-2xl sm:text-3xl">
            Want to order your customary grocery list?
          </h3>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Just snap a photo of your handwritten grocery list or type your items on WhatsApp. Our store staff will pack and deliver directly within 45 minutes!
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="https://wa.me/917380492118?text=Hi%20FreshMart,%20here%20is%20my%20grocery%20order%20list:"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Send Grocery List on WhatsApp</span>
            </a>
            <Link
              href="/products"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-colors"
            >
              Browse Online Catalog
            </Link>
          </div>
        </div>
      </div>

      {/* 7. Fresh Farm Fruits & Vegetables Section */}
      {freshFruits.length > 0 && (
        <section className="py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                Farm Fresh Fruits & Vegetables 🍎
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Harvested fresh daily from trusted local orchards</p>
            </div>
            <Link
              href="/products?category=fruits-vegetables"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {freshFruits.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 8. Daily Staples & Pantry */}
      {groceryProducts.length > 0 && (
        <section className="py-4">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                Pantry Staples & Grains 🌾
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Aged basmati, organic dals, and cold-pressed oils</p>
            </div>
            <Link
              href="/products?category=grocery-staples"
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 group"
            >
              <span>Explore More</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {groceryProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
