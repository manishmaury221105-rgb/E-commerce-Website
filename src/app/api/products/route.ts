import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const isFeatured = searchParams.get("featured") === "true";
    const isDailyDeal = searchParams.get("deal") === "true";
    const inStock = searchParams.get("inStock") === "true";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const sort = searchParams.get("sort") || "featured";
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const where: any = {};

    if (search.trim()) {
      where.OR = [
        { name: { contains: search.trim() } },
        { description: { contains: search.trim() } },
        { shortDescription: { contains: search.trim() } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (isDailyDeal) {
      where.isDailyDeal = true;
    }

    if (inStock) {
      where.stock = { gt: 0 };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    else if (sort === "price-desc") orderBy = { price: "desc" };
    else if (sort === "rating") orderBy = { rating: "desc" };
    else if (sort === "newest") orderBy = { createdAt: "desc" };
    else if (sort === "name-asc") orderBy = { name: "asc" };

    const products = await prisma.product.findMany({
      where,
      orderBy,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    const parsedProducts = products.map((p) => ({
      ...p,
      images: Array.isArray(p.images)
        ? p.images
        : typeof p.images === "string"
        ? JSON.parse(p.images || "[]")
        : [],
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      dealEndsAt: p.dealEndsAt ? p.dealEndsAt.toISOString() : null,
    }));

    return NextResponse.json({ products: parsedProducts });
  } catch (error: any) {
    console.error("Products GET error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      compareAtPrice,
      costPrice,
      sku,
      barcode,
      stock,
      lowStockThreshold,
      unit,
      isFeatured,
      isDailyDeal,
      dealEndsAt,
      images,
      categoryId,
    } = body;

    if (!name || !price || !categoryId) {
      return NextResponse.json({ error: "Name, price and category are required" }, { status: 400 });
    }

    const generatedSlug =
      (slug && slug.trim()) ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") + `-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: generatedSlug,
        description: description || name,
        shortDescription: shortDescription || null,
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        sku: sku || null,
        barcode: barcode || null,
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        unit: unit || "1 piece",
        isFeatured: Boolean(isFeatured),
        isDailyDeal: Boolean(isDailyDeal),
        dealEndsAt: dealEndsAt ? new Date(dealEndsAt) : null,
        images: Array.isArray(images) ? JSON.stringify(images) : JSON.stringify([images || "https://placehold.co/400x400"]),
        categoryId,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
