"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star, Plus, Minus, ShoppingBag, MessageCircle, Zap } from "lucide-react";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { formatCurrency, generateWhatsAppProductOrderLink } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCart();
  const router = useRouter();

  const cartItem = items.find((i) => i.productId === product.id);
  const isInCart = Boolean(cartItem);

  const imagesList = Array.isArray(product.images)
    ? product.images
    : typeof product.images === "string"
    ? JSON.parse(product.images || "[]")
    : [];

  const mainImage = imagesList[0] || "https://placehold.co/400x400?text=Product";

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isInCart) {
      addItem(product, 1);
    }
    router.push("/checkout");
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/10 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Discount Badge */}
      {discountPercent && (
        <div className="absolute top-2.5 left-2.5 z-10 bg-rose-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          {discountPercent}% OFF
        </div>
      )}

      {/* Daily Deal Badge */}
      {product.isDailyDeal && (
        <div className="absolute top-2.5 right-2.5 z-10 bg-amber-400 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
          <Zap className="w-3 h-3 fill-amber-950" />
          <span>DEAL</span>
        </div>
      )}

      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative pt-[85%] overflow-hidden bg-slate-50 dark:bg-slate-800">
        <img
          src={mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unit and Category */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md">
              {product.unit}
            </span>
            {product.category && (
              <span className="truncate text-slate-400 dark:text-slate-500 max-w-[100px]">{product.category.name}</span>
            )}
          </div>

          {/* Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-2 leading-snug transition-colors">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400 text-emerald-600 dark:text-emerald-400" />
              <span>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">({product.numReviews || 12})</span>
          </div>
        </div>

        {/* Pricing & Add to cart button */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs text-slate-400 dark:text-slate-500 line-through">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-1.5">
            {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-2 rounded-xl text-xs cursor-not-allowed"
              >
                Out of Stock
              </button>
            ) : isInCart ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(product.id, cartItem!.quantity - 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors shadow-xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200">{cartItem!.quantity} in Cart</span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem!.quantity + 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors shadow-xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => addItem(product, 1)}
                  className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-white font-bold py-2 rounded-xl text-xs transition-all border border-transparent dark:border-slate-700"
                >
                  Buy Now
                </button>
              </div>
            )}

            {/* Quick WhatsApp Order link */}
            <a
              href={generateWhatsAppProductOrderLink(
                "+917380492118",
                product.name,
                product.price,
                `http://localhost:3000/products/${product.slug}`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 py-1 transition-colors"
            >
              <MessageCircle className="w-3 h-3 text-[#25D366]" />
              <span>Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
