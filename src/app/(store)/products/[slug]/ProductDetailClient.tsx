"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RefreshCw,
  MessageCircle,
  Clock,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency, generateWhatsAppProductOrderLink } from "@/lib/utils";
import { ProductCard } from "@/components/storefront/ProductCard";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const { addItem, items, updateQuantity } = useCart();
  const { success, error } = useToast();
  const router = useRouter();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState(product.reviews || []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [newReviewerName, setNewReviewerName] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);
  const isInCart = Boolean(cartItem);

  const images = product.images.length > 0 ? product.images : ["https://placehold.co/600x600?text=Product"];

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (!isInCart) {
      addItem(product, quantity);
    }
    router.push("/checkout");
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.trim().length >= 5) {
      setPincodeChecked(true);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newReviewerName.trim()) {
      error("Please provide your name and review comments");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: newRating,
          comment: newComment,
          userName: newReviewerName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to submit review");
        return;
      }

      setReviews((prev) => [data.review, ...prev]);
      success("Thank you! Your review has been added.");
      setNewComment("");
      setNewReviewerName("");
    } catch (err: any) {
      error("Error submitting review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-24 md:pb-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 overflow-hidden">
        <Link href="/" className="hover:text-slate-800 dark:hover:text-white flex-shrink-0">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <Link href="/products" className="hover:text-slate-800 dark:hover:text-white flex-shrink-0">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-slate-800 dark:hover:text-white truncate">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        {/* Gallery (Left: 5 cols) */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="relative rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-square">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {discountPercent && (
              <div className="absolute top-3 left-3 bg-rose-500 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-md">
                {discountPercent}% OFF
              </div>
            )}
            {product.isDailyDeal && (
              <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                <Zap className="w-3 h-3 fill-amber-950" />
                <span>FLASH DEAL</span>
              </div>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? "border-emerald-600 dark:border-emerald-400 scale-105 shadow-md" : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details (Middle: 7 cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                {product.unit}
              </span>
              {product.category && (
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {product.category.name}
                </span>
              )}
            </div>

            <h1 className="font-heading font-extrabold text-xl sm:text-3xl text-slate-900 dark:text-white tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Stock badge */}
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                <Star className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
                <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
                <span className="text-emerald-600/70 dark:text-emerald-400/70">({reviews.length} reviews)</span>
              </div>

              {isOutOfStock ? (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-lg">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-lg">
                  Only {product.stock} items left!
                </span>
              ) : (
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 flex items-baseline gap-3">
            <span className="font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base text-slate-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                  Save {formatCurrency(product.compareAtPrice - product.price)}
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed space-y-2">
            <p>{product.description}</p>
          </div>

          {/* Quantity & Desktop Action Buttons */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-90"
                    aria-label="Decrease"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-90"
                    aria-label="Increase"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl text-sm active:scale-95 transition-all border border-transparent dark:border-slate-700"
              >
                Buy Now
              </button>
            </div>

            {/* Direct WhatsApp Order Button */}
            <a
              href={generateWhatsAppProductOrderLink(
                "+917380492118",
                product.name,
                product.price,
                typeof window !== "undefined" ? window.location.href : ""
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm border border-[#25D366]/30 transition-colors active:scale-98"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Order on WhatsApp (Fast Response)</span>
            </a>
          </div>

          {/* Delivery Pin-code Checker */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Delivery Availability Checker</span>
            </h4>
            <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-sm">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value);
                  setPincodeChecked(false);
                }}
                placeholder="Enter 6-digit Pincode (e.g. 110001)"
                maxLength={6}
                className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs flex-1 focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors active:scale-95"
              >
                Check
              </button>
            </form>

            {pincodeChecked && (
              <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in duration-200">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>
                  ⚡ Fast Delivery Available! Order now to get it delivered within <strong>45 minutes</strong>.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
              Customer Reviews & Ratings
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Verified feedback from neighborhood buyers</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="font-bold text-slate-800 dark:text-white text-sm">{product.rating ? product.rating.toFixed(1) : "5.0"} out of 5</span>
          </div>
        </div>

        {/* Add Review Form */}
        <form onSubmit={handleSubmitReview} className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Leave a Review</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={newReviewerName}
                onChange={(e) => setNewReviewerName(e.target.value)}
                placeholder="e.g. Priya S."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rating</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Below Average)</option>
                <option value={1}>⭐ (1 - Poor)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Feedback</label>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="How was the quality, packaging, and delivery time?"
              rows={3}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingReview}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-colors active:scale-95"
          >
            {isSubmittingReview ? "Submitting..." : "Submit Review"}
          </button>
        </form>

        {/* Existing Reviews List */}
        <div className="space-y-3 pt-1">
          {reviews.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 dark:text-slate-200">{rev.userName}</span>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${star <= rev.rating ? "fill-amber-400" : "text-slate-300 dark:text-slate-600"}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-xl text-slate-900 dark:text-white tracking-tight">
                Frequently Bought Together
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Related items in {product.category?.name}</p>
            </div>
            <Link
              href={`/products?category=${product.category?.slug}`}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
            >
              View More ➔
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 📱 Mobile-Only Sticky Bottom Buy Bar (Like native Amazon / Blinkit app) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800 p-3 pb-safe shadow-2xl transition-colors">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">Total Price</p>
            <p className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {formatCurrency(product.price * quantity)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isOutOfStock && (
              <button
                onClick={handleAddToCart}
                className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs active:scale-90 transition-all flex items-center gap-1"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add</span>
              </button>
            )}

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold px-5 py-2.5 rounded-xl text-xs active:scale-90 transition-all shadow-md shadow-emerald-600/30"
            >
              {isOutOfStock ? "Out of Stock" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
