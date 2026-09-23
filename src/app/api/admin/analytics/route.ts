import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // 1. Total revenue
    const paidOrders = await prisma.order.findMany({
      where: {
        paymentStatus: "PAID",
        orderStatus: { not: "CANCELLED" },
      },
      select: { total: true, createdAt: true },
    });

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // 2. Total orders count & status breakdown
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { orderStatus: "PENDING" } });
    const activeOrders = await prisma.order.count({
      where: { orderStatus: { in: ["CONFIRMED", "PACKED", "OUT_FOR_DELIVERY"] } },
    });
    const deliveredOrders = await prisma.order.count({ where: { orderStatus: "DELIVERED" } });

    // 3. Total customers
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });

    // 4. Products count & low stock products
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.findMany({
      where: {
        stock: { lte: 10 },
      },
      take: 6,
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
        price: true,
      },
    });

    // 5. Recent 6 orders
    const recentOrders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        items: true,
      },
    });

    const parsedRecentOrders = recentOrders.map((o) => ({
      ...o,
      shippingAddress: JSON.parse(o.shippingAddress || "{}"),
      trackingHistory: JSON.parse(o.trackingHistory || "[]"),
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    }));

    // 6. Sales trends for last 7 days
    const last7Days: { date: string; sales: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(d.getDate() + 1);

      const dayOrders = paidOrders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= d && orderDate < nextD;
      });

      const daySales = dayOrders.reduce((sum, o) => sum + o.total, 0);
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
      recentOrders: parsedRecentOrders,
    });
  } catch (error: any) {
    console.error("Admin Analytics error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
