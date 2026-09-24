import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail, createFirestoreUser } from "@/lib/firestore-users";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existingUser = await findUserByEmail(cleanEmail);

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const newUser = await createFirestoreUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: phone ? phone.trim() : undefined,
      role: "CUSTOMER",
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    const response = NextResponse.json({
      message: "Account created successfully",
      user: newUser,
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
    console.error("Register API Error:", error);
    return NextResponse.json({ error: "Failed to register account" }, { status: 500 });
  }
}
