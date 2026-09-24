import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getOrders, getProducts } from "@/lib/firestore-service";
import { getAllCustomers } from "@/lib/firestore-users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const [allOrders, allProducts, allCustomers] = await Promise.all([
      getOrders(),
      getProducts(),
      getAllCustomers(),
    ]);

    // 1. Total revenue
    const paidOrders = allOrders.filter(
      (o) => (o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED") && o.orderStatus !== "CANCELLED"
    );
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    // 2. Order counts
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.orderStatus === "PENDING").length;
    const activeOrders = allOrders.filter((o) =>
      ["CONFIRMED", "PACKED", "OUT_FOR_DELIVERY"].includes(o.orderStatus)
    ).length;
    const deliveredOrders = allOrders.filter((o) => o.orderStatus === "DELIVERED").length;

    // 3. Customers count
    const customerList = allCustomers.filter((c) => c.role === "CUSTOMER");
    const totalCustomers = customerList.length;

    // 4. Products & Low stock
    const totalProducts = allProducts.length;
    const lowStockProducts = allProducts
      .filter((p) => (p.stock || 0) <= (p.lowStockThreshold || 10))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold || 5,
        price: p.price,
      }));

    // 5. Recent 6 orders
    const recentOrders = allOrders.slice(0, 6);

    // 6. Sales trends for last 7 days
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

    return NextResponse.json({
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
  } catch (error: any) {
    console.error("Admin Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
