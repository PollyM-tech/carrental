"use client";
import { useEffect, useState } from "react";
import AssistedBooking from "@/components/admin/AssistedBooking";
import Workspace from "@/components/admin/Workspace";
import BookingsTable from "@/components/admin/BookingsTable";
import { workflow } from "@/lib/workflow";
import type { Booking } from "@/lib/types";
import { Message, inputStyle } from "@/components/shared/FormFields";
const statuses = ["draft", "kyc_submitted", "kyc_in_review", "kyc_needs_correction", "kyc_rejected", "kyc_approved", "awaiting_payment", "payment_pending_verification", "confirmed", "handover_in_progress", "handover_failed", "active", "returned", "closed", "cancelled", "expired", "no_show"];
export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]); const [filter, setFilter] = useState(""); const [search, setSearch] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { void workflow<Booking[]>("rentals/bookings/", { staff: true }).then(setBookings).catch(e => setMessage(e.message)); }, []);
  const rows = bookings.filter(b => (!filter || b.status === filter) && [b.customerName, b.carName, b.customerPhone].some(v => v?.toLowerCase().includes(search.toLowerCase())));
  return <Workspace title="Bookings"><Message message={message} /><AssistedBooking onCreated={async () => setBookings(await workflow<Booking[]>("rentals/bookings/", { staff: true }))} /><p>Booking stages follow document review, payment and physical handover. Payment confirmation and release shortcuts are disabled.</p><div className="grid gap-4 sm:grid-cols-2"><label>Search<input className={inputStyle} value={search} onChange={e => setSearch(e.target.value)} /></label><label>Status<select className={inputStyle} value={filter} onChange={e => setFilter(e.target.value)}><option value="">All statuses</option>{statuses.map(s => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select></label></div><BookingsTable bookings={rows} /></Workspace>;
}
