"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Store, Phone, MessageCircle, Mail, MapPin, Truck, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/context/ToastContext";

import { subscribeToStoreSettings, updateStoreSettings } from "@/lib/firestore-service";

export default function AdminSettingsPage() {
  const { success, error } = useToast();

  const [shopName, setShopName] = useState("चैतन्य श्री (Chaitanya Shree) - Wedding & Festive Collection");
  const [phone, setPhone] = useState("+91 73804 92118");
  const [whatsapp, setWhatsapp] = useState("+917380492118");
  const [email, setEmail] = useState("info@chaitanyashree.in");
  const [address, setAddress] = useState("Shop #14, Royal Heritage Wedding Complex, Main Bazaar");
  const [currency, setCurrency] = useState("₹");
  const [freeDeliveryMin, setFreeDeliveryMin] = useState("999");
  const [deliveryFee, setDeliveryFee] = useState("50");
  const [announcement, setAnnouncement] = useState("✨ चैतन्य श्री वेडिंग स्पेशल: सभी शादी कलेक्शन्स पर 20% तक छूट! Use code SHUBHVIVAH");
  const [openHours, setOpenHours] = useState("Mon - Sun: 9:00 AM - 10:00 PM");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToStoreSettings((s) => {
      if (s) {
        setShopName(s.shopName || "");
        setPhone(s.phone || "");
        setWhatsapp(s.whatsapp || "");
        setEmail(s.email || "");
        setAddress(s.address || "");
        setCurrency(s.currency || "₹");
        setFreeDeliveryMin((s.freeDeliveryMin ?? 499).toString());
        setDeliveryFee((s.deliveryFee ?? 40).toString());
        setAnnouncement(s.announcement || "");
        setOpenHours(s.openHours || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateStoreSettings({
        shopName,
        phone,
        whatsapp,
        email,
        address,
        currency,
        freeDeliveryMin: Number(freeDeliveryMin) || 0,
        deliveryFee: Number(deliveryFee) || 0,
        announcement,
        openHours,
      });

      success("Store configurations updated successfully!");
    } catch (err: any) {
      error(err.message || "Failed to update store settings");
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
