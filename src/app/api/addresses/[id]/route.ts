import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { updateUserAddress, deleteUserAddress } from "@/lib/firestore-users";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updated = await updateUserAddress(userPayload.userId, id, {
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
    });

    if (!updated) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ address: updated });
  } catch (error: any) {
    console.error("Address PUT error:", error);
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
    const success = await deleteUserAddress(userPayload.userId, id);
    if (!success) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Address deleted" });
  } catch (error: any) {
    console.error("Address DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
