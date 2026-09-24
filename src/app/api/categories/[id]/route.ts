import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        slug: body.slug !== undefined ? body.slug.trim() : undefined,
        description: body.description !== undefined ? body.description : undefined,
        image: body.image !== undefined ? body.image : undefined,
        icon: body.icon !== undefined ? body.icon : undefined,
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
        order: body.order !== undefined ? parseInt(body.order) : undefined,
      },
    });

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

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Unlink child categories
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });

    // If category has products, reassign them to another category
    if (category._count.products > 0) {
      let fallbackCategory = await prisma.category.findFirst({
        where: { id: { not: id } },
      });

      if (!fallbackCategory) {
        fallbackCategory = await prisma.category.create({
          data: {
            name: "General & Miscellaneous",
            slug: "general-miscellaneous",
            description: "General grocery and store items",
            image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
          },
        });
      }

      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: fallbackCategory.id },
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Delete Category Error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete category" }, { status: 500 });
  }
}
