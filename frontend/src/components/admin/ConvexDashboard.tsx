"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Workspace from "@/components/admin/Workspace";
import { Message } from "@/components/shared/FormFields";
import { rentalTerms } from "@/config/rental-policy";
import { siteConfig } from "@/config/site";
import { api } from "../../../convex/_generated/api";

export default function ConvexDashboard() {
  const overview = useQuery(api.accounts.adminOverview);
  const { signOut } = useAuthActions(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  if (!overview) return <main className="p-10 text-center">Loading your admin dashboard…</main>;
  async function logout() {
    setBusy(true); setMessage("");
    try { await signOut(); localStorage.removeItem("movara_admin_token"); router.replace("/movara-access"); router.refresh(); }
    catch { setMessage("Could not sign out. Please retry."); }
    finally { setBusy(false); }
  }
  return <Workspace title="Movara admin dashboard" session={{ access: overview, availablePaths: overview.availablePaths, onSignOut: () => void logout(), signingOut: busy }}>
    <Message message={message} /><h1 className="text-2xl font-bold text-[#0B1C4D]">Welcome to Movara</h1>
    <section className="rounded-2xl border bg-white p-6"><p className="text-sm text-slate-500">Signed in as</p><p className="mt-1 break-all text-lg font-bold">{overview.email}</p><p className="mt-2 text-sm">Access: <strong>{overview.owner ? "Owner / administrator" : overview.roles.map(role => role.replaceAll("_", " ")).join(", ")}</strong></p></section>
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6"><h2 className="font-bold text-[#0B1C4D]">Rental operations</h2><p className="mt-2 text-sm text-slate-700">Review booking requests, complete in-person customer verification, approve available cars and record return outcomes.</p></section>
    <Link href="/dashboard/bookings" className="inline-block rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Review booking requests</Link>
    <div className="flex flex-wrap gap-4"><Link href="/dashboard/cars" className="rounded-xl border bg-white px-5 py-3 font-bold">Add cars, photos &amp; rates</Link><Link href="/dashboard/fleet" className="rounded-xl border bg-white px-5 py-3 font-bold">Fleet compliance and maintenance</Link></div>
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Confirmed rental policies</h2><ul className="list-disc space-y-3 pl-5 text-sm">{Object.entries(rentalTerms).map(([key, value]) => <li key={key}>{value}</li>)}</ul></section>
    <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">Business contact</h2><p className="mt-2">{siteConfig.email}</p><p>{siteConfig.phone}</p></section>
  </Workspace>;
}
