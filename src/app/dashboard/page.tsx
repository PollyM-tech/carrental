// src/app/dashboard/page.tsx
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["mobricarhire@gmail.com"];

export default async function DashboardPage() {
  const { user } = await withAuth({ ensureSignedIn: true });

  const email = user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    redirect("/sign-out");
  }

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <section className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Admin Dashboard
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#0A1628]">
          Welcome, {user?.firstName || user?.email || "Admin"}
        </h1>

        <p className="mt-3 text-slate-600">
          Login is working. This dashboard is restricted to approved admin
          accounts only.
        </p>
      </section>
    </main>
  );
}