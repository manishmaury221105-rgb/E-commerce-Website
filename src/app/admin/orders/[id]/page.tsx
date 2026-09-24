"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  ShoppingBag,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  FileText,
  Save,
  MessageCircle,
} from "lucide-react";
import { formatCurrency, formatDate, generateWhatsAppOrderSummaryLink } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { useToast } from "@/context/ToastContext";
import { Order, OrderStatus } from "@/types";
import { subscribeToOrder } from "@/lib/firestore-service";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { success, error } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Status and Notes Form
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("PENDING");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("PENDING");
  const [customNote, setCustomNote] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeToOrder(orderId, (liveOrder) => {
      if (liveOrder) {
        setOrder(liveOrder);
        setSelectedStatus(liveOrder.orderStatus);
        setSelectedPaymentStatus(liveOrder.paymentStatus);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [orderId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: selectedStatus,
          paymentStatus: selectedPaymentStatus,
          note: customNote.trim() || `Status updated to ${selectedStatus}`,
        }),
      });

      if (res.ok) {
        success("Order status and tracking history updated!");
        setCustomNote("");
      } else {
        error("Failed to update order");
      }
    } catch (err) {
      error("Error updating order");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-slate-400 text-xs">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center text-slate-400">
        <p>Order not found</p>
        <Link href="/admin/orders" className="text-emerald-400 text-xs underline mt-2 block">
          Return to orders
        </Link>
      </div>
    );
  }

  const address = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress;

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-white">
              Manage Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintSlip}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Packing Slip</span>
          </button>
          <a
            href={generateWhatsAppOrderSummaryLink(
              order.customerPhone || "+917380492118",
              order.orderNumber,
              order.total,
              order.items.length,
              order.customerName
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Customer</span>
          </a>
        </div>
      </div>

      {/* 1. Status Update Control Box */}
      <div className="no-print bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
          Update Fulfillment Status & Dispatch
        </h3>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Order Delivery Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PENDING">🕒 PENDING (Order Placed)</option>
                <option value="CONFIRMED">✅ CONFIRMED (Store verified)</option>
                <option value="PACKED">📦 PACKED & READY</option>
                <option value="OUT_FOR_DELIVERY">🚚 OUT FOR DELIVERY (Rider dispatched)</option>
                <option value="DELIVERED">🎉 DELIVERED (Handed over)</option>
                <option value="CANCELLED">❌ CANCELLED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Payment Status
              </label>
              <select
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="PENDING">⏳ PENDING (Awaiting Cash/Online)</option>
                <option value="PAID">💵 PAID (Received)</option>
                <option value="FAILED">❌ FAILED</option>
                <option value="REFUNDED">🔄 REFUNDED</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Add Note for Customer / Tracking History (Optional)
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="e.g. Rider Ramesh (+91 9988112233) has picked up the bag."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{updating ? "Updating..." : "Save Status & Notify Tracker"}</span>
          </button>
        </form>
      </div>

      {/* 2. Thermal Slip & Invoice Document (Clean Printable Layout) */}
      <div className="bg-white text-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
        {/* Slip Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                FreshMart Local Supermarket
              </h2>
            </div>
            <p className="text-xs text-slate-600 mt-1">Shop #14, Main Market Square • 45-Min Express Delivery</p>
            <p className="text-xs text-slate-500">Phone / WhatsApp: +91 73804 92118</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="font-mono font-extrabold text-base text-slate-900 block">
              {order.orderNumber}
            </span>
            <span className="text-xs font-mono text-slate-500">
              Tax Invoice #{order.invoiceNumber || "INV-2026-0001"}
            </span>
            <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
              Delivery Destination
            </span>
            <p className="font-bold text-slate-900">{order.customerName}</p>
            <p className="text-slate-600">
              {address.street} {address.apartment ? `, ${address.apartment}` : ""}
            </p>
            <p className="text-slate-600">{address.city}, {address.state} - {address.postalCode}</p>
            <p className="font-semibold text-slate-900 mt-1">📞 {order.customerPhone}</p>
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px] mb-1">
              Fulfillment & Payment
            </span>
            <p className="text-slate-700">
              <strong>Slot:</strong> {order.deliverySlot || "⚡ 45-Min Express"}
            </p>
            <p className="text-slate-700">
              <strong>Payment Method:</strong> {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
            </p>
            <p className="text-slate-700">
              <strong>Payment Status:</strong>{" "}
              <span className="font-bold text-emerald-700">{order.paymentStatus}</span>
            </p>
            {order.notes && (
              <p className="text-amber-800 bg-amber-50 p-1.5 rounded mt-1">
                <strong>Notes:</strong> {order.notes}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-bold uppercase tracking-wider text-[10px] text-slate-800">
                <th className="py-2">Item Description</th>
                <th className="py-2 text-center">Unit / Pack</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2.5 font-bold text-slate-900">{item.productName}</td>
                  <td className="py-2.5 text-center text-slate-600">{item.unit || "Piece"}</td>
                  <td className="py-2.5 text-center font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-2.5 text-right text-slate-600">{formatCurrency(item.price)}</td>
                  <td className="py-2.5 text-right font-bold text-slate-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="border-t-2 border-slate-900 pt-3 flex justify-end">
          <div className="w-64 space-y-1.5 text-xs text-slate-700">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <span className="font-bold">{formatCurrency(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon ({order.couponCode}):</span>
                <span>-{formatCurrency(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee:</span>
              <span className="font-bold">
                {order.deliveryFee === 0 ? "FREE" : formatCurrency(order.deliveryFee)}
              </span>
            </div>
            <div className="border-t border-slate-300 pt-1.5 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total Amount:</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-500">
          <p className="font-semibold">Thank you for ordering with FreshMart Local Supermarket!</p>
          <p>For instant support or returns, WhatsApp us anytime at +91 73804 92118.</p>
        </div>
      </div>
    </div>
  );
}
