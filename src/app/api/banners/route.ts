import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const banner = await prisma.banner.create({
      data: {
        title: body.title,
        subtitle: body.subtitle,
        tag: body.tag,
        image: body.image,
        link: body.link || "/products",
        buttonText: body.buttonText || "Shop Now",
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
        order: parseInt(body.order) || 0,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 });
  }
}
