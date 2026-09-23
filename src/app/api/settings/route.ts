import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function GET() {
  try {
    let settings = await prisma.storeSetting.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      settings = await prisma.storeSetting.create({
        data: {
          id: "default",
          shopName: "FreshMart Local Supermarket",
          phone: "+91 73804 92118",
          whatsapp: "+917380492118",
          email: "help@freshmart.local",
          address: "Shop #14, Main Market Square, Near Central Clock Tower",
          currency: "₹",
          freeDeliveryMin: 499,
          deliveryFee: 40,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload || (userPayload.role !== "ADMIN" && userPayload.role !== "STAFF")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();

    const updated = await prisma.storeSetting.upsert({
      where: { id: "default" },
      update: {
        shopName: body.shopName,
        phone: body.phone,
        whatsapp: body.whatsapp,
        email: body.email,
        address: body.address,
        currency: body.currency,
        freeDeliveryMin: parseFloat(body.freeDeliveryMin) || 499,
        deliveryFee: parseFloat(body.deliveryFee) || 40,
        announcement: body.announcement,
        openHours: body.openHours,
      },
      create: {
        id: "default",
        shopName: body.shopName || "FreshMart",
        phone: body.phone || "",
        whatsapp: body.whatsapp || "",
        email: body.email || "",
        address: body.address || "",
        currency: body.currency || "₹",
        freeDeliveryMin: parseFloat(body.freeDeliveryMin) || 499,
        deliveryFee: parseFloat(body.deliveryFee) || 40,
        announcement: body.announcement,
        openHours: body.openHours,
      },
    });

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
