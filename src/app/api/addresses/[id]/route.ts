import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUserFromRequest } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    if (body.isDefault) {
      await prisma.address.updateMany({
        where: { userId: userPayload.userId },
        data: { isDefault: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id, userId: userPayload.userId },
      data: {
        name: body.name !== undefined ? body.name.trim() : undefined,
        phone: body.phone !== undefined ? body.phone.trim() : undefined,
        street: body.street !== undefined ? body.street.trim() : undefined,
        apartment: body.apartment !== undefined ? body.apartment : undefined,
        city: body.city !== undefined ? body.city.trim() : undefined,
        state: body.state !== undefined ? body.state.trim() : undefined,
        postalCode: body.postalCode !== undefined ? body.postalCode.trim() : undefined,
        country: body.country !== undefined ? body.country : undefined,
        isDefault: body.isDefault !== undefined ? Boolean(body.isDefault) : undefined,
        label: body.label !== undefined ? body.label : undefined,
      },
    });

    return NextResponse.json({ address: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    await prisma.address.delete({
      where: { id, userId: userPayload.userId },
    });

    return NextResponse.json({ message: "Address deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
