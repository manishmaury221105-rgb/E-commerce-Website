import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { findUserById } from "@/lib/firestore-users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await findUserById(userPayload.userId);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
