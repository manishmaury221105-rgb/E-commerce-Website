import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    const { productId, rating, comment, userName } = await req.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Product, rating, and comment are required" }, { status: 400 });
    }

    const review = await prisma.productReview.create({
      data: {
        productId,
        userId: userPayload?.userId || null,
        userName: userName || userPayload?.name || "Verified Customer",
        rating: Math.max(1, Math.min(5, parseInt(rating))),
        comment: comment.trim(),
        isApproved: true,
      },
    });

    // Update product average rating and count
    const allReviews = await prisma.productReview.findMany({
      where: { productId, isApproved: true },
    });

    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: parseFloat(avgRating.toFixed(1)),
        numReviews: allReviews.length,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
