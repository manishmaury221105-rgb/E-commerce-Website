import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check by ID or Slug
    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: id }, { slug: id }],
      },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const parsed = {
      ...product,
      images: Array.isArray(product.images)
        ? product.images
        : typeof product.images === "string"
        ? JSON.parse(product.images || "[]")
        : [],
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
      dealEndsAt: product.dealEndsAt ? product.dealEndsAt.toISOString() : null,
      reviews: product.reviews.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({ product: parsed });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        slug: body.slug !== undefined ? body.slug.trim() : undefined,
        description: body.description !== undefined ? body.description : undefined,
        shortDescription: body.shortDescription !== undefined ? body.shortDescription : undefined,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        compareAtPrice: body.compareAtPrice !== undefined ? (body.compareAtPrice ? parseFloat(body.compareAtPrice) : null) : undefined,
        costPrice: body.costPrice !== undefined ? (body.costPrice ? parseFloat(body.costPrice) : null) : undefined,
        sku: body.sku !== undefined ? body.sku : undefined,
        barcode: body.barcode !== undefined ? body.barcode : undefined,
        stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
        lowStockThreshold: body.lowStockThreshold !== undefined ? parseInt(body.lowStockThreshold) : undefined,
        unit: body.unit !== undefined ? body.unit : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        isDailyDeal: body.isDailyDeal !== undefined ? Boolean(body.isDailyDeal) : undefined,
        dealEndsAt: body.dealEndsAt !== undefined ? (body.dealEndsAt ? new Date(body.dealEndsAt) : null) : undefined,
        images: body.images !== undefined ? (Array.isArray(body.images) ? JSON.stringify(body.images) : JSON.stringify([body.images])) : undefined,
        categoryId: body.categoryId !== undefined ? body.categoryId : undefined,
      },
    });

    return NextResponse.json({ product: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const { id } = params;
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
