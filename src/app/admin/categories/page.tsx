"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Upload,
  Sparkles,
  Link as LinkIcon,
  X,
  CheckCircle2,
  ArrowRight,
  FolderPlus,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Category, Banner } from "@/types";
import { subscribeToCategories, subscribeToBanners } from "@/lib/firestore-service";
import { processAndUploadImage } from "@/lib/image-utils";

const CATEGORY_PRESETS = [
  { name: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop" },
  { name: "Dairy, Bread & Eggs", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop" },
  { name: "Snacks & Munchies", image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop" },
  { name: "Cold Drinks & Juices", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&auto=format&fit=crop" },
  { name: "Atta, Rice & Dal", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop" },
  { name: "Masalas & Spices", image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop" },
  { name: "Oils & Ghee", image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop" },
  { name: "Bakery & Cakes", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop" },
  { name: "Tea, Coffee & Beverages", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop" },
  { name: "Personal & Body Care", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop" },
  { name: "Cleaning & Household", image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=600&auto=format&fit=crop" },
  { name: "Instant & Frozen Food", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop" },
];

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
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoSourceTab, setPhotoSourceTab] = useState<"upload" | "presets" | "url">("upload");
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Category Modal State
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatSlug, setEditCatSlug] = useState("");
  const [editCatImage, setEditCatImage] = useState("");
  const [editCatDescription, setEditCatDescription] = useState("");
  const [isEditUploadingPhoto, setIsEditUploadingPhoto] = useState(false);
  const [editPhotoSourceTab, setEditPhotoSourceTab] = useState<"upload" | "presets" | "url">("upload");
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // New Banner State
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerTag, setBannerTag] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerLink, setBannerLink] = useState("/products");
  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isUploadingBannerPhoto, setIsUploadingBannerPhoto] = useState(false);
  const [bannerPhotoSourceTab, setBannerPhotoSourceTab] = useState<"upload" | "url">("upload");

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

  // Handle Photo File Upload for New Category
  const handleCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Please select a valid image file (PNG, JPG, WEBP, etc.)");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const processedUrl = await processAndUploadImage(file, "categories", 600, 600);
      setCatImage(processedUrl);
      success("Photo processed and ready!");
    } catch (err) {
      console.error("Photo processing error:", err);
      error("Failed to process photo. Please try another image.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Handle Photo File Upload for Edit Category
  const handleEditCategoryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Please select a valid image file");
      return;
    }

    setIsEditUploadingPhoto(true);
    try {
      const processedUrl = await processAndUploadImage(file, "categories", 600, 600);
      setEditCatImage(processedUrl);
      success("Photo updated successfully!");
    } catch (err) {
      console.error("Photo processing error:", err);
      error("Failed to process photo.");
    } finally {
      setIsEditUploadingPhoto(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      error("Category name is required");
      return;
    }

    const finalSlug = (catSlug || catName)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: catName.trim(),
          slug: finalSlug,
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
        const data = await res.json();
        error(data.error || "Failed to create category");
      }
    } catch (err) {
      error("Error creating category");
    }
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setEditCatName(cat.name || "");
    setEditCatSlug(cat.slug || "");
    setEditCatImage(cat.image || "");
    setEditCatDescription(cat.description || "");
    setEditPhotoSourceTab("upload");
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editCatName.trim()) return;

    setIsUpdating(true);
    try {
      const finalSlug = (editCatSlug || editCatName)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editCatName.trim(),
          slug: finalSlug,
          image: editCatImage,
          description: editCatDescription,
        }),
      });

      if (res.ok) {
        success(`Category "${editCatName}" updated successfully.`);
        setEditingCategory(null);
      } else {
        const data = await res.json();
        error(data.error || "Failed to update category");
      }
    } catch (err) {
      error("Error updating category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle || !bannerImage) {
      error("Title and Image are required for banner");
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
    if (!confirm(`Delete category "${name}"? This action cannot be undone.`)) return;
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
        <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight flex items-center gap-3">
          <Layers className="w-7 h-7 text-emerald-400" />
          <span>Categories & Promotional Banners</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Organize store product departments, upload photos, and manage homepage hero carousels
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
            onClick={() => {
              setIsAddingCat(!isAddingCat);
              if (!isAddingCat) {
                setCatName("");
                setCatSlug("");
                setCatImage("");
                setCatDescription("");
              }
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingCat ? "Cancel" : "Add Category"}</span>
          </button>
        </div>

        {/* Add Category Form */}
        {isAddingCat && (
          <form
            onSubmit={handleCreateCategory}
            className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-5 animate-in fade-in duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <FolderPlus className="w-4 h-4" />
                <span>Create New Category</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingCat(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>

            {/* Name & Slug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    const newName = e.target.value;
                    setCatName(newName);
                    setCatSlug(
                      newName
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "")
                    );
                  }}
                  placeholder="e.g. Sarees & Ethnic Wear"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (URL identifier)</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="sarees-ethnic-wear"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Photo Selection Component */}
            <div className="space-y-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Category Photo</span>
                </label>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("upload")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      photoSourceTab === "upload"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("presets")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      photoSourceTab === "presets"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Choose Preset</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPhotoSourceTab("url")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      photoSourceTab === "url"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Image URL</span>
                  </button>
                </div>
              </div>

              {/* Photo Preview & Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Image Preview Box */}
                <div className="md:col-span-4 flex items-center gap-3 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-900 border-2 border-emerald-500/80 shadow-md flex-shrink-0 relative group flex items-center justify-center">
                    {isUploadingPhoto ? (
                      <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    ) : catImage ? (
                      <img
                        src={catImage}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-white truncate">
                      {isUploadingPhoto ? "Processing..." : catImage ? "Photo Selected" : "No Photo Chosen"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {isUploadingPhoto ? "Optimizing image size" : catImage ? "Ready to save (Optimized)" : "Upload or pick a photo"}
                    </p>
                    {catImage && !isUploadingPhoto && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatImage("");
                          if (catFileInputRef.current) catFileInputRef.current.value = "";
                        }}
                        className="mt-1 text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Clear Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab 1: Upload from Device */}
                {photoSourceTab === "upload" && (
                  <div className="md:col-span-8 space-y-2">
                    <input
                      ref={catFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCategoryFileUpload}
                      className="hidden"
                      id="category-file-upload"
                      disabled={isUploadingPhoto}
                    />
                    <label
                      htmlFor="category-file-upload"
                      className={`flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-800/60 hover:bg-slate-800 rounded-xl cursor-pointer transition-all group text-center ${
                        isUploadingPhoto ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      {isUploadingPhoto ? (
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-1.5" />
                      ) : (
                        <Upload className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform mb-1.5" />
                      )}
                      <span className="text-xs font-bold text-slate-200">
                        {isUploadingPhoto ? "Compressing & Processing..." : "Click to Choose Photo from Device / Gallery"}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        Supports JPG, PNG, WEBP (Auto-optimized for instant fast loading)
                      </span>
                    </label>
                  </div>
                )}

                {/* Tab 2: Choose Preset */}
                {photoSourceTab === "presets" && (
                  <div className="md:col-span-8">
                    <p className="text-[11px] text-slate-400 mb-2">Click a category photo preset to select it:</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto pr-1">
                      {CATEGORY_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCatImage(preset.image)}
                          className={`p-1.5 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                            catImage === preset.image
                              ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                              : "border-slate-700 bg-slate-800/60 text-slate-300 hover:border-slate-500"
                          }`}
                        >
                          <img
                            src={preset.image}
                            alt={preset.name}
                            className="w-full h-12 object-cover rounded-lg"
                          />
                          <span className="text-[10px] truncate w-full text-center">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 3: Custom URL */}
                {photoSourceTab === "url" && (
                  <div className="md:col-span-8 space-y-1">
                    <label className="block text-[11px] font-semibold text-slate-400">
                      Paste Direct Image URL
                    </label>
                    <input
                      type="url"
                      value={catImage}
                      onChange={(e) => setCatImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
              <input
                type="text"
                value={catDescription}
                onChange={(e) => setCatDescription(e.target.value)}
                placeholder="Fresh whole spices, seasonings and herbs"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isUploadingPhoto}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save Category</span>
              </button>
              <button
                type="button"
                onClick={() => setIsAddingCat(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.length === 0 && !loading && (
            <div className="col-span-full p-8 border-2 border-dashed border-slate-800 rounded-2xl text-center text-slate-400 text-xs">
              No categories created yet. Click &quot;Add Category&quot; above to create your first department.
            </div>
          )}

          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between gap-3 group hover:border-slate-600 transition-all shadow-md"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 flex-shrink-0">
                  <img
                    src={cat.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-xs leading-snug truncate" title={cat.name}>
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate font-mono">
                    /{cat.slug}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">
                    {cat.productCount || 0} products
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Edit Category & Photo"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" />
                <span>Edit Category: {editingCategory.name}</span>
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editCatName}
                    onChange={(e) => {
                      setEditCatName(e.target.value);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editCatSlug}
                    onChange={(e) => setEditCatSlug(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Photo Options in Edit Modal */}
              <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-400" />
                    <span>Update Category Photo</span>
                  </label>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setEditPhotoSourceTab("upload")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        editPhotoSourceTab === "upload"
                          ? "bg-emerald-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPhotoSourceTab("presets")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        editPhotoSourceTab === "presets"
                          ? "bg-emerald-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Presets</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditPhotoSourceTab("url")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        editPhotoSourceTab === "url"
                          ? "bg-emerald-600 text-white shadow"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>URL</span>
                    </button>
                  </div>
                </div>

                {/* Preview & Edit Tab Content */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-4 flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-700">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-800 border-2 border-emerald-500 flex-shrink-0 flex items-center justify-center">
                      {isEditUploadingPhoto ? (
                        <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                      ) : (
                        <img
                          src={editCatImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600"}
                          alt="Edit preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600";
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white">
                        {isEditUploadingPhoto ? "Processing..." : "Current Photo"}
                      </p>
                      {editCatImage && !isEditUploadingPhoto && (
                        <button
                          type="button"
                          onClick={() => setEditCatImage("")}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-0.5 mt-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {editPhotoSourceTab === "upload" && (
                    <div className="sm:col-span-8">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleEditCategoryFileUpload}
                        className="hidden"
                        id="edit-category-file-upload"
                        disabled={isEditUploadingPhoto}
                      />
                      <label
                        htmlFor="edit-category-file-upload"
                        className={`flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/60 rounded-xl cursor-pointer transition-all group text-center ${
                          isEditUploadingPhoto ? "opacity-50 pointer-events-none" : ""
                        }`}
                      >
                        {isEditUploadingPhoto ? (
                          <Loader2 className="w-5 h-5 text-emerald-400 animate-spin mb-1" />
                        ) : (
                          <Upload className="w-5 h-5 text-emerald-400 mb-1" />
                        )}
                        <span className="text-xs font-bold text-slate-200">
                          {isEditUploadingPhoto ? "Optimizing Photo..." : "Upload New Photo from Device"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Click to select a photo from your computer/mobile
                        </span>
                      </label>
                    </div>
                  )}

                  {editPhotoSourceTab === "presets" && (
                    <div className="sm:col-span-8">
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {CATEGORY_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditCatImage(preset.image)}
                            className={`p-1 rounded-lg border flex flex-col items-center gap-0.5 ${
                              editCatImage === preset.image
                                ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                                : "border-slate-700 bg-slate-900/60 text-slate-300"
                            }`}
                          >
                            <img
                              src={preset.image}
                              alt={preset.name}
                              className="w-full h-8 object-cover rounded"
                            />
                            <span className="text-[9px] truncate w-full text-center">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {editPhotoSourceTab === "url" && (
                    <div className="sm:col-span-8">
                      <input
                        type="url"
                        value={editCatImage}
                        onChange={(e) => setEditCatImage(e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={editCatDescription}
                  onChange={(e) => setEditCatDescription(e.target.value)}
                  placeholder="Fresh whole spices and herbal seasonings"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || isEditUploadingPhoto}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  {isUpdating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Hero Banners Management Section */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="font-heading font-bold text-base text-white">Homepage Hero Banners</h2>
            <p className="text-xs text-slate-400">Manage promotional slides and announcement callouts</p>
          </div>
          <button
            onClick={() => setIsAddingBanner(!isAddingBanner)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingBanner ? "Cancel" : "Add Banner"}</span>
          </button>
        </div>

        {/* Add Banner Form */}
        {isAddingBanner && (
          <form
            onSubmit={handleCreateBanner}
            className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-4 animate-in fade-in duration-200"
          >
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Create New Hero Slide</h3>

            {/* Live Banner Preview Box */}
            <div className="flex items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
              <div className="w-32 h-18 rounded-xl overflow-hidden bg-slate-800 border-2 border-emerald-500 shadow-md flex-shrink-0 flex items-center justify-center">
                {isUploadingBannerPhoto ? (
                  <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                ) : (
                  <img
                    src={bannerImage || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"}
                    alt="Banner preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800";
                    }}
                  />
                )}
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
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Banner Photo</span>
                </label>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setBannerPhotoSourceTab("upload")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      bannerPhotoSourceTab === "upload"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerPhotoSourceTab("url")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      bannerPhotoSourceTab === "url"
                        ? "bg-emerald-600 text-white shadow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>URL</span>
                  </button>
                </div>
              </div>

              {bannerPhotoSourceTab === "upload" ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingBannerPhoto}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setIsUploadingBannerPhoto(true);
                        try {
                          const url = await processAndUploadImage(file, "banners", 1200, 600);
                          setBannerImage(url);
                          success("Banner photo loaded.");
                        } catch (err) {
                          error("Failed to process banner photo.");
                        } finally {
                          setIsUploadingBannerPhoto(false);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-800 rounded-xl p-1 border border-slate-700"
                  />
                </div>
              ) : (
                <div>
                  <input
                    type="url"
                    required
                    value={bannerImage}
                    onChange={(e) => setBannerImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
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
                disabled={isUploadingBannerPhoto}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
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
