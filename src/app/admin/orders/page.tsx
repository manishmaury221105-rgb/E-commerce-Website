"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, Search, Filter, Printer, ExternalLink, CheckCircle2, Clock, Trash2, AlertTriangle, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { useToast } from "@/context/ToastContext";
import { Order, OrderStatus } from "@/types";
import { subscribeToOrders } from "@/lib/firestore-service";

export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToOrders((liveOrders) => {
      setAllOrders(liveOrders);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const orders = allOrders.filter((o) => {
    if (statusFilter !== "ALL" && o.orderStatus !== statusFilter) return false;
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: newStatus,
          note: `Status updated to ${newStatus} by store admin.`,
        }),
      });

      if (res.ok) {
        success(`Order status updated to ${newStatus}`);
        setAllOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
      }
    } catch (err) {
      error("Failed to update status");
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        success(`Order ${orderToDelete.orderNumber} deleted permanently`);
        setAllOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
        setOrderToDelete(null);
      } else {
        const data = await res.json().catch(() => ({}));
        error(data.error || "Failed to delete order");
      }
    } catch (err) {
      error("Network error while deleting order");
    } finally {
      setDeleting(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-white tracking-tight">
            Customer Orders & Fulfillment
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Accept orders, assign delivery, update live tracking status, and manage or delete orders
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "ALL", label: "All Orders" },
            { id: "PENDING", label: "Pending" },
            { id: "CONFIRMED", label: "Confirmed" },
            { id: "PACKED", label: "Packed" },
            { id: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
            { id: "DELIVERED", label: "Delivered" },
            { id: "CANCELLED", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, customer, phone..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading customer orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-400 text-sm font-semibold">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[10px] font-bold">
                <tr>
                  <th className="p-4">Order ID & Date</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Items / Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Live Status Stepper</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_LABELS[order.orderStatus] || {
                    label: order.orderStatus,
                    color: "bg-slate-800 text-slate-300",
                  };
                  const paymentInfo = PAYMENT_STATUS_LABELS[order.paymentStatus] || {
                    label: order.paymentStatus,
                    color: "bg-slate-800 text-slate-300",
                  };

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Order ID & Date */}
                      <td className="p-4">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-white hover:text-emerald-400 transition-colors"
                        >
                          {order.orderNumber}
                        </Link>
                        <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(order.createdAt)}</p>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <p className="font-bold text-slate-200">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400">📞 {order.customerPhone}</p>
                      </td>

                      {/* Items & Total */}
                      <td className="p-4">
                        <div className="font-extrabold text-slate-200">
                          {formatCurrency(order.total)}
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {order.items.length} unique items
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase block text-slate-300">
                          {order.paymentMethod}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${paymentInfo.color}`}>
                          {paymentInfo.label}
                        </span>
                      </td>

                      {/* Status Selector */}
                      <td className="p-4">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="bg-slate-800 border border-slate-700 text-white font-bold text-xs px-2.5 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="PENDING">🕒 PENDING (Order Placed)</option>
                          <option value="CONFIRMED">✅ CONFIRMED</option>
                          <option value="PACKED">📦 PACKED & READY</option>
                          <option value="OUT_FOR_DELIVERY">🚚 OUT FOR DELIVERY</option>
                          <option value="DELIVERED">🎉 DELIVERED</option>
                          <option value="CANCELLED">❌ CANCELLED</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-xl transition-colors text-xs"
                          >
                            Details & Slip
                          </Link>
                          <button
                            onClick={() => setOrderToDelete(order)}
                            title="Delete Order"
                            className="bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white p-1.5 rounded-xl transition-all border border-rose-500/20 active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-rose-500">
                <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-white">Delete Order?</h3>
              </div>
              <button
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-2">
              <p>
                Are you sure you want to permanently delete order{" "}
                <strong className="text-white font-mono">{orderToDelete.orderNumber}</strong>?
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1 text-slate-400 text-[11px]">
                <p>👤 Customer: <strong className="text-slate-200">{orderToDelete.customerName}</strong></p>
                <p>💰 Amount: <strong className="text-slate-200">{formatCurrency(orderToDelete.total)}</strong></p>
                <p>📦 Items: <strong className="text-slate-200">{orderToDelete.items.length} items</strong></p>
              </div>
              <p className="text-rose-400 font-semibold text-[11px]">
                ⚠️ This action cannot be undone and will remove the order completely from database.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                disabled={deleting}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-4 py-2 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={deleting}
                className="bg-rose-600 hover:bg-rose-500 active:scale-95 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-rose-600/20"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{deleting ? "Deleting..." : "Delete Order"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
