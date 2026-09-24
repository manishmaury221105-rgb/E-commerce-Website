"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingBag, Plus, Minus, Trash2, Tag, ArrowRight, CheckCircle2, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCurrency, generateWhatsAppSupportLink } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
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

  const [couponInput, setCouponInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponInput);
    setIsApplyingCoupon(false);
    setCouponInput("");
  };

  const deliveryProgressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-slate-200 dark:border-slate-800">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Your Shopping Cart</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{items.length} unique items</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="px-5 py-3 bg-emerald-50/80 dark:bg-emerald-950/40 border-b border-emerald-100/60 dark:border-emerald-800/40">
            {amountUntilFreeDelivery > 0 ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                  <span>Add {formatCurrency(amountUntilFreeDelivery)} more for FREE Delivery</span>
                  <span>{deliveryProgressPercent}%</span>
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${deliveryProgressPercent}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span>🎉 Awesome! You unlocked FREE 45-min delivery!</span>
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">Your cart is empty</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Explore our fresh fruits, vegetables, bakery, and daily essentials!
                  </p>
                </div>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors"
                >
                  Start Shopping Now
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-750 hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                >
                  {/* Image */}
                  <div className="w-16 h-16 rounded-xl bg-white dark:bg-slate-900 relative overflow-hidden border border-slate-200/60 dark:border-slate-700 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-slate-900 dark:text-white truncate leading-tight">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.unit}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-bold text-xs text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(item.price)}
                      </span>
                      {item.compareAtPrice && item.compareAtPrice > item.price && (
                        <span className="text-[10px] text-slate-400 line-through">
                          {formatCurrency(item.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer with summary and checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850 space-y-3">
              {/* Coupon input */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300/80 dark:border-emerald-800 px-3 py-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold">
                    <Tag className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                    <span>Coupon: {appliedCoupon.code}</span>
                    <span className="text-emerald-700 dark:text-emerald-400">(-{formatCurrency(discountAmount)})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter promo code (e.g. WELCOME10)"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !couponInput.trim()}
                    className="bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                    <span>Discount</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(deliveryFee)}
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                  <span>Total Amount</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold text-base">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-orange-600/20 active:scale-98 transition-all"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={generateWhatsAppSupportLink(
                    "+917380492118",
                    `नमस्ते चैतन्य श्री, I would like to place an order for my cart:\n${items
                      .map((i) => `• ${i.name} (${i.unit}) x ${i.quantity} = ₹${i.price * i.quantity}`)
                      .join("\n")}\n\n*Total:* ₹${total}\n\nPlease confirm availability. Dhanyawad!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] dark:text-[#25D366] font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs border border-[#25D366]/30 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order Directly on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
