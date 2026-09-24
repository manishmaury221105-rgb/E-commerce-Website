"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  AlertTriangle,
  Users,
  Package,
  ArrowRight,
  ExternalLink,
  DollarSign,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Order, Product } from "@/types";
import { subscribeToOrders, subscribeToProducts } from "@/lib/firestore-service";

interface AnalyticsData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    activeOrders: number;
    deliveredOrders: number;
    totalCustomers: number;
    totalProducts: number;
  };
  salesTrend: { date: string; sales: number; orders: number }[];
  lowStockProducts: { id: string; name: string; stock: number; price: number }[];
  recentOrders: Order[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ordersList: Order[] = [];
    let productsList: Product[] = [];

    const recalculateMetrics = () => {
      const paidOrders = ordersList.filter(
        (o) => (o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED") && o.orderStatus !== "CANCELLED"
      );
      const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      const totalOrders = ordersList.length;
      const pendingOrders = ordersList.filter((o) => o.orderStatus === "PENDING").length;
      const activeOrders = ordersList.filter((o) =>
        ["CONFIRMED", "PACKED", "OUT_FOR_DELIVERY"].includes(o.orderStatus)
      ).length;
      const deliveredOrders = ordersList.filter((o) => o.orderStatus === "DELIVERED").length;

      // Unique customer count
      const uniqueEmails = new Set(ordersList.map((o) => o.customerEmail).filter(Boolean));
      const totalCustomers = Math.max(uniqueEmails.size, 1);

      const totalProducts = productsList.length;
      const lowStockProducts = productsList
        .filter((p) => (p.stock || 0) <= (p.lowStockThreshold || 10))
        .slice(0, 6)
        .map((p) => ({
          id: p.id,
          name: p.name,
          stock: p.stock,
          price: p.price,
        }));

      const recentOrders = ordersList.slice(0, 6);

      // 7-day sales trend
      const last7Days: { date: string; sales: number; orders: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const dayOrders = paidOrders.filter((o) => {
          const orderDate = new Date(o.createdAt || 0);
          return orderDate >= d && orderDate < nextD;
        });

        const daySales = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const dateLabel = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });

        last7Days.push({
          date: dateLabel,
          sales: daySales,
          orders: dayOrders.length,
        });
      }

      setData({
        metrics: {
          totalRevenue,
          totalOrders,
          pendingOrders,
          activeOrders,
          deliveredOrders,
          totalCustomers,
          totalProducts,
        },
        salesTrend: last7Days,
        lowStockProducts,
        recentOrders,
      });
      setLoading(false);
    };

    const unsubOrders = subscribeToOrders((liveOrders) => {
      ordersList = liveOrders;
      recalculateMetrics();
    });

    const unsubProducts = subscribeToProducts((liveProducts) => {
      productsList = liveProducts;
      recalculateMetrics();
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-400 space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold">Loading store analytics & metrics...</p>
      </div>
    );
  }

  const { metrics, salesTrend, lowStockProducts, recentOrders } = data;

  // Max sales for bar scaling
  const maxSales = Math.max(...salesTrend.map((s) => s.sales), 1000);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <span className="text-emerald-400 font-extrabold text-xs tracking-wider uppercase bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-1 rounded-full">
            Live Store Analytics
          </span>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight mt-2">
            Store Performance Overview
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor sales revenue, active order dispatch, and inventory alerts in real time
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products/new"
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
          >
            <span>Live Order Board</span>
          </Link>
        </div>
      </div>

      {/* 1. Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sales Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-white">
            {formatCurrency(metrics.totalRevenue)}
          </p>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <span>Verified Paid Orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Orders</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-white">
            {metrics.totalOrders}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            <strong className="text-white">{metrics.deliveredOrders}</strong> Delivered
          </p>
        </div>

        {/* Active Dispatch */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Dispatches</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-white">
            {metrics.pendingOrders + metrics.activeOrders}
          </p>
          <p className="text-[11px] text-purple-300 font-semibold">
            {metrics.pendingOrders} Pending Verification
          </p>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low Stock Warning</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-extrabold text-2xl sm:text-3xl text-amber-400">
            {lowStockProducts.length}
          </p>
          <p className="text-[11px] text-amber-400/80 font-medium">
            Items need inventory restocking
          </p>
        </div>
      </div>

      {/* 2. Sales Trend Visualizer Chart & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-white">7-Day Sales Trend</h3>
              <p className="text-xs text-slate-400">Revenue per day across customer orders</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/40">
              Live Feed
            </span>
          </div>

          {/* Bar chart */}
          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-800">
            {salesTrend.map((item, idx) => {
              const heightPercent = Math.max(8, Math.round((item.sales / maxSales) * 100));

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full flex flex-col items-center">
                    {/* Tooltip on hover */}
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-opacity pointer-events-none whitespace-nowrap border border-slate-700">
                      ₹{item.sales} ({item.orders} orders)
                    </span>
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-emerald-700 to-emerald-400 rounded-t-xl transition-all duration-500 group-hover:brightness-125"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 truncate max-w-full">
                    {item.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Low Stock Alert Sidebar */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Stock Alerts</span>
            </h3>
            <Link href="/admin/products" className="text-xs text-emerald-400 hover:underline font-bold">
              Manage All
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-500 text-xs italic py-4 text-center">
                All inventory items are well-stocked!
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-200 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatCurrency(p.price)}</p>
                  </div>
                  <span className="bg-amber-950/80 text-amber-400 border border-amber-800/60 font-extrabold text-[11px] px-2 py-0.5 rounded-lg flex-shrink-0">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders Board */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-heading font-bold text-base text-white">Recent Customer Orders</h3>
            <p className="text-xs text-slate-400">Incoming requests requiring preparation and dispatch</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All Orders ({metrics.totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Items</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Payment</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {recentOrders.map((order) => {
                const statusInfo = ORDER_STATUS_LABELS[order.orderStatus] || {
                  label: order.orderStatus,
                  color: "bg-slate-800 text-slate-300",
                };

                return (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-mono font-bold text-white">{order.orderNumber}</td>
                    <td className="py-3">
                      <p className="font-bold text-slate-200">{order.customerName}</p>
                      <p className="text-[10px] text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="py-3 text-slate-400">{order.items.length} items</td>
                    <td className="py-3 font-bold text-emerald-400">{formatCurrency(order.total)}</td>
                    <td className="py-3">
                      <span className="text-[10px] uppercase font-bold bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 font-bold px-2.5 py-1 rounded-lg transition-colors inline-block"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
