import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

const ADMIN_ROLES = new Set(["platform_admin", "platform-admin", "admin"]);
const STAFF_ROLES = new Set(["staff"]);

function hasAllowedRole(role?: string, roles?: string[]) {
  const allRoles = [role, ...(roles ?? [])].filter(
    (currentRole): currentRole is string => Boolean(currentRole),
  );
  return allRoles.some((currentRole) => {
    const normalizedRole = currentRole.toLowerCase();
    return ADMIN_ROLES.has(normalizedRole) || STAFF_ROLES.has(normalizedRole);
  });
}

export default async function DashboardPage() {
  const { user, organizationId, role, roles } = await withAuth({
    ensureSignedIn: true,
  });

  const adminOrgId = process.env.WORKOS_ADMIN_ORG_ID;
  const staffOrgId = process.env.WORKOS_STAFF_ORG_ID;
  const isKnownOperationsOrg =
    Boolean(organizationId) &&
    (organizationId === adminOrgId || organizationId === staffOrgId);

  if (!isKnownOperationsOrg && !hasAllowedRole(role, roles)) {
    redirect("/unauthorized");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Admin Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#0A1628]">
          Welcome, {user.firstName || user.email}
        </h1>

        <p className="mt-3 text-slate-600">
          Your account is authorized for operations access.
        </p>
      </section>
    </main>
  );
}
