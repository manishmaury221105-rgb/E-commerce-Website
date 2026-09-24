import { NextRequest, NextResponse } from "next/server";
import { getCoupons, createCoupon } from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const coupons = await getCoupons();

    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      const activeCoupons = coupons.filter((c) => c.isActive);
      return NextResponse.json({ coupons: activeCoupons });
    }

    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { code, discountType, discountValue, minOrderAmount, maxDiscountAmount, usageLimit, expiresAt } = body;

    if (!code || discountValue === undefined) {
      return NextResponse.json({ error: "Code and discount value are required" }, { status: 400 });
    }

    const coupon = await createCoupon({
      code,
      discountType,
      discountValue: parseFloat(discountValue),
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      expiresAt: expiresAt || null,
      isActive: true,
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create coupon" }, { status: 500 });
  }
}
