"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { CartItem, Coupon, Product } from "@/types";
import { useToast } from "./ToastContext";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountUntilFreeDelivery: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  total: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "freshmart_cart_items_v1";
const COUPON_STORAGE_KEY = "freshmart_applied_coupon_v1";
const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_FEE = 40;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { success, error, info } = useToast();

  // Load from local storage
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (savedItems) setItems(JSON.parse(savedItems));

      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error("Failed reading cart from localStorage", e);
    }
    setIsMounted(true);
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error("Failed saving cart to localStorage", e);
    }
  }, [items, isMounted]);

  useEffect(() => {
    if (!isMounted) return;
    try {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed saving coupon to localStorage", e);
    }
  }, [appliedCoupon, isMounted]);

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        const imagesList = Array.isArray(product.images)
          ? product.images
          : typeof product.images === "string"
          ? JSON.parse(product.images || "[]")
          : [];
        const mainImage = imagesList[0] || "https://placehold.co/400x400?text=Product";

        if (existing) {
          const newQty = Math.min(existing.quantity + quantity, product.stock || 99);
          success(`Updated ${product.name} quantity to ${newQty}`);
          return prev.map((item) =>
            item.productId === product.id ? { ...item, quantity: newQty } : item
          );
        } else {
          success(`Added ${product.name} to cart!`);
          return [
            ...prev,
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              image: mainImage,
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              unit: product.unit,
              quantity: Math.min(quantity, product.stock || 99),
              stock: product.stock,
            },
          ];
        }
      });
      setIsCartOpen(true);
    },
    [success]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => {
        const itemToRemove = prev.find((i) => i.productId === productId);
        if (itemToRemove) {
          info(`Removed ${itemToRemove.name} from cart`);
        }
        return prev.filter((item) => item.productId !== productId);
      });
    },
    [info]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(productId);
        return;
      }
      setItems((prev) =>
        prev.map((item) => {
          if (item.productId === productId) {
            const safeQty = Math.min(quantity, item.stock || 99);
            return { ...item, quantity: safeQty };
          }
          return item;
        })
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const itemCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
  }, [subtotal]);

  const amountUntilFreeDelivery = useMemo(() => {
    return Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);
  }, [subtotal]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon || subtotal === 0) return 0;
    if (subtotal < appliedCoupon.minOrderAmount) return 0;

    let discount = 0;
    if (appliedCoupon.discountType === "PERCENTAGE") {
      discount = (subtotal * appliedCoupon.discountValue) / 100;
      if (appliedCoupon.maxDiscountAmount && discount > appliedCoupon.maxDiscountAmount) {
        discount = appliedCoupon.maxDiscountAmount;
      }
    } else {
      discount = appliedCoupon.discountValue;
    }

    return Math.min(discount, subtotal);
  }, [appliedCoupon, subtotal]);

  const total = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + deliveryFee);
  }, [subtotal, discountAmount, deliveryFee]);

  const applyCoupon = async (code: string) => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), subtotal }),
      });
      const data = await res.json();

      if (!res.ok) {
        error(data.error || "Invalid coupon code");
        return { success: false, message: data.error || "Invalid coupon code" };
      }

      setAppliedCoupon(data.coupon);
      success(`Promo code ${data.coupon.code} applied successfully!`);
      return { success: true, message: "Coupon applied!" };
    } catch (err: any) {
      error("Failed to apply coupon");
      return { success: false, message: err.message || "Failed to apply coupon" };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info("Coupon removed");
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD,
        amountUntilFreeDelivery,
        appliedCoupon,
        discountAmount,
        total,
        applyCoupon,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
