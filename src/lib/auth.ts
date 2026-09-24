import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { SafeUser } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-key-shop-2026";
export const AUTH_COOKIE_NAME = "shop_auth_token";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; role: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { userId: string; email: string; role: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string; name: string };
  } catch (error) {
    return null;
  }
}

export function getCurrentUserFromRequest(request: NextRequest): { userId: string; email: string; role: string; name: string } | null {
  // Check Cookie first
  const tokenFromCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (tokenFromCookie) {
    const verified = verifyToken(tokenFromCookie);
    if (verified) return verified;
  }

  // Check Authorization Bearer header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    return verifyToken(token);
  }

  return null;
}
