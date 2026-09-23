import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const parsed = {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddress || "{}"),
      trackingHistory: JSON.parse(order.trackingHistory || "[]"),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };

    return NextResponse.json({ order: parsed });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const { orderStatus, paymentStatus, note } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentTracking = JSON.parse(existingOrder.trackingHistory || "[]");

    if (orderStatus && orderStatus !== existingOrder.orderStatus) {
      currentTracking.push({
        status: orderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Order status updated to ${orderStatus}.`,
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        orderStatus: orderStatus || undefined,
        paymentStatus: paymentStatus || undefined,
        trackingHistory: JSON.stringify(currentTracking),
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      order: {
        ...updated,
        shippingAddress: JSON.parse(updated.shippingAddress || "{}"),
        trackingHistory: JSON.parse(updated.trackingHistory || "[]"),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
