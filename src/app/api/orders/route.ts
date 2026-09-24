import { NextRequest, NextResponse } from "next/server";
import { 
  getOrders, 
  createOrder, 
  getProductByIdOrSlug, 
  getStoreSettings, 
  validateCoupon 
} from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    // If Admin/Staff: fetch all orders with status filter
    if (userPayload && (userPayload.role === "ADMIN" || userPayload.role === "STAFF")) {
      let orders = await getOrders();
      if (status && status !== "ALL") {
        orders = orders.filter((o) => o.orderStatus === status);
      }
      return NextResponse.json({ orders });
    }

    // Customer: fetch their own orders
    if (userPayload) {
      const orders = await getOrders(userPayload.userId);
      return NextResponse.json({ orders });
    }

    // Guest lookup by email or phone
    const guestEmail = searchParams.get("email");
    const guestPhone = searchParams.get("phone");
    if (guestEmail || guestPhone) {
      const allOrders = await getOrders();
      const guestOrders = allOrders.filter(
        (o) =>
          (guestEmail && o.customerEmail.toLowerCase() === guestEmail.toLowerCase().trim()) ||
          (guestPhone && o.customerPhone === guestPhone.trim())
      );
      return NextResponse.json({ orders: guestOrders });
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

    // Calculate subtotal and verify items against Firestore
    let calculatedSubtotal = 0;
    const validatedItems: Array<{
      id: string;
      orderId: string;
      productId: string;
      productName: string;
      productImage: string | null;
      price: number;
      quantity: number;
      unit: string;
      total: number;
    }> = [];

    for (const item of items) {
      const product = await getProductByIdOrSlug(item.productId);

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

      validatedItems.push({
        id: `item-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        orderId: "",
        productId: product.id,
        productName: product.name,
        productImage: Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        total: itemTotal,
      });
    }

    // Settings for delivery fee & threshold
    const storeSettings = await getStoreSettings();
    const freeDeliveryThreshold = storeSettings?.freeDeliveryMin || 499;
    const defaultDeliveryFee = storeSettings?.deliveryFee || 40;
    const deliveryFee = calculatedSubtotal >= freeDeliveryThreshold ? 0 : defaultDeliveryFee;

    // Coupon discount calculation
    let discountAmount = 0;
    let validCouponCode = null;

    if (couponCode) {
      const couponRes = await validateCoupon(couponCode, calculatedSubtotal);
      if (couponRes.valid && couponRes.coupon) {
        validCouponCode = couponRes.coupon.code;
        discountAmount = couponRes.discountAmount || 0;
      }
    }

    const total = Math.max(0, calculatedSubtotal - discountAmount + deliveryFee);

    // Create Order in Firestore
    const order = await createOrder({
      userId: userPayload?.userId || null,
      customerName: customerName.trim(),
      customerEmail: (customerEmail || "").trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      shippingAddress: typeof shippingAddress === "string" ? JSON.parse(shippingAddress) : shippingAddress,
      deliverySlot: deliverySlot || "⚡ Express Delivery (Within 2 Hours)",
      notes: notes || null,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryFee,
      discountAmount,
      couponCode: validCouponCode,
      total,
      paymentMethod: paymentMethod || "COD",
    });

    return NextResponse.json(
      {
        message: "Order placed successfully!",
        order,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to place order" }, { status: 500 });
  }
}
