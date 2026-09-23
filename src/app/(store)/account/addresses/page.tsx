"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Address } from "@/types";

export default function AddressesPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [apartment, setApartment] = useState("");
  const [city, setCity] = useState("Metropolis");
  const [state, setState] = useState("State");
  const [postalCode, setPostalCode] = useState("110001");
  const [label, setLabel] = useState<"HOME" | "WORK" | "OTHER">("HOME");
  const [isDefault, setIsDefault] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAddresses = () => {
    fetch("/api/addresses")
      .then((res) => res.json())
      .then((data) => {
        if (data.addresses) setAddresses(data.addresses);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchAddresses();
    else setLoading(false);
  }, [user]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street || !city || !postalCode) {
      error("Please fill in all required address fields");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          street,
          apartment,
          city,
          state,
          postalCode,
          country: "India",
          label,
          isDefault,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        error(data.error || "Failed to add address");
        return;
      }

      success("Address added successfully!");
      setIsAdding(false);
      setName("");
      setPhone("");
      setStreet("");
      setApartment("");
      fetchAddresses();
    } catch (err) {
      error("Error saving address");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      if (res.ok) {
        success("Address removed");
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        success("Default address updated");
        fetchAddresses();
      }
    } catch (err) {
      error("Failed to update default address");
    }
  };

  if (!user) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
        <MapPin className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">Sign in to manage your saved delivery addresses.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-emerald-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/account/profile" className="text-slate-400 hover:text-slate-700 sm:hidden">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Saved Addresses
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage your delivery locations for fast 1-click checkout</p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{isAdding ? "Cancel" : "Add Address"}</span>
        </button>
      </div>

      {/* Add Address Form Modal / Inline Box */}
      {isAdding && (
        <form
          onSubmit={handleAddAddress}
          className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-emerald-500 shadow-xl space-y-4 animate-in fade-in duration-200"
        >
          <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
            Add New Delivery Location
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Recipient name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="House/Flat No., Building Name, Street"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">Type:</span>
              {(["HOME", "WORK", "OTHER"] as const).map((l) => (
                <button
                  type="button"
                  key={l}
                  onClick={() => setLabel(l)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg border transition-colors ${
                    label === l ? "bg-slate-900 text-white border-slate-900" : "bg-slate-100 text-slate-600 border-slate-200"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="accent-emerald-600"
              />
              <span className="font-semibold text-slate-700">Set as default delivery address</span>
            </label>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-colors shadow-xs"
            >
              {isSaving ? "Saving..." : "Save Address"}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="bg-slate-100 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading addresses...</div>
      ) : addresses.length === 0 && !isAdding ? (
        <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-3">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">No addresses saved yet</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Add your home or office address to make ordering faster and smoother.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-emerald-600 text-white font-bold text-xs px-5 py-2 rounded-xl"
          >
            Add Address Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white p-5 rounded-3xl border-2 transition-all space-y-3 flex flex-col justify-between ${
                addr.isDefault ? "border-emerald-600 shadow-sm bg-emerald-50/20" : "border-slate-200/80 shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    {addr.label === "HOME" && <Home className="w-4 h-4 text-emerald-600" />}
                    {addr.label === "WORK" && <Building className="w-4 h-4 text-emerald-600" />}
                    {addr.label === "OTHER" && <MapPin className="w-4 h-4 text-emerald-600" />}
                    <span className="font-bold text-xs text-slate-900">{addr.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {addr.isDefault && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Default
                      </span>
                    )}
                    <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                      {addr.label}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.street} {addr.apartment ? `, ${addr.apartment}` : ""}, {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p className="text-xs text-slate-500 font-semibold mt-1">📞 {addr.phone}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                {!addr.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="font-bold text-emerald-700 hover:underline"
                  >
                    Set as Default
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Primary Delivery Address</span>
                )}

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  aria-label="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
