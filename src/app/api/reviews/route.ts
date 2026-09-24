import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { createProductReview, getProductReviews } from "@/lib/firestore-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const reviews = await getProductReviews(productId);
    return NextResponse.json({ reviews });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const { productId, rating, comment, userName } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product, rating, and comment are required" }, { status: 400 });
    }

    const review = await createProductReview({
      productId,
      userId: userPayload?.userId || null,
      userName: userName || userPayload?.name || "Verified Customer",
      rating: Math.max(1, Math.min(5, parseInt(rating))),
      comment: comment.trim(),
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
