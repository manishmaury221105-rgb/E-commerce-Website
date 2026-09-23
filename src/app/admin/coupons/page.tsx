"use client";

import React, { useState, useEffect } from "react";
import { Tag, Plus, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";
import { Coupon } from "@/types";

export default function AdminCouponsPage() {
  const { success, error } = useToast();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form Fields
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderAmount, setMinOrderAmount] = useState("299");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("500");

  const fetchCoupons = () => {
    fetch("/api/coupons")
      .then((res) => res.json())
      .then((data) => {
        if (data.coupons) setCoupons(data.coupons);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) {
      error("Coupon code and discount value are required");
      return;
    }

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: parseFloat(discountValue),
          minOrderAmount: parseFloat(minOrderAmount) || 0,
          maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
          usageLimit: usageLimit ? parseInt(usageLimit) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to create coupon");
        return;
      }

      success(`Coupon ${code} created successfully!`);
      setCode("");
      setDiscountValue("");
      setIsAdding(false);
      fetchCoupons();
    } catch (err) {
      error("Error creating coupon");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Coupons & Promo Codes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create percentage and flat discounts to boost customer sales and retention
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? "Cancel" : "Create Promo Code"}</span>
        </button>
      </div>

      {/* Add Coupon Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateCoupon}
          className="bg-slate-900 border-2 border-emerald-500 p-6 rounded-3xl space-y-4 shadow-xl animate-in fade-in duration-200"
        >
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
            Create Discount Promo Code
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE25"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PERCENTAGE">% Percentage Discount</option>
                <option value="FIXED">₹ Flat Amount Off</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {discountType === "PERCENTAGE" ? "Discount Percentage (%) *" : "Flat Discount (₹) *"}
              </label>
              <input
                type="number"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === "PERCENTAGE" ? "15" : "100"}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Minimum Order Value (₹)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                placeholder="299"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Max Cap Discount (₹)</label>
              <input
                type="number"
                value={maxDiscountAmount}
                onChange={(e) => setMaxDiscountAmount(e.target.value)}
                placeholder="Optional e.g. 150"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Usage Limit (Orders)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="500"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md"
            >
              Save & Activate Coupon
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-slate-800 text-slate-400 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Tag className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-semibold">No coupons configured</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4">Promo Code</th>
                  <th className="p-4">Discount</th>
                  <th className="p-4">Min Order</th>
                  <th className="p-4">Max Cap</th>
                  <th className="p-4">Used / Limit</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-extrabold text-white text-sm">
                      <span className="bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      {c.discountType === "PERCENTAGE" ? `${c.discountValue}% OFF` : `₹${c.discountValue} Flat OFF`}
                    </td>
                    <td className="p-4 text-slate-300">₹{c.minOrderAmount}</td>
                    <td className="p-4 text-slate-400">
                      {c.maxDiscountAmount ? `₹${c.maxDiscountAmount}` : "No Cap"}
                    </td>
                    <td className="p-4 text-slate-300 font-semibold">
                      {c.usageCount} / {c.usageLimit || "∞"} uses
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          c.isActive
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                            : "bg-slate-800 text-slate-500"
                        }`}
                      >
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
