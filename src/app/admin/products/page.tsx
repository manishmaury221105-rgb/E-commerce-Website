"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Product, Category } from "@/types";

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Quick Multi-Photo Edit Modal State
  const [editingPhotoProduct, setEditingPhotoProduct] = useState<Product | null>(null);
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [isUpdatingPhoto, setIsUpdatingPhoto] = useState(false);

  // Photo Presets for quick selection
  const PHOTO_PRESETS = [
    { label: "🍎 Apples", url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800" },
    { label: "🍌 Bananas", url: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800" },
    { label: "🥭 Mangoes", url: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800" },
    { label: "🥔 Potatoes", url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800" },
    { label: "🍅 Tomatoes", url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800" },
    { label: "🥛 Fresh Milk", url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800" },
    { label: "🍞 Wheat Bread", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800" },
    { label: "🌾 Basmati Rice", url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800" },
    { label: "🥜 Almonds", url: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800" },
    { label: "🍟 Potato Chips", url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800" },
    { label: "🧃 Orange Juice", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800" },
    { label: "🧼 Dishwash Soap", url: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=800" },
  ];

  const fetchProducts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (selectedCategory) params.set("category", selectedCategory);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        success(`Product "${name}" deleted successfully.`);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        error("Failed to delete product.");
      }
    } catch (err) {
      error("Error deleting product.");
    }
  };

  const handleQuickStockUpdate = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
        );
        success("Stock updated.");
      }
    } catch (err) {
      error("Failed to update stock");
    }
  };

  const openPhotoModal = (prod: Product) => {
    setEditingPhotoProduct(prod);
    const images = Array.isArray(prod.images)
      ? prod.images
      : typeof prod.images === "string"
      ? JSON.parse(prod.images || "[]")
      : [];
    setModalPhotos(images.length > 0 ? images : ["https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"]);
    setPhotoUrlInput("");
  };

  const handleMultipleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const result = reader.result;
          setModalPhotos((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleAddUrlPhoto = () => {
    if (photoUrlInput.trim()) {
      setModalPhotos((prev) => [...prev, photoUrlInput.trim()]);
      setPhotoUrlInput("");
    }
  };

  const handleSetCover = (index: number) => {
    setModalPhotos((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  const handleRemovePhoto = (index: number) => {
    setModalPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMovePhoto = (from: number, to: number) => {
    setModalPhotos((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });
  };

  const handleSavePhotos = async () => {
    if (!editingPhotoProduct) return;
    if (modalPhotos.length === 0) {
      error("Please add at least one photo for the product");
      return;
    }

    setIsUpdatingPhoto(true);
    try {
      const res = await fetch(`/api/products/${editingPhotoProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: modalPhotos,
        }),
      });

      if (res.ok) {
        success("Product photos updated successfully!");
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingPhotoProduct.id
              ? { ...p, images: modalPhotos }
              : p
          )
        );
        setEditingPhotoProduct(null);
      } else {
        error("Failed to update product photos");
      }
    } catch (err) {
      error("Error updating photos");
    } finally {
      setIsUpdatingPhoto(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Products & Inventory
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage product photos, pricing, stock levels, daily deals and catalog items
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name, SKU..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading products catalog...</div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-semibold">No products found matching filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4 w-20">Photo</th>
                  <th className="p-4">Product Name & SKU</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {products.map((prod) => {
                  const isLow = prod.stock <= (prod.lowStockThreshold || 5);
                  const isOut = prod.stock <= 0;
                  const images = Array.isArray(prod.images)
                    ? prod.images
                    : typeof prod.images === "string"
                    ? JSON.parse(prod.images || "[]")
                    : [];
                  const mainImage = images[0] || "https://placehold.co/120x120?text=Product";

                  return (
                    <tr key={prod.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Product Photo & 1-Click Change Trigger */}
                      <td className="p-4">
                        <div className="relative group/img cursor-pointer" onClick={() => openPhotoModal(prod)}>
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-800 border-2 border-slate-700 group-hover/img:border-emerald-500 flex-shrink-0 shadow-md transition-all relative">
                            <img
                              src={mainImage}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
                            />
                            {images.length > 1 && (
                              <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-xs text-[9px] font-extrabold text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
                                +{images.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-[10px] font-bold text-white text-center p-1">
                            {images.length > 1 ? `${images.length} Photos` : "Edit"}
                          </div>
                        </div>
                      </td>

                      {/* Product Name & SKU */}
                      <td className="p-4">
                        <div>
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="font-bold text-white hover:text-emerald-400 transition-colors text-xs line-clamp-1"
                          >
                            {prod.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-slate-500 font-mono">
                              SKU: {prod.sku || "N/A"}
                            </span>
                            <button
                              onClick={() => openPhotoModal(prod)}
                              className="text-[10px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                            >
                              <span>📸 {images.length > 1 ? `${images.length} Photos` : "Edit Photos"}</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-slate-400">
                        {prod.category?.name || "Uncategorized"}
                      </td>

                      {/* Price */}
                      <td className="p-4">
                        <div className="font-bold text-slate-200">
                          {formatCurrency(prod.price)}
                        </div>
                        <span className="text-[10px] text-slate-500">{prod.unit}</span>
                      </td>

                      {/* Stock Level with Quick Adjustment */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={prod.stock}
                            onBlur={(e) => {
                              const val = parseInt(e.target.value);
                              if (!isNaN(val) && val !== prod.stock) {
                                handleQuickStockUpdate(prod.id, val);
                              }
                            }}
                            className={`w-16 bg-slate-800 border rounded-lg px-2 py-1 text-xs font-bold focus:outline-none ${
                              isOut
                                ? "border-rose-500 text-rose-400"
                                : isLow
                                ? "border-amber-500 text-amber-400"
                                : "border-slate-700 text-emerald-400"
                            }`}
                          />
                          {isOut ? (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded">
                              Out
                            </span>
                          ) : isLow ? (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded">
                              Low
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Tags (Featured / Deal) */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {prod.isFeatured && (
                            <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {prod.isDailyDeal && (
                            <span className="bg-amber-950/80 border border-amber-800/60 text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Flash Deal
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openPhotoModal(prod)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg transition-colors"
                            title="Manage Photos"
                          >
                            📸
                          </button>
                          <Link
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                            title="View on storefront"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                            title="Edit product details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="p-1.5 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Multiple Photos Gallery Management Modal */}
      {editingPhotoProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-base sm:text-lg text-white flex items-center gap-2">
                  <span>📸 Manage Multiple Product Photos</span>
                  <span className="text-xs bg-emerald-950 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                    {modalPhotos.length} {modalPhotos.length === 1 ? "Photo" : "Photos"}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-sm sm:max-w-md">
                  {editingPhotoProduct.name}
                </p>
              </div>
              <button
                onClick={() => setEditingPhotoProduct(null)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Current Active Photos Gallery */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Current Photo Gallery ({modalPhotos.length})
                </label>
                <span className="text-[11px] text-slate-400">
                  The 1st photo (Cover) will be displayed on catalog cards.
                </span>
              </div>

              {modalPhotos.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl text-center text-slate-400 text-xs">
                  No photos added yet. Upload files below or choose preset photos.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto p-1">
                  {modalPhotos.map((photo, idx) => (
                    <div
                      key={idx}
                      className={`relative group rounded-2xl overflow-hidden border-2 bg-slate-800/80 shadow-md ${
                        idx === 0 ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-slate-700"
                      }`}
                    >
                      <div className="aspect-square w-full">
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Primary Cover Badge */}
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

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-500 text-white w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shadow-md opacity-0 group-hover:opacity-100 transition-all"
                        title="Remove Photo"
                      >
                        ✕
                      </button>

                      {/* Reorder Buttons (Move Left / Right) */}
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
                          disabled={idx === modalPhotos.length - 1}
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

            {/* Add More Photos Controls */}
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Add More Photos
              </h4>

              {/* 1. Multi File Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  1. Upload from Phone / Laptop <span className="text-emerald-400 font-normal">(Select multiple files at once)</span>
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFileUpload}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer bg-slate-800 rounded-xl p-1 border border-slate-700"
                />
              </div>

              {/* 2. Direct URL Append */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  2. Or Add Photo via Web URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={photoUrlInput}
                    onChange={(e) => setPhotoUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddUrlPhoto();
                      }
                    }}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlPhoto}
                    disabled={!photoUrlInput.trim()}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    + Add URL
                  </button>
                </div>
              </div>

              {/* 3. 1-Click Grocery Presets (Append) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  3. Or Click to Add Grocery Presets to Gallery
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-28 overflow-y-auto pr-1">
                  {PHOTO_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setModalPhotos((prev) => [...prev, preset.url])}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] font-semibold text-slate-200 text-left truncate active:scale-95 transition-all"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-400">
                Total: <strong className="text-white">{modalPhotos.length}</strong> {modalPhotos.length === 1 ? "photo" : "photos"} selected
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPhotoProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePhotos}
                  disabled={isUpdatingPhoto || modalPhotos.length === 0}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  {isUpdatingPhoto ? "Saving..." : `Save ${modalPhotos.length} Photos`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
