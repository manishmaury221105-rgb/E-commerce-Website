"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  MapPin,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  ShoppingBag,
  Building,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatCurrency } from "@/lib/utils";
import { Address, PaymentMethod } from "@/types";
import { DELIVERY_SLOTS } from "@/lib/constants";

export default function CheckoutPage() {
  const { items, subtotal, deliveryFee, discountAmount, total, appliedCoupon, clearCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const router = useRouter();

  // Address selection & form state
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Form Fields
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Metropolis");
  const [state, setState] = useState("State");
  const [postalCode, setPostalCode] = useState("110001");
  const [addressLabel, setAddressLabel] = useState<"HOME" | "WORK" | "OTHER">("HOME");

  // Delivery slot & Payment Method
  const [selectedSlot, setSelectedSlot] = useState(DELIVERY_SLOTS[0].label);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ONLINE_UPI");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UPI Simulation state
  const [upiId, setUpiId] = useState("user@okaxis");

  // Load user data and saved addresses
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || "");
      setCustomerEmail(user.email || "");
      setCustomerPhone(user.phone || "");

      fetch("/api/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: Address) => a.isDefault) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setStreet(defaultAddr.street);
            setApartment(defaultAddr.apartment || "");
            setCity(defaultAddr.city);
            setState(defaultAddr.state);
            setPostalCode(defaultAddr.postalCode);
            setAddressLabel(defaultAddr.label);
          } else {
            setIsAddingNewAddress(true);
          }
        })
        .catch((err) => console.error(err));
    } else {
      setIsAddingNewAddress(true);
    }
  }, [user]);

  // Handle saved address selection
  const handleSelectAddress = (addr: Address) => {
    setSelectedAddressId(addr.id);
    setIsAddingNewAddress(false);
    setStreet(addr.street);
    setApartment(addr.apartment || "");
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCustomerPhone(addr.phone);
    setCustomerName(addr.name);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!items.length) {
      error("Your cart is empty");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !street.trim() || !city.trim() || !postalCode.trim()) {
      error("Please provide all required customer and delivery address fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const shippingAddressObj = {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        street: street.trim(),
        apartment: apartment.trim() || null,
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country: "India",
        label: addressLabel,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || "guest@localshop.com",
          customerPhone: customerPhone.trim(),
          shippingAddress: shippingAddressObj,
          deliverySlot: selectedSlot,
          notes: orderNotes.trim() || null,
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            quantity: i.quantity,
          })),
          paymentMethod,
          couponCode: appliedCoupon ? appliedCoupon.code : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        error(data.error || "Failed to place order");
        setIsSubmitting(false);
        return;
      }

      // Success animation
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      success("🎉 Order placed successfully!");
      clearCart();
      router.push(`/orders/${data.order.id}`);
    } catch (err: any) {
      error("Network error while placing order");
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Please add items to your cart before proceeding to checkout.</p>
        <Link
          href="/products"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-5 py-2.5 rounded-full hover:bg-emerald-700"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Fast 45-minute local delivery • Cash on Delivery & Instant Online Payments
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Details (8 cols) */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* 1. Delivery Address Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                  1
                </div>
                <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Delivery Address</h3>
              </div>

              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAddingNewAddress(!isAddingNewAddress)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAddingNewAddress ? "Use Saved" : "New Address"}</span>
                </button>
              )}
            </div>

            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && !isAddingNewAddress && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectAddress(addr)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{addr.name}</span>
                      <span className="text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2 py-0.5 rounded-md">
                        {addr.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                      {addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {addr.city}, {addr.postalCode} • {addr.phone}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Address Form Inputs */}
            {(isAddingNewAddress || savedAddresses.length === 0) && (
              <div className="space-y-3.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number (For Delivery Call) *
                    </label>
                    <input
                      type="tel"
                      inputMode="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (For Invoice)
                    </label>
                    <input
                      type="email"
                      inputMode="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="customer@email.com"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Address Label
                    </label>
                    <select
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="HOME">🏠 Home</option>
                      <option value="WORK">🏢 Work / Office</option>
                      <option value="OTHER">📍 Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Street Address & Flat / House No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Flat 402, Sunshine Heights, 5th Main Road"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2.5 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pincode *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Delivery Time Slot */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Choose Delivery Slot</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DELIVERY_SLOTS.map((slot) => (
                <label
                  key={slot.id}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 ${
                    selectedSlot === slot.label
                      ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="delivery_slot"
                    checked={selectedSlot === slot.label}
                    onChange={() => setSelectedSlot(slot.label)}
                    className="accent-emerald-600 w-4 h-4"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">{slot.label}</span>
                    <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">Ready for dispatch</span>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Order Notes / Delivery Instructions (Optional)
              </label>
              <input
                type="text"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="e.g. Ring doorbell twice, leave with security guard..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs focus:bg-white dark:focus:bg-slate-750 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">Payment Option</h3>
            </div>

            <div className="space-y-3">
              {/* Instant UPI */}
              <label
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 ${
                  paymentMethod === "ONLINE_UPI"
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "ONLINE_UPI"}
                  onChange={() => setPaymentMethod("ONLINE_UPI")}
                  className="accent-emerald-600 w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      ⚡ Instant UPI (GPay / PhonePe / Paytm)
                    </span>
                    <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Fastest
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pay securely with any UPI app on delivery or online instantly.
                  </p>

                  {paymentMethod === "ONLINE_UPI" && (
                    <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">Simulated UPI Gateway Active</span>
                      </div>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="Enter your UPI ID (e.g. mobile@upi)"
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <p className="text-[11px] text-slate-400">
                        Payment will be automatically verified on submission.
                      </p>
                    </div>
                  )}
                </div>
              </label>

              {/* Cash on Delivery */}
              <label
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 ${
                  paymentMethod === "COD"
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-emerald-600 w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      💵 Cash on Delivery (COD)
                    </span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Zero Advance
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pay with Cash or UPI to rider upon arrival.
                  </p>
                </div>
              </label>

              {/* Cards / Netbanking */}
              <label
                className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all active:scale-98 ${
                  paymentMethod === "ONLINE_CARD"
                    ? "border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-xs"
                    : "border-slate-200 dark:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  checked={paymentMethod === "ONLINE_CARD"}
                  onChange={() => setPaymentMethod("ONLINE_CARD")}
                  className="accent-emerald-600 w-4 h-4 mt-0.5"
                />
                <div className="flex-1">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    💳 Credit / Debit Card / Net Banking
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Support for Visa, MasterCard, RuPay, and NetBanking.
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 sticky top-24 transition-colors">
            <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
              Order Items ({items.length})
            </h3>

            {/* Items mini list */}
            <div className="max-h-48 overflow-y-auto space-y-2.5 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[11px]">
                      {item.quantity}x
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white flex-shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(deliveryFee)}
                </span>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
                <span>Total Amount to Pay</span>
                <span className="text-emerald-700 dark:text-emerald-400 text-lg">{formatCurrency(total)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold py-3.5 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/30 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <span>Processing Order...</span>
              ) : (
                <>
                  <span>Place Order • {formatCurrency(total)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-1 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>100% Guaranteed Safe & Secure Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
