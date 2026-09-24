import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getUserAddresses, addUserAddress } from "@/lib/firestore-users";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await getUserAddresses(userPayload.userId);
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Addresses GET error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, phone, street, apartment, city, state, postalCode, country, isDefault, label } = body;

    if (!name || !phone || !street || !city || !postalCode) {
      return NextResponse.json({ error: "Please fill in all required address fields" }, { status: 400 });
    }

    const address = await addUserAddress(userPayload.userId, {
      name: name.trim(),
      phone: phone.trim(),
      street: street.trim(),
      apartment: apartment ? apartment.trim() : "",
      city: city.trim(),
      state: (state || "State").trim(),
      postalCode: postalCode.trim(),
      country: country || "India",
      isDefault: Boolean(isDefault),
      label: label || "HOME",
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error: any) {
    console.error("Addresses POST error:", error);
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
