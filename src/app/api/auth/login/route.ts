import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/firestore-users";
import { comparePassword, signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Direct Admin Fast-Pass
    if (
      cleanEmail === "manish@2211" &&
      password === "m@221105"
    ) {
      const adminUser = {
        id: "admin_master_id",
        name: "Manish Maurya (Admin)",
        email: "manish@2211",
        phone: "+91 73804 92118",
        role: "ADMIN" as const,
        createdAt: new Date().toISOString(),
      };

      const token = signToken({
        userId: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name,
      });

      const response = NextResponse.json({
        message: "Login successful",
        user: adminUser,
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
    }

    // 2. Lookup user in Firestore
    let user = null;
    try {
      user = await findUserByEmail(cleanEmail);
    } catch (dbErr) {
      console.warn("Firestore lookup failed:", dbErr);
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Login successful",
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
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
