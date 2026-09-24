"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Trash2, Edit2, Image as ImageIcon, CheckCircle2, ArrowRight } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Category, Banner } from "@/types";
import { subscribeToCategories, subscribeToBanners } from "@/lib/firestore-service";

export default function AdminCategoriesPage() {
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catDescription, setCatDescription] = useState("");
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Banner State
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerTag, setBannerTag] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/products");
  const [isAddingBanner, setIsAddingBanner] = useState(false);

  useEffect(() => {
    const unsubCats = subscribeToCategories((liveCats) => {
      setCategories(liveCats);
      setLoading(false);
    });

    const unsubBanners = subscribeToBanners((liveBanners) => {
      setBanners(liveBanners);
    });

    return () => {
      unsubCats();
      unsubBanners();
    };
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName,
          slug: catSlug || undefined,
          image: catImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
          description: catDescription,
          isFeatured: true,
        }),
      });

      if (res.ok) {
        success(`Category "${catName}" created.`);
        setCatName("");
        setCatSlug("");
        setCatImage("");
        setCatDescription("");
        setIsAddingCat(false);
      } else {
        error("Failed to create category");
      }
    } catch (err) {
      error("Error creating category");
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImage) {
      error("Title and Image URL are required for banner");
      return;
    }

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: bannerTitle,
          subtitle: bannerSubtitle,
          tag: bannerTag,
          image: bannerImage,
          link: bannerLink,
        }),
      });

      if (res.ok) {
        success("Hero Banner created.");
        setBannerTitle("");
        setBannerSubtitle("");
        setBannerTag("");
        setBannerImage("");
        setIsAddingBanner(false);
      }
    } catch (err) {
      error("Error creating banner");
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) {
        success(`Category "${name}" deleted.`);
      } else {
        const data = await res.json();
        error(data.error || "Failed to delete category");
      }
    } catch (err) {
      error("Error deleting category");
    }
  };

  const handleDeleteBanner = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete banner "${title}"?`)) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (res.ok) {
        success(`Banner "${title}" deleted successfully.`);
      } else {
        const data = await res.json();
        error(data.error || "Failed to delete banner");
      }
    } catch (err) {
      error("Error deleting banner");
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
          Categories & Promotional Banners
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Organize store product departments and manage homepage hero carousels
        </p>
      </div>

      {/* 1. Categories Management Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-heading font-bold text-base text-white">Product Categories</h2>
            <p className="text-xs text-slate-400">{categories.length} active departments</p>
          </div>
          <button
            onClick={() => setIsAddingCat(!isAddingCat)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingCat ? "Cancel" : "Add Category"}</span>
          </button>
        </div>

        {/* Add Category Form */}
        {isAddingCat && (
          <form
            onSubmit={handleCreateCategory}
            className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-3 animate-in fade-in duration-200"
          >
            <h3 className="text-xs font-bold text-slate-200 uppercase">Create New Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!catSlug) {
                      setCatSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "")
                      );
                    }
                  }}
                  placeholder="e.g. Organic Farm Spices"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="organic-farm-spices"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={catImage}
                  onChange={(e) => setCatImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
              <input
                type="text"
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Fresh whole spices and herbal seasonings"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-2 rounded-xl"
            >
              Save Category
            </button>
          </form>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                  <img
                    src={cat.image || "https://placehold.co/100x100"}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs leading-snug">{cat.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cat.productCount || 0} products
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Hero Banners Management Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-heading font-bold text-base text-white">Homepage Hero Banners</h2>
            <p className="text-xs text-slate-400">Manage promotional slides and announcement callouts</p>
          </div>
          <button
            onClick={() => setIsAddingBanner(!isAddingBanner)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingBanner ? "Cancel" : "Add Banner"}</span>
          </button>
        </div>

        {/* Add Banner Form */}
        {isAddingBanner && (
          <form
            onSubmit={handleCreateBanner}
            className="bg-slate-800 p-5 rounded-2xl border border-slate-700 space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Create New Hero Slide</h3>

            {/* Live Banner Preview Box */}
            <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
              <div className="w-32 h-18 rounded-xl overflow-hidden bg-slate-800 border-2 border-emerald-500 shadow-md flex-shrink-0">
                <img
                  src={bannerImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"}
                  alt="Banner preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-1 text-xs">
                <p className="font-bold text-white">Banner Live Preview</p>
                <p className="text-[11px] text-slate-400">
                  This promo slide will rotate on the homepage hero carousel for all visitors.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="e.g. Super Weekend Pantry Sale"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tag Pill Badge</label>
                <input
                  type="text"
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  placeholder="⚡ 30% OFF PANTRY"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Banner Photo Options */}
            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-700/80">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Option 1: Upload Banner Photo from Computer / Phone
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        if (typeof reader.result === "string") {
                          setBannerImage(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-800 rounded-xl p-1 border border-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Option 2: Or Paste Image URL Link *
                </label>
                <input
                  type="url"
                  required
                  value={bannerImage}
                  onChange={(e) => setBannerImage(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Link</label>
                <input
                  type="text"
                  value={bannerLink}
                  onChange={(e) => setBannerLink(e.target.value)}
                  placeholder="/products?category=grocery-staples"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subtitle</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  placeholder="Get up to 30% OFF on basmati rice and cooking oils"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
              >
                Publish Banner
              </button>
              <button
                type="button"
                onClick={() => setIsAddingBanner(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Banners List */}
        <div className="space-y-3">
          {banners.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
              No hero banners found. Click &quot;Add Banner&quot; above to create one.
            </div>
          ) : (
            banners.map((b) => (
              <div
                key={b.id}
                className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 group hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                  <div className="w-24 h-14 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                    <img
                      src={b.image}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800";
                      }}
                    />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-xs">{b.title}</span>
                      {b.tag && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800/60">
                          {b.tag}
                        </span>
                      )}
                    </div>
                    {b.subtitle && (
                      <p className="text-[11px] text-slate-400 truncate max-w-md">{b.subtitle}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                  <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-lg border border-slate-800">
                    {b.link}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteBanner(b.id, b.title)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-semibold group/del"
                    title={`Delete Banner "${b.title}"`}
                  >
                    <Trash2 className="w-4 h-4 text-rose-400 group-hover/del:scale-110 transition-transform" />
                    <span className="text-rose-400 text-xs">Delete</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
