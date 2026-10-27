"use client";
import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import BookingChecks from "@/components/admin/BookingChecks";
import Workspace from "@/components/admin/Workspace";
import { Message, buttonStyle } from "@/components/shared/FormFields";

const labels = { requested: "Request received", in_review: "Being reviewed", cancelled: "Cancelled", approved: "Approved / reserved", overdue: "Vehicle not returned", returned: "Returned" };
export default function BookingRequests() {
  const overview = useQuery(api.accounts.adminOverview);
  const rows = useQuery(api.bookingRequests.staffList);
  const review = useMutation(api.bookingRequests.review);
  const { signOut } = useAuthActions(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  if (!overview) return <main className="p-10">Loading booking requests…</main>;
  const canReview = overview.roles.some(role => ["owner", "admin", "front_desk"].includes(role));
  return <Workspace title="Booking requests" session={{ access: overview, availablePaths: overview.availablePaths, signingOut: busy, onSignOut: () => void run(async () => { await signOut(); router.replace("/movara-access"); router.refresh(); }) }}><Message message={message} /><h1 className="text-2xl font-bold text-[#0B1C4D]">Customer booking requests</h1><p>Review in-person identity checks and customer history before approving. Approval reserves the vehicle dates; manual contract signing and payment verification are still required before release.</p>
    {rows === undefined ? <p>Loading requests…</p> : !rows.length ? <p>No booking requests yet.</p> : rows.map(row => <section key={row._id} className="space-y-3 rounded-2xl border bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-xl font-bold">{row.vehiclePreference}</h2><span className="font-semibold text-orange-700">{labels[row.status]}</span></div><p>{row.email}</p><div className="flex flex-wrap gap-4"><a className="underline" href={`tel:${row.phone}`}>{row.phone}</a><a className="underline" href={`https://wa.me/${row.phone.slice(1)}`} target="_blank" rel="noopener noreferrer">Open WhatsApp</a></div><p>{row.pickupDate} → {row.returnDate} · {row.rentalDays} days</p><p>Pickup: {row.pickupLocation}</p>{row.estimatedRentalKes !== undefined && <p>Recorded rental estimate: KES {row.estimatedRentalKes.toLocaleString()} · KES {row.dailyRateKes?.toLocaleString()} / day. Final terms require confirmation.</p>}<p className="break-all font-mono text-xs">Reference: {row._id}</p>{canReview && ["requested", "in_review"].includes(row.status) && <div className="flex flex-wrap gap-3">{row.status === "requested" && <button disabled={busy} className={buttonStyle} onClick={() => void run(async () => { await review({ id: row._id, status: "in_review" }); setMessage("Request marked as being reviewed. The customer can see this update."); })}>Start review</button>}<button disabled={busy} className="rounded-xl border px-4 py-2 font-semibold" onClick={() => void run(async () => { await review({ id: row._id, status: "cancelled" }); setMessage("Request cancelled."); })}>Cancel request</button></div>}<BookingChecks bookingId={row._id} /></section>)}
  </Workspace>;
}
