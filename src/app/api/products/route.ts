import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || searchParams.get("q") || "";
    const categorySlug = searchParams.get("category") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const isFeatured = searchParams.get("featured") === "true";
    const isDailyDeal = searchParams.get("deal") === "true";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const sort = searchParams.get("sort") as any;
    const limitCount = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const products = await getProducts({
      search,
      categoryId: categoryId || (categorySlug ? categorySlug : undefined),
      categorySlug,
      isFeatured: isFeatured || undefined,
      isDailyDeal: isDailyDeal || undefined,
      minPrice,
      maxPrice,
      sort: sort === "price-asc" ? "price_asc" : sort === "price-desc" ? "price_desc" : sort === "rating" ? "rating" : "newest",
      limitCount,
    });

    return NextResponse.json({ products });
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

    const newProduct = await createProduct({
      name: name.trim(),
      slug,
      description,
      shortDescription,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      sku,
      barcode,
      stock: parseInt(stock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
      unit: unit || "1 piece",
      isFeatured: Boolean(isFeatured),
      isDailyDeal: Boolean(isDailyDeal),
      dealEndsAt: dealEndsAt || null,
      images: Array.isArray(images) && images.length > 0 ? images : [images || "https://placehold.co/400x400"],
      categoryId,
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Product POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 500 });
  }
}
