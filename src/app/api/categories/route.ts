import { NextRequest, NextResponse } from "next/server";
import { getCategories, createCategory } from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, slug, description, image, icon, isFeatured, order } = body;

    if (!name) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const category = await createCategory({
      name: name.trim(),
      slug,
      description,
      image,
      icon: icon || "ShoppingBag",
      isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : true,
      order: order ? parseInt(order) : 0,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create category" }, { status: 500 });
  }
}
