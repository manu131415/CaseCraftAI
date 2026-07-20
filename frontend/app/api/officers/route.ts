import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const backendRes = await fetch(`${process.env.BACKEND_API_URL}/officers/`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!backendRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch officers" },
      { status: backendRes.status }
    );
  }

  const officers = await backendRes.json();
  return NextResponse.json({ officers });
}