import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("shop_auth_token")?.value;

  // 1. Guard Admin Routes
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      loginUrl.searchParams.set("error", "admin_required");
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Decode JWT payload safely (Edge compatible)
      const parts = token.split(".");
      if (parts.length === 3) {
        const payloadBase64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonString = atob(payloadBase64);
        const user = JSON.parse(jsonString);

        if (user.role !== "ADMIN" && user.role !== "STAFF") {
          const deniedUrl = new URL("/auth/login", request.url);
          deniedUrl.searchParams.set("error", "unauthorized_role");
          return NextResponse.redirect(deniedUrl);
        }
      } else {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Guard Customer Account & Orders Routes
  if (pathname.startsWith("/account")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
