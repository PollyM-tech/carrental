"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Message } from "@/components/shared/FormFields";
type Access = { owner: boolean; staff: boolean; roles: string[] };
const actions = [
  { href: "/dashboard/payments", title: "Payments", detail: "M-Pesa Send Money receipts and finance verification", roles: ["finance"] },
  { href: "/dashboard/payment-settings", title: "Payment policy", detail: "Record the approved security deposit decision", roles: [] },
  { href: "/dashboard/cars", title: "Manage vehicles", detail: "Vehicle details, mileage and catalogue photos", roles: ["fleet_manager"] },
  { href: "/dashboard/fleet", title: "Fleet compliance", detail: "Insurance, inspection and service blocks", roles: ["fleet_manager"] },
  { href: "/dashboard/bookings", title: "Bookings", detail: "Booking stages and status history", roles: ["front_desk", "finance", "kyc_reviewer"] },
  { href: "/dashboard/kyc", title: "Document review", detail: "Review, request corrections and approve conditionally", roles: ["kyc_reviewer"] },
  { href: "/dashboard/team", title: "Staff access", detail: "Assign roles to staff accounts", roles: [] },
  { href: "/dashboard/audit", title: "Audit history", detail: "View recorded actions and changes", roles: [] },
  { href: "/dashboard/policies", title: "Approved policies", detail: "Configure decisions once the team confirms them", roles: [] },
  { href: "/dashboard/settings", title: "Business settings", detail: "Business name and contact information", roles: [] },
];
export default function Dashboard() {
  const router = useRouter(); const [access, setAccess] = useState<Access | null>(null); const [stats, setStats] = useState<Record<string, number>>({}); const [message, setMessage] = useState(""); const [notes, setNotes] = useState<{ id: number; message: string }[]>([]);
  useEffect(() => {
    if (!localStorage.getItem("movara_admin_token")) { router.replace("/admin-login"); return; }
    void Promise.all([workflow<Access>("workflow/access/", { staff: true }), workflow<Record<string, number>>("rentals/stats/", { staff: true }), workflow<typeof notes>("workflow/notifications/", { staff: true })]).then(([a, s, n]) => { setAccess(a); setStats(s); setNotes(n); }).catch(e => setMessage(e.message));
  }, [router]);
  return <Workspace title="Movara operations"><Message message={message} /><h1 className="text-2xl font-bold text-[#0B1C4D]">Welcome to Movara</h1><p>Your access: {access?.owner ? "Owner / administrator" : access?.roles.map(r => r.replaceAll("_", " ")).join(", ") || "Loading…"}</p>
    <div className="grid gap-4 sm:grid-cols-3">{[["Vehicles", stats.totalCars], ["Bookings", stats.totalBookings], ["Active rentals", stats.activeBookings]].map(([label, value]) => <div key={label} className="rounded-2xl border bg-white p-6"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value ?? "—"}</p></div>)}</div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{actions.filter(action => access?.owner || action.roles.some(role => access?.roles.includes(role))).map(action => <Link key={action.href} href={action.href} className="rounded-2xl border bg-white p-6 transition hover:border-orange-400"><h2 className="text-lg font-bold text-orange-700">{action.title}</h2><p className="mt-2 text-sm text-slate-600">{action.detail}</p></Link>)}</div>
    <Message message="Manual M-Pesa payment opens after KYC approval and deposit policy approval. Vehicle release remains disabled until physical handover checks are implemented." />
    {notes.length > 0 && <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Operational alerts</h2>{notes.map(note => <p key={note.id} className="mt-3 text-sm">{note.message}</p>)}</section>}
  </Workspace>;
}
