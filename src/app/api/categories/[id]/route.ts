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
    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
