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

    const customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            orderStatus: true,
            paymentStatus: true,
          },
        },
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    });

    const parsed = customers.map((c) => {
      const totalSpend = c.orders
        .filter((o) => o.paymentStatus === "PAID" || o.orderStatus === "DELIVERED")
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        totalOrders: c.orders.length,
        totalSpend,
        defaultAddress: c.addresses[0] || null,
        joinedDate: c.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ customers: parsed });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
