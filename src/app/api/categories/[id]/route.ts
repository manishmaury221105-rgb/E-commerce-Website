import { NextRequest, NextResponse } from "next/server";
import { updateCategory, deleteCategory, getCategoryByIdOrSlug } from "@/lib/firestore-service";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await updateCategory(id, body);
    if (!updated) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    await deleteCategory(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
