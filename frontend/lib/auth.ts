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
  // 1. Specific sub-dashboard routes
  { prefix: "/dashboard/io", roles: ["IO"] },
  { prefix: "/dashboard/sho", roles: ["SHO"] },
  { prefix: "/dashboard/legal", roles: ["LEGAL_ADVISOR"] },
  { prefix: "/dashboard", roles: "ALL" },

  // 2. Specific feature pages
  { prefix: "/complaintregister", roles: ["IO"] },
  { prefix: "/complaints", roles: ["IO"] },
  { prefix: "/io/legal-library", roles: ["IO"] },
  { prefix: "/cases", roles: ["IO"] },

  { prefix: "/sho/cases", roles: ["SHO"] },
  { prefix: "/sho/officers", roles: ["SHO"] },

  { prefix: "/legal/cases", roles: ["LEGAL_ADVISOR"] },
  { prefix: "/legal/legal-library", roles: ["LEGAL_ADVISOR"] },

  // 3. General role root paths
  { prefix: "/sho", roles: ["SHO"] },
  { prefix: "/io", roles: ["IO"] },
  { prefix: "/legal", roles: ["LEGAL_ADVISOR"] },
];

export function isRoleAllowed(pathname: string, role: Role): boolean {
  const normalizedPath = pathname.toLowerCase();
  
  const match = ROLE_ACCESS.find((r) =>
    normalizedPath.startsWith(r.prefix.toLowerCase())
  );
  
  if (!match) return false; // Default-deny unlisted routes that reach role checks
  if (match.roles === "ALL") return true;
  return match.roles.includes(role);
}

export function isProtectedRoute(pathname: string): boolean {
  const normalizedPath = pathname.toLowerCase();
  
  return ROLE_ACCESS.some((r) =>
    normalizedPath.startsWith(r.prefix.toLowerCase())
  );
}