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

    let user = null;
    try {
      user = await findUserById(userPayload.userId);
    } catch (e) {
      console.warn("findUserById error in /api/auth/me:", e);
    }

    return NextResponse.json({
      user: {
        id: user?.id || userPayload.userId,
        name: user?.name || userPayload.name,
        email: user?.email || userPayload.email,
        phone: user?.phone || null,
        role: user?.role || (userPayload.role as any) || "CUSTOMER",
        createdAt: user?.createdAt || new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
