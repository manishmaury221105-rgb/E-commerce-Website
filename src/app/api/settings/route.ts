import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getStoreSettings, updateStoreSettings } from "@/lib/firestore-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings GET error:", error);
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

    const updated = await updateStoreSettings({
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
    });

    return NextResponse.json({ settings: updated });
  } catch (error: any) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
