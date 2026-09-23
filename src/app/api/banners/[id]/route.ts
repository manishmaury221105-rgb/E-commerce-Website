import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Banner not found" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banner" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await prisma.banner.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        subtitle: body.subtitle !== undefined ? body.subtitle : undefined,
        tag: body.tag !== undefined ? body.tag : undefined,
        image: body.image !== undefined ? body.image : undefined,
        link: body.link !== undefined ? body.link : undefined,
        buttonText: body.buttonText !== undefined ? body.buttonText : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
        order: body.order !== undefined ? parseInt(body.order) : undefined,
      },
    });

    return NextResponse.json({ banner: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = params;
    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Banner deleted successfully" });
  } catch (error: any) {
    console.error("Delete banner error:", error);
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 });
  }
}
