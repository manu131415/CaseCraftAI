import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Role } from "@/lib/auth";

// This is a Server Component. middleware.ts already verified the JWT and
// role before this ever renders, and forwards the identity via the
// x-user-role header. Visiting the bare /dashboard always renders THIS
// file — it doesn't know about the io/legal/sho subfolders on its own,
// so it has to actively send each role to its own page.
const ROLE_HOME: Record<Role, string> = {
  IO: "/dashboard/io",
  SHO: "/dashboard/sho",
  LEGAL_ADVISOR: "/dashboard/legal",
};

export default async function DashboardPage() {
  const role = (await headers()).get("x-user-role") as Role | null;

  if (role && ROLE_HOME[role]) {
    redirect(ROLE_HOME[role]);
  }

  // Fallback — shouldn't normally be reached since middleware guarantees
  // a valid role on any request that gets this far.
  redirect("/login");
}