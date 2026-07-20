import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

// Same-origin proxy, mirrors login/route.ts and logout/route.ts.
// The cookie is httpOnly so only a server-side handler like this one
// can read the token — client components must go through this route
// instead of touching the cookie directly.
export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.BACKEND_API_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json({ error: "Session expired" }, { status: backendRes.status });
  }

  const data = await backendRes.json();

  // Normalize to { user: SessionUser } to match how Navbar.tsx reads it
  return NextResponse.json({ user: data.user ?? data });
}