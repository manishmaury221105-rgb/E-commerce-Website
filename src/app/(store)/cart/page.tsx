"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Tag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Truck,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, generateWhatsAppSupportLink } from "@/lib/utils";

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    amountUntilFreeDelivery,
    appliedCoupon,
    discountAmount,
    total,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const deliveryProgressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    await applyCoupon(couponCode);
    setIsApplying(false);
    setCouponCode("");
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto space-y-5 bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs my-8 transition-colors">
        <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white">Your Cart is Empty</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Looks like you haven't added anything to your cart yet. Explore our fresh organic fruits, staples, snacks & bakery!
          </p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-full shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <span>Explore Fresh Products</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            You have <strong className="text-slate-800 dark:text-slate-200">{items.length}</strong> items in your cart
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearCart}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-bold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
          <Link
            href="/products"
            className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>

      {/* Free Shipping Meter */}
      <div className="bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 rounded-2xl sm:rounded-3xl transition-colors">
        {amountUntilFreeDelivery > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Add {formatCurrency(amountUntilFreeDelivery)} more to get <strong>FREE Local Delivery</strong>!
              </span>
              <span>{deliveryProgressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${deliveryProgressPercent}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span>🎉 Congratulations! You have unlocked FREE 45-min doorstep delivery.</span>
          </div>
        )}
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cart Items Table/Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white dark:bg-slate-900 p-3.5 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-colors"
            >
              {/* Image & Title */}
              <div className="flex items-center gap-3 sm:gap-3.5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.unit}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(item.price)}
                    </span>
                    {item.compareAtPrice && item.compareAtPrice > item.price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatCurrency(item.compareAtPrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stepper and Item Total */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 border-t border-slate-100 dark:border-slate-800 sm:border-t-0 pt-2.5 sm:pt-0">
                {/* Stepper */}
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs active:scale-95"
                    aria-label="Decrease"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors shadow-xs active:scale-95"
                    aria-label="Increase"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right min-w-[70px]">
                  <span className="text-[10px] text-slate-400 block sm:hidden">Total</span>
                  <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>

                {/* Trash */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Coupon Box */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="font-heading font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Promo Code / Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl text-xs">
                <div>
                  <p className="font-bold text-emerald-900 dark:text-emerald-300">Coupon applied: {appliedCoupon.code}</p>
                  <p className="text-emerald-700 dark:text-emerald-400 text-[11px]">
                    You saved {formatCurrency(discountAmount)} on this order!
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplying || !couponCode.trim()}
                  className="bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors"
                >
                  Apply
                </button>
              </form>
            )}

            {/* Hint coupons */}
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Available Promo Codes:</p>
              <div className="flex flex-wrap gap-1.5">
                <span
                  onClick={() => setCouponCode("WELCOME10")}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md cursor-pointer font-mono font-bold"
                >
                  WELCOME10 (10% OFF)
                </span>
                <span
                  onClick={() => setCouponCode("SAVE100")}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md cursor-pointer font-mono font-bold"
                >
                  SAVE100 (₹100 OFF)
                </span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Delivery Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                <span>Grand Total</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/20 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={generateWhatsAppSupportLink(
                  "+917380492118",
                  `Hi FreshMart, here is my cart order:\n${items
                    .map((i) => `• ${i.name} (${i.unit}) x ${i.quantity} = ₹${i.price * i.quantity}`)
                    .join("\n")}\n\n*Total:* ₹${total}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 text-xs border border-[#25D366]/30 transition-colors active:scale-95"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Order via WhatsApp</span>
              </a>
            </div>

            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Secure Checkout
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> 45-Min Express
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
