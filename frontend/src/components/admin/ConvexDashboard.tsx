"use client";
import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Workspace from "@/components/admin/Workspace";
import { Message } from "@/components/shared/FormFields";
import { rentalTerms, pendingRentalDetails } from "@/config/rental-policy";
import { siteConfig } from "@/config/site";
import { api } from "../../../convex/_generated/api";

const modules = [
  { title: "Payments", detail: "Till payments and finance verification" },
  { title: "Privacy requests", detail: "Data access, corrections and document retention" },
];
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
    <section className="rounded-2xl border border-orange-200 bg-orange-50 p-6"><h2 className="font-bold text-[#0B1C4D]">Your admin account is ready</h2><p className="mt-2 text-sm text-slate-700">Review booking requests, complete in-person customer verification, approve available cars and record return outcomes. Additional operational tools are being prepared.</p></section>
    <Link href="/dashboard/bookings" className="inline-block rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Review booking requests</Link>
    <div className="flex flex-wrap gap-4"><Link href="/dashboard/cars" className="rounded-xl border bg-white px-5 py-3 font-bold">Add cars, photos &amp; rates</Link><Link href="/dashboard/fleet" className="rounded-xl border bg-white px-5 py-3 font-bold">Fleet compliance and maintenance</Link></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{modules.map(module => <section key={module.title} className="rounded-2xl border bg-white p-6"><span className="text-xs font-semibold text-slate-500">Setup pending</span><h2 className="mt-2 text-lg font-bold text-[#0B1C4D]">{module.title}</h2><p className="mt-2 text-sm text-slate-600">{module.detail}</p></section>)}</div>
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Confirmed rental policies</h2><p className="text-sm text-slate-500">Client update: 27 October 2026</p><ul className="list-disc space-y-3 pl-5 text-sm">{Object.entries(rentalTerms).map(([key, value]) => <li key={key}>{value}</li>)}</ul><h3 className="font-bold">Details still needed</h3><ul className="list-disc space-y-2 pl-5 text-sm">{pendingRentalDetails.map(item => <li key={item}>{item}</li>)}</ul><p className="text-sm text-slate-600">These decisions are recorded for operations. Payment verification, final vehicle release, automated no-show release, deposit settlement, refunds and tracker alerts still need implementation in Convex. Identification is currently checked in person; online document upload is closed. The current booking form submits requests and collects no payment or deposit.</p></section>
    <section className="rounded-2xl border bg-white p-6"><h2 className="font-bold">Business contact</h2><p className="mt-2">{siteConfig.email}</p><p>{siteConfig.phone}</p></section>
  </Workspace>;
}
