"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Clock, CheckCircle2, ChevronRight, ShoppingBag, ArrowRight, Truck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { Order } from "@/types";
import { subscribeToOrders } from "@/lib/firestore-service";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToOrders((liveOrders) => {
      setOrders(liveOrders);
      setLoading(false);
    }, user.id);

    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between transition-colors">
        <div>
          <h1 className="font-heading font-extrabold text-lg sm:text-2xl text-slate-900 dark:text-white tracking-tight">
            Order History & Tracking
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View live status, rider location, and download tax invoices for your past orders
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors"
        >
          <span>Shop More</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-10 sm:p-12 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs text-center space-y-4 transition-colors">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg">No orders placed yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Your previous orders and real-time tracking will show up here.
            </p>
          </div>
          <Link
            href="/products"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-3 rounded-full transition-colors shadow-md shadow-emerald-600/20 active:scale-95"
          >
            Start Shopping Now
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {orders.map((order) => {
            const statusConfig = ORDER_STATUS_LABELS[order.orderStatus] || {
              label: order.orderStatus,
              color: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
            };
            const paymentConfig = PAYMENT_STATUS_LABELS[order.paymentStatus] || {
              label: order.paymentStatus,
              color: "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200",
            };

            return (
              <div
                key={order.id}
                className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500 hover:shadow-lg transition-all space-y-3 sm:space-y-4"
              >
                {/* Top Row: Order ID, Date & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${statusConfig.color}`}
                      >
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">Placed on {formatDate(order.createdAt)}</p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${paymentConfig.color}`}>
                      {paymentConfig.label}
                    </span>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>

                {/* Middle Row: Items preview */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 text-xs text-slate-600 dark:text-slate-300">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2.5 py-1 rounded-xl">
                      {item.productName} <strong>({item.quantity}x)</strong>
                    </span>
                  ))}
                </div>

                {/* Bottom Row: Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate max-w-[140px] sm:max-w-none">{order.deliverySlot || "⚡ Express 45-min delivery"}</span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 px-3.5 py-1.5 rounded-xl transition-colors active:scale-95"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
