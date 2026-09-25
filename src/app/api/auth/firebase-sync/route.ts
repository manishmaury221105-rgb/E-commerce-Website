import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createFirestoreUser } from "@/lib/firestore-users";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, name, phone, uid } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const displayName = name || cleanEmail.split("@")[0] || "User";

    // Find or create user in Firestore
    let user = await findUserByEmail(cleanEmail);

    if (!user) {
      const isAdminEmail =
        cleanEmail.includes("manish") ||
        cleanEmail.includes("admin") ||
        cleanEmail === "manish@2211" ||
        cleanEmail === "manish@2211.com" ||
        cleanEmail === "manish.chaitanyashree@gmail.com";

      const created = await createFirestoreUser({
        name: displayName,
        email: cleanEmail,
        phone: phone || undefined,
        role: isAdminEmail ? "ADMIN" : "CUSTOMER",
        id: uid || undefined,
      });
      user = {
        id: created.id,
        name: created.name,
        email: created.email,
        phone: created.phone,
        role: created.role,
        createdAt: created.createdAt,
        updatedAt: created.createdAt,
      };
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Firebase authentication synced successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt,
      },
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Firebase Sync API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
