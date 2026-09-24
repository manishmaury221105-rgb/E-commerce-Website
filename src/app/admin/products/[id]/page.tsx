"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Package } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { Category, Product } from "@/types";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { success, error } = useToast();
  const productId = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [unit, setUnit] = useState("1 kg");
  const [stock, setStock] = useState("0");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDailyDeal, setIsDailyDeal] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/products/${productId}`).then((r) => r.json()),
    ])
      .then(([catsData, prodData]) => {
        if (catsData.categories) setCategories(catsData.categories);
        if (prodData.product) {
          const p: Product = prodData.product;
          setName(p.name);
          setSlug(p.slug);
          setCategoryId(p.categoryId);
          setPrice(p.price.toString());
          setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : "");
          setCostPrice(p.costPrice ? p.costPrice.toString() : "");
          setUnit(p.unit);
          setStock(p.stock.toString());
          setLowStockThreshold(p.lowStockThreshold.toString());
          setSku(p.sku || "");
          setBarcode(p.barcode || "");
          setShortDescription(p.shortDescription || "");
          setDescription(p.description || "");
          const rawImages = Array.isArray(p.images)
            ? p.images
            : typeof p.images === "string"
            ? JSON.parse(p.images || "[]")
            : [];
          setImages(rawImages.length > 0 ? rawImages : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"]);
          setIsFeatured(p.isFeatured);
          setIsDailyDeal(p.isDailyDeal);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleMultipleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const result = reader.result;
          setImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddUrl = () => {
    if (urlInput.trim()) {
      setImages((prev) => [...prev, urlInput.trim()]);
      setUrlInput("");
    }
  };

  const handleSetCover = (index: number) => {
    setImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  const handleRemovePhoto = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (from: number, to: number) => {
    setImages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) {
      error("Please fill in required fields (Name, Price, Category)");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          categoryId,
          price,
          compareAtPrice: compareAtPrice || null,
          costPrice: costPrice || null,
          unit,
          stock,
          lowStockThreshold,
          sku: sku || null,
          barcode: barcode || null,
          shortDescription: shortDescription || null,
          description: description || name,
          images: images.length > 0 ? images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"],
          isFeatured,
          isDailyDeal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to update product");
        return;
      }

      success(`Product "${name}" updated successfully with ${images.length} photos!`);
      router.push("/admin/products");
    } catch (err: any) {
      error("Error updating product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        success("Product deleted");
        router.push("/admin/products");
      }
    } catch (err) {
      error("Error deleting product");
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading product details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-white">Edit Product</h1>
            <p className="text-xs text-slate-400">Modify pricing, inventory levels, and product tags</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="p-2.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-xl transition-colors text-xs font-bold flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Delete Product</span>
        </button>
      </div>

      {/* Product Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Info */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
            General Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">URL Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Unit / Pack Size *</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
            Pricing & Inventory
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Original Price (₹ MRP)</label>
              <input
                type="number"
                step="0.5"
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Cost Price (₹ Internal)</label>
              <input
                type="number"
                step="0.5"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Quantity *</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Low Stock Alert at</label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Media & Badges */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
              <span>📸 Product Photos & Gallery</span>
            </h3>
            <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-800/60">
              {images.length} {images.length === 1 ? "Photo" : "Photos"}
            </span>
          </div>

          {/* Active Photos Gallery Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Current Gallery (The 1st photo is the primary storefront cover)</span>
              <span>Drag or use buttons to reorder</span>
            </div>

            {images.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl text-center text-slate-400 text-xs">
                No photos added yet. Upload files from device or choose presets below.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-1 max-h-64 overflow-y-auto">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative group rounded-2xl overflow-hidden border-2 bg-slate-800/80 shadow-md ${
                      idx === 0 ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-700"
                    }`}
                  >
                    <div className="aspect-square w-full">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>

                    {/* Cover Badge / Button */}
                    {idx === 0 ? (
                      <div className="absolute top-1.5 left-1.5 bg-emerald-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-md">
                        ⭐ Cover
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="absolute top-1.5 left-1.5 bg-black/75 hover:bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Make Cover
                      </button>
                    )}

                    {/* Delete Photo */}
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove"
                    >
                      ✕
                    </button>

                    {/* Move Left / Right */}
                    <div className="absolute bottom-1.5 inset-x-1.5 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMovePhoto(idx, idx - 1)}
                        className="bg-black/80 hover:bg-slate-700 disabled:opacity-30 text-white text-[10px] px-1.5 py-0.5 rounded"
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={idx === images.length - 1}
                        onClick={() => handleMovePhoto(idx, idx + 1)}
                        className="bg-black/80 hover:bg-slate-700 disabled:opacity-30 text-white text-[10px] px-1.5 py-0.5 rounded"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Photos Section */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Add More Photos to Gallery
            </h4>

            {/* 1. Upload from Computer/Device */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Option 1: Upload from Computer / Phone <span className="text-emerald-400 font-normal">(Select multiple files at once)</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-800 rounded-xl p-1 border border-slate-700"
              />
            </div>

            {/* 2. Paste Direct URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Option 2: Or Add Photo via Web URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all"
                >
                  + Add URL
                </button>
              </div>
            </div>

            </div>

          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-emerald-600 w-4 h-4"
              />
              <span className="font-semibold">Featured on Homepage</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isDailyDeal}
                onChange={(e) => setIsDailyDeal(e.target.checked)}
                className="accent-amber-500 w-4 h-4"
              />
              <span className="font-semibold text-amber-400">Mark as Deal of the Day (Flash Sale)</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving Changes..." : "Update Product"}</span>
          </button>
          <Link
            href="/admin/products"
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs px-5 py-3 rounded-xl transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
