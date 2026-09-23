import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // If Admin/Staff: fetch all orders with filters
    if (userPayload && (userPayload.role === "ADMIN" || userPayload.role === "STAFF")) {
      const where: any = {};
      if (status && status !== "ALL") where.orderStatus = status;

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      });

      const parsed = orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress || "{}"),
        trackingHistory: JSON.parse(o.trackingHistory || "[]"),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      return NextResponse.json({ orders: parsed });
    }

    // Customer: fetch their own orders
    if (userPayload) {
      const orders = await prisma.order.findMany({
        where: { userId: userPayload.userId },
        orderBy: { createdAt: "desc" },
        include: {
          items: true,
        },
      });

      const parsed = orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress || "{}"),
        trackingHistory: JSON.parse(o.trackingHistory || "[]"),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      return NextResponse.json({ orders: parsed });
    }

    // Guest lookup by email or phone if provided in query
    const guestEmail = searchParams.get("email");
    const guestPhone = searchParams.get("phone");
    if (guestEmail || guestPhone) {
      const where: any = {};
      if (guestEmail) where.customerEmail = guestEmail;
      if (guestPhone) where.customerPhone = guestPhone;

      const orders = await prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      });

      const parsed = orders.map((o) => ({
        ...o,
        shippingAddress: JSON.parse(o.shippingAddress || "{}"),
        trackingHistory: JSON.parse(o.trackingHistory || "[]"),
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
      }));

      return NextResponse.json({ orders: parsed });
    }

    return NextResponse.json({ orders: [] });
  } catch (error: any) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const body = await req.json();

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      deliverySlot,
      notes,
      items,
      paymentMethod,
      couponCode,
    } = body;

    if (!items || !items.length || !customerName || !customerPhone || !shippingAddress) {
      return NextResponse.json({ error: "Incomplete order details" }, { status: 400 });
    }

    // Calculate subtotal and verify items against database
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      productId: string;
      productName: string;
      productImage: string | null;
      price: number;
      quantity: number;
      unit: string;
      total: number;
    }> = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product "${item.name}" is no longer available` }, { status: 400 });
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for "${product.name}". Only ${product.stock} left in stock.` },
          { status: 400 }
        );
      }

      const itemTotal = product.price * item.quantity;
      calculatedSubtotal += itemTotal;

      const productImages = Array.isArray(product.images)
        ? product.images
        : typeof product.images === "string"
        ? JSON.parse(product.images || "[]")
        : [];

      validatedItems.push({
        productId: product.id,
        productName: product.name,
        productImage: productImages[0] || null,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        total: itemTotal,
      });
    }

    // Settings for delivery fee & threshold
    const storeSettings = await prisma.storeSetting.findUnique({ where: { id: "default" } });
    const freeDeliveryThreshold = storeSettings?.freeDeliveryMin || 499;
    const defaultDeliveryFee = storeSettings?.deliveryFee || 40;
    const deliveryFee = calculatedSubtotal >= freeDeliveryThreshold ? 0 : defaultDeliveryFee;

    // Coupon discount calculation
    let discountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (coupon && coupon.isActive && calculatedSubtotal >= coupon.minOrderAmount) {
        validCouponCode = coupon.code;
        if (coupon.discountType === "PERCENTAGE") {
          discountAmount = (calculatedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
            discountAmount = coupon.maxDiscountAmount;
          }
        } else {
          discountAmount = coupon.discountValue;
        }

        // Increment coupon count
        await prisma.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } },
        });
      }
    }

    const total = Math.max(0, calculatedSubtotal - discountAmount + deliveryFee);
    const orderNumber = generateOrderNumber();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isOnlinePayment = paymentMethod !== "COD";
    const paymentStatus = isOnlinePayment ? "PAID" : "PENDING";

    const initialTracking = [
      {
        status: "PENDING",
        timestamp: new Date().toISOString(),
        note: isOnlinePayment
          ? `Order placed successfully with online payment (${paymentMethod}).`
          : "Order placed successfully with Cash on Delivery.",
      },
    ];

    // Create Order with Transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userPayload?.userId || null,
          customerName: customerName.trim(),
          customerEmail: (customerEmail || "").trim().toLowerCase(),
          customerPhone: customerPhone.trim(),
          shippingAddress: typeof shippingAddress === "string" ? shippingAddress : JSON.stringify(shippingAddress),
          deliverySlot: deliverySlot || "⚡ Express Delivery (Within 2 Hours)",
          notes: notes || null,
          subtotal: calculatedSubtotal,
          deliveryFee,
          discountAmount,
          couponCode: validCouponCode,
          total,
          paymentMethod: paymentMethod || "COD",
          paymentStatus,
          orderStatus: "PENDING",
          trackingHistory: JSON.stringify(initialTracking),
          invoiceNumber,
          items: {
            create: validatedItems,
          },
        },
        include: {
          items: true,
        },
      });

      // 2. Reduce product inventory
      for (const item of validatedItems) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json(
      {
        message: "Order placed successfully!",
        order: {
          ...order,
          shippingAddress: JSON.parse(order.shippingAddress),
          trackingHistory: JSON.parse(order.trackingHistory),
          createdAt: order.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
