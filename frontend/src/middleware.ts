import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("medsync_token")?.value;
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/" || pathname === "/login";
  const isAuthRoute = pathname === "/login";
  const isPublicStatic =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico");

  if (isPublicStatic) {
    return NextResponse.next();
  }

  // If user is not logged in and attempts to access protected clinical pages, redirect to /login
  if (!token && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and visits /login, redirect to /dashboard
  if (token && isAuthRoute) {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
