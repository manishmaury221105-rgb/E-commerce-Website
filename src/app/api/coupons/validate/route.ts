import { NextRequest, NextResponse } from "next/server";
import { validateCoupon } from "@/lib/firestore-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Please enter a coupon code" }, { status: 400 });
    }

    const result = await validateCoupon(code, Number(subtotal) || 0);

    if (!result.valid || !result.coupon) {
      return NextResponse.json({ error: result.message || "Invalid coupon code" }, { status: 400 });
    }

    return NextResponse.json({
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        discountType: result.coupon.discountType,
        discountValue: result.coupon.discountValue,
        minOrderAmount: result.coupon.minOrderAmount,
        maxDiscountAmount: result.coupon.maxDiscountAmount,
      },
      discountAmount: result.discountAmount,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
