import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const userPayload = getCurrentUserFromRequest(req);
    if (!userPayload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: userPayload.userId,
        name: userPayload.name || "User",
        email: userPayload.email,
        phone: "+91 73804 92118",
        role: userPayload.role || "CUSTOMER",
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("GET /api/auth/me error:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
