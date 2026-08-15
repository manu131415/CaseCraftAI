import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, isProtectedRoute, isRoleAllowed, Role } from "@/lib/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let public routes pass straight through
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role as Role;

    // Reject access if role is missing or unauthorized for this specific pathname
    if (!role || !isRoleAllowed(pathname, role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Attach verified user identity headers downstream
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Handle expired or tampered token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

// Universal matcher: intercept ALL routes except Next.js internal files and static assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};