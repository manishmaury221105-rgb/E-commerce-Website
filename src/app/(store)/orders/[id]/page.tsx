"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Printer,
  MessageCircle,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { formatCurrency, formatDate, generateWhatsAppOrderSummaryLink } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { Order, OrderStatus } from "@/types";

const TRACKING_STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: "PENDING", label: "Order Placed", description: "Received & queued at local store" },
  { status: "CONFIRMED", label: "Store Confirmed", description: "Inventory verified by shop manager" },
  { status: "PACKED", label: "Packed & Ready", description: "Cleaned, sanitized and bagged" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", description: "Rider is heading to your doorstep" },
  { status: "DELIVERED", label: "Delivered", description: "Successfully handed over to customer" },
];

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading order tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 transition-colors">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-slate-900 dark:text-white">Order Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          We couldn't find an order matching #{orderId}.
        </p>
        <Link
          href="/orders"
          className="inline-block bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-full"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  // Calculate current step index
  const statusOrder: OrderStatus[] = ["PENDING", "CONFIRMED", "PACKED", "OUT_FOR_DELIVERY", "DELIVERED"];
  const currentStepIndex = order.orderStatus === "CANCELLED" ? -1 : statusOrder.indexOf(order.orderStatus);

  const statusConfig = ORDER_STATUS_LABELS[order.orderStatus] || {
    label: order.orderStatus,
    color: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
    description: "",
  };

  const address = typeof order.shippingAddress === "string" ? JSON.parse(order.shippingAddress) : order.shippingAddress;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* Top Bar with Navigation & Actions */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <Link
          href="/orders"
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Orders</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>Print Invoice</span>
          </button>

          <a
            href={generateWhatsAppOrderSummaryLink(
              "+917380492118",
              order.orderNumber,
              order.total,
              order.items.length,
              order.customerName
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Support on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 1. Live Interactive Tracking Stepper */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-extrabold text-base sm:text-xl text-slate-900 dark:text-white">
                Order #{order.orderNumber}
              </span>
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Total Amount</span>
            <span className="font-extrabold text-xl text-emerald-700 dark:text-emerald-400">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {order.orderStatus === "CANCELLED" ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-medium">
            This order was cancelled. If you made an online payment, your refund will be processed within 2-3 business days.
          </div>
        ) : (
          <div className="space-y-6">
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">
              Live Delivery Status
            </h3>

            {/* Visual Stepper */}
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-1/2 left-6 right-6 -translate-y-1/2 h-1 bg-slate-100 dark:bg-slate-800 -z-0">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Math.max(0, (currentStepIndex / (TRACKING_STEPS.length - 1)) * 100))}%`,
                  }}
                />
              </div>

              {/* Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4 relative z-10">
                {TRACKING_STEPS.map((step, idx) => {
                  const isCompleted = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;

                  return (
                    <div
                      key={step.status}
                      className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2.5 rounded-2xl transition-all ${
                        isCurrent ? "bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 shadow-xs" : ""
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all flex-shrink-0 ${
                          isCompleted
                            ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-600/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                      </div>
                      <div>
                        <h4
                          className={`text-xs font-bold ${
                            isCompleted ? "text-slate-900 dark:text-white" : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight hidden sm:block mt-0.5">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status updates log */}
            {order.trackingHistory && order.trackingHistory.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Status Log & Updates
                </h4>
                <div className="space-y-2 text-xs">
                  {order.trackingHistory.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.note}</span>
                        <span className="text-[10px] text-slate-400 block">{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Order Information Breakdown (Address, Delivery Slot, Payment) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Shipping Address */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Delivery Address</span>
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white">{address.name || order.customerName}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {address.street} {address.apartment ? `, ${address.apartment}` : ""}, {address.city}, {address.state} - {address.postalCode}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">📞 {address.phone || order.customerPhone}</p>
        </div>

        {/* Delivery Slot */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Delivery Time Slot</span>
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white">{order.deliverySlot || "⚡ 45-Min Express"}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dispatch direct from FreshMart Local Shop #14
          </p>
          {order.notes && (
            <p className="text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl mt-2 border border-amber-200 dark:border-amber-800/60">
              <strong>Note:</strong> {order.notes}
            </p>
          )}
        </div>

        {/* Payment Details */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Payment Summary</span>
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white">
            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                PAYMENT_STATUS_LABELS[order.paymentStatus]?.color || "bg-slate-100 dark:bg-slate-800"
              }`}
            >
              {PAYMENT_STATUS_LABELS[order.paymentStatus]?.label || order.paymentStatus}
            </span>
            {order.invoiceNumber && (
              <span className="text-[10px] font-mono text-slate-400">
                {order.invoiceNumber}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. Items & Tax Invoice Receipt Table */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-heading font-extrabold text-base text-slate-900 dark:text-white">
            Purchased Items ({order.items.length})
          </h3>
          <span className="text-xs text-slate-400">All prices inclusive of local GST</span>
        </div>

        {/* Items Table */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {order.items.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {item.productImage && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{item.productName}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {item.unit} • {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-semibold text-slate-500 dark:text-slate-400 block text-[11px]">
                  Qty: {item.quantity}
                </span>
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {formatCurrency(item.total)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400 max-w-xs ml-auto">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-slate-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
              <span>Coupon Discount ({order.couponCode})</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Local Delivery Fee</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {order.deliveryFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span> : formatCurrency(order.deliveryFee)}
            </span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-base font-extrabold text-slate-900 dark:text-white">
            <span>Grand Total</span>
            <span className="text-emerald-700 dark:text-emerald-400 text-lg">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
