"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Store, Phone, MessageCircle, Mail, MapPin, Truck, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminSettingsPage() {
  const { success, error } = useToast();

  const [shopName, setShopName] = useState("FreshMart Local Supermarket");
  const [phone, setPhone] = useState("+91 73804 92118");
  const [whatsapp, setWhatsapp] = useState("+917380492118");
  const [email, setEmail] = useState("help@freshmart.local");
  const [address, setAddress] = useState("Shop #14, Main Market Square, Near Central Clock Tower");
  const [currency, setCurrency] = useState("₹");
  const [freeDeliveryMin, setFreeDeliveryMin] = useState("499");
  const [deliveryFee, setDeliveryFee] = useState("40");
  const [announcement, setAnnouncement] = useState("⚡ Super Fast Local Delivery in under 45 mins! Use code WELCOME10 for 10% OFF");
  const [openHours, setOpenHours] = useState("Mon - Sun: 7:00 AM - 10:30 PM");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          setShopName(s.shopName);
          setPhone(s.phone);
          setWhatsapp(s.whatsapp);
          setEmail(s.email);
          setAddress(s.address);
          setCurrency(s.currency);
          setFreeDeliveryMin(s.freeDeliveryMin.toString());
          setDeliveryFee(s.deliveryFee.toString());
          setAnnouncement(s.announcement || "");
          setOpenHours(s.openHours || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopName,
          phone,
          whatsapp,
          email,
          address,
          currency,
          freeDeliveryMin,
          deliveryFee,
          announcement,
          openHours,
        }),
      });

      if (res.ok) {
        success("Store configurations updated successfully!");
      } else {
        error("Failed to update store settings");
      }
    } catch (err) {
      error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading settings...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
          Store Configuration & Settings
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure shop name, WhatsApp order number, delivery thresholds, and hours
        </p>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Store Profile */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Store Profile & Contacts</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Store / Business Name *</label>
            <input
              type="text"
              required
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Orders Number *</label>
              <input
                type="text"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+919876543210 (without spaces)"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Store Operating Hours</label>
              <input
                type="text"
                value={openHours}
                onChange={(e) => setOpenHours(e.target.value)}
                placeholder="Mon - Sun: 7:00 AM - 10:30 PM"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Store Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Delivery & Pricing Settings */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Delivery & Currency Settings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Free Delivery Min. Spend (₹)</label>
              <input
                type="number"
                value={freeDeliveryMin}
                onChange={(e) => setFreeDeliveryMin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Standard Delivery Fee (₹)</label>
              <input
                type="number"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Top Announcement Ribbon Ticker</label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-8 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Store Configuration"}</span>
        </button>
      </form>
    </div>
  );
}
