import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIE_NAME, isProtectedRoute, isRoleAllowed, Role } from "@/lib/auth";

// Runs on the Edge runtime, so we verify the JWT signature directly with
// `jose` instead of calling the FastAPI backend on every request.
const secret = new TextEncoder().encode(process.env.JWT_SECRET_KEY);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard the app's protected sections; let /login, /unauthorized,
  // static assets, and API routes pass straight through.
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

    if (!role || !isRoleAllowed(pathname, role)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Make the caller's identity available to Server Components/route
    // handlers downstream without re-decoding the token.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-role", role);
    requestHeaders.set("x-user-id", String(payload.sub ?? ""));

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    // Expired or tampered token.
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/complaint-list/:path*",
    "/case-list/:path*",
    "/register-complaint/:path*",
    "/generate-document/:path*",
  ],
};
