"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductCard } from "@/components/storefront/ProductCard";
import { Product, Category } from "@/types";
import {
  SlidersHorizontal,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Sparkles,
  ShoppingBag,
  Check,
} from "lucide-react";

import { subscribeToProducts, subscribeToCategories } from "@/lib/firestore-service";

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedSort, setSelectedSort] = useState(searchParams.get("sort") || "featured");
  const [onlyDeals, setOnlyDeals] = useState(searchParams.get("deal") === "true");
  const [onlyFeatured, setOnlyFeatured] = useState(searchParams.get("featured") === "true");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(50000);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Real-time categories & products listeners
  useEffect(() => {
    const unsubCats = subscribeToCategories((liveCats) => {
      setCategories(liveCats);
    });

    const unsubProds = subscribeToProducts((liveProds) => {
      setAllProducts(liveProds);
      setLoading(false);
    });

    return () => {
      unsubCats();
      unsubProds();
    };
  }, []);

  // Compute filtered & sorted products in real time
  const products = allProducts
    .filter((p) => {
      if (selectedCategory) {
        const cat = categories.find((c) => c.slug === selectedCategory);
        if (p.categoryId !== selectedCategory && (!cat || p.categoryId !== cat.id)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const term = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(term);
        const matchDesc = (p.description || "").toLowerCase().includes(term);
        const matchShort = (p.shortDescription || "").toLowerCase().includes(term);
        if (!matchName && !matchDesc && !matchShort) return false;
      }
      if (onlyDeals && !p.isDailyDeal) return false;
      if (onlyFeatured && !p.isFeatured) return false;
      if (onlyInStock && p.stock <= 0) return false;
      if (p.price > maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (selectedSort === "price-asc") return a.price - b.price;
      if (selectedSort === "price-desc") return b.price - a.price;
      if (selectedSort === "rating") return (b.rating || 5) - (a.rating || 5);
      if (selectedSort === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSort("featured");
    setOnlyDeals(false);
    setOnlyFeatured(false);
    setOnlyInStock(false);
    setMaxPrice(50000);
    router.push("/products");
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    onlyDeals ||
    onlyFeatured ||
    onlyInStock ||
    maxPrice < 50000;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            {selectedCategory
              ? categories.find((c) => c.slug === selectedCategory)?.name || "Category Products"
              : searchQuery
              ? `Search Results for "${searchQuery}"`
              : onlyDeals
              ? "⚡ Deals of the Day"
              : onlyFeatured
              ? "✨ Featured Highlights"
              : "All Store Products"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">{products.length}</span> items ready for 45-min delivery
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors active:scale-95"
          >
            <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Filters {hasActiveFilters && "•"}</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl text-xs flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer w-full text-xs"
            >
              <option value="featured" className="dark:bg-slate-800">Featured</option>
              <option value="price-asc" className="dark:bg-slate-800">Price: Low to High</option>
              <option value="price-desc" className="dark:bg-slate-800">Price: High to Low</option>
              <option value="rating" className="dark:bg-slate-800">Top Rated</option>
              <option value="newest" className="dark:bg-slate-800">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Category Pills Carousel (Scrollable) */}
      <div className="md:hidden -mx-4 px-4 overflow-x-auto no-scrollbar smooth-scroll-touch flex items-center gap-2 py-1">
        <button
          onClick={() => setSelectedCategory("")}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            selectedCategory === ""
              ? "bg-emerald-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
          }`}
        >
          All Items
        </button>
        <button
          onClick={() => setOnlyDeals(!onlyDeals)}
          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
            onlyDeals
              ? "bg-rose-600 text-white shadow-sm"
              : "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50"
          }`}
        >
          🔥 Deals
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
              selectedCategory === cat.slug
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Main Layout (Sidebar Filters + Products Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block space-y-5 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs h-fit sticky top-24 transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Filters</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Categories List */}
          <div>
            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2.5">
              Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => setSelectedCategory("")}
                className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center justify-between ${
                  selectedCategory === ""
                    ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <span>All Categories</span>
                {selectedCategory === "" && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors font-medium flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selectedCategory === cat.slug && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Max Price</span>
              <span className="font-extrabold text-emerald-700 dark:text-emerald-400">₹{maxPrice.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="500"
              max="50000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              <span>₹500</span>
              <span>₹50,000+</span>
            </div>
          </div>

          {/* Special Toggles */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">In Stock Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyDeals}
                onChange={(e) => setOnlyDeals(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Discounted Deals Only</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyFeatured}
                onChange={(e) => setOnlyFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">Featured Items Only</span>
            </label>
          </div>
        </div>

        {/* Products Grid */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
                  <div className="bg-slate-200 dark:bg-slate-800 h-36 rounded-xl w-full" />
                  <div className="bg-slate-200 dark:bg-slate-800 h-4 rounded w-3/4" />
                  <div className="bg-slate-200 dark:bg-slate-800 h-4 rounded w-1/2" />
                  <div className="bg-slate-200 dark:bg-slate-800 h-8 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg">No products found</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms, changing the category, or clearing the active filters.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-emerald-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-xs bg-white dark:bg-slate-900 shadow-2xl p-5 flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Filters</h3>
                  <button onClick={() => setIsMobileFilterOpen(false)}>
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 uppercase mb-2">Category</h4>
                  <div className="space-y-1 text-xs max-h-48 overflow-y-auto">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3 py-1.5 rounded-xl font-medium ${
                        selectedCategory === "" ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold" : "text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.slug)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl font-medium ${
                          selectedCategory === c.slug ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold" : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">Max Price</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{maxPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="50000"
                    step="500"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span>₹500</span>
                    <span>₹50,000+</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onlyInStock}
                      onChange={(e) => setOnlyInStock(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span>In Stock Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onlyDeals}
                      onChange={(e) => setOnlyDeals(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span>Deals Only</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={(e) => setOnlyFeatured(e.target.checked)}
                      className="accent-emerald-600"
                    />
                    <span>Featured Items Only</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-xs shadow-md active:scale-95"
                >
                  Apply Filters ({products.length} items)
                </button>
                <button
                  onClick={() => {
                    clearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm font-semibold text-slate-500">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
