"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, ShoppingBag, Phone, Mail, MapPin } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  totalOrders: number;
  totalSpend: number;
  defaultAddress?: any;
  joinedDate: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.customers) setCustomers(data.customers);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
          Customer Accounts & Directory
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          View registered shoppers, total lifetime value, order counts, and address profiles
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name, email, phone..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading customer directory...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-semibold">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4">Customer Profile</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Total Orders</th>
                  <th className="p-4">Lifetime Spend</th>
                  <th className="p-4">Primary Address</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{c.name}</p>
                          <p className="text-[10px] text-slate-400">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{c.phone || "N/A"}</td>
                    <td className="p-4 font-bold text-slate-200">
                      <span className="bg-slate-800 px-2 py-0.5 rounded-md">{c.totalOrders} orders</span>
                    </td>
                    <td className="p-4 font-extrabold text-emerald-400">
                      {formatCurrency(c.totalSpend)}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate">
                      {c.defaultAddress
                        ? `${c.defaultAddress.street}, ${c.defaultAddress.city}`
                        : "No saved address"}
                    </td>
                    <td className="p-4 text-slate-500">{formatDate(c.joinedDate)}</td>
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
