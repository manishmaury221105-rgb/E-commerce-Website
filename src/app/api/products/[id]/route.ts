import { NextRequest, NextResponse } from "next/server";
import { 
  getProductByIdOrSlug, 
  updateProduct, 
  deleteProduct, 
  getProductReviews, 
  getCategoryByIdOrSlug 
} from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const product = await getProductByIdOrSlug(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Attach category details and reviews
    let category = undefined;
    if (product.categoryId) {
      category = await getCategoryByIdOrSlug(product.categoryId);
    }
    const reviews = await getProductReviews(product.id);

    return NextResponse.json({
      product: {
        ...product,
        category: category || undefined,
        reviews,
      },
    });
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

    const updated = await updateProduct(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

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
    await deleteProduct(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
