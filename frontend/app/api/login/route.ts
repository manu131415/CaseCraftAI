import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Same-origin proxy: the browser calls THIS route, never the FastAPI
// backend directly. That lets us set an httpOnly cookie (not readable by
// JS, immune to XSS token theft) which middleware.ts can still read
// because it's a server-side request inspector, not the DOM.
export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendRes = await fetch(`${process.env.BACKEND_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendRes.json();

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: data.detail || "Login failed" },
      { status: backendRes.status }
    );
  }

  const response = NextResponse.json({ user: data.user });

  response.cookies.set(AUTH_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: data.expires_in,
    path: "/",
  });

  return response;
}
