export type Role = "IO" | "SHO" | "LEGAL_ADVISOR";

export const ROLES: { value: Role; label: string; blurb: string }[] = [
  { value: "IO", label: "IO", blurb: "Investigating Officer" },
  { value: "SHO", label: "SHO", blurb: "Station House Officer" },
  { value: "LEGAL_ADVISOR", label: "Legal Advisor", blurb: "Legal Advisor" },
];

export const AUTH_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "casecraft_token";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Route access map, checked by middleware.ts.
 * Keys are path prefixes; "ALL" means any authenticated role may enter.
 * The first matching prefix wins — order matters, most specific first.
 */
export const ROLE_ACCESS: { prefix: string; roles: Role[] | "ALL" }[] = [
  // Specific role subfolders MUST come before the generic "/dashboard"
  // entry below — isRoleAllowed() matches the first prefix hit, and
  // "/dashboard/legal".startsWith("/dashboard") is also true.
  { prefix: "/dashboard/io", roles: ["IO"] },
  { prefix: "/dashboard/sho", roles: ["SHO"] },
  { prefix: "/dashboard/legal", roles: ["LEGAL_ADVISOR"] },
  { prefix: "/dashboard", roles: "ALL" },
  { prefix: "/complaint-list", roles: "ALL" },
  { prefix: "/case-list", roles: "ALL" },
  { prefix: "/register-complaint", roles: ["IO", "SHO"] },
  { prefix: "/generate-document", roles: ["LEGAL_ADVISOR", "SHO"] },
];

export function isRoleAllowed(pathname: string, role: Role): boolean {
  const match = ROLE_ACCESS.find((r) => pathname.startsWith(r.prefix));
  if (!match) return true; // unlisted routes aren't role-gated
  if (match.roles === "ALL") return true;
  return match.roles.includes(role);
}

export function isProtectedRoute(pathname: string): boolean {
  return ROLE_ACCESS.some((r) => pathname.startsWith(r.prefix));
}