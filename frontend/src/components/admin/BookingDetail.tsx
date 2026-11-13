"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import Workspace from "./Workspace";
import BookingChecks from "./BookingChecks";
import { useAdminWorkspace } from "./useAdminWorkspace";
export default function BookingDetail({ bookingId }: { bookingId: Id<"movaraBookingRequests"> }) {
  const admin = useAdminWorkspace();
  const data = useQuery(api.customerCare.adminDetail, { bookingId });
  if (!admin.session || !data) return <main className="p-10">Loading booking…</main>;
  return <Workspace title="Booking record" session={admin.session}><Link href="/dashboard/bookings" className="font-semibold text-orange-700 underline">← Back to bookings</Link><section className="space-y-3 rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">{data.booking.vehiclePreference}</h1><p className="text-sm font-semibold">{data.booking.status.replaceAll("_", " ")}</p><p>{data.booking.pickupDate} → {data.booking.returnDate} · {data.booking.pickupLocation}</p>{data.booking.customerName && <p className="font-semibold">{data.booking.customerName}</p>}<p>Referral source: {data.booking.referralSource || "Not provided"}</p><p>Customer contact: {data.booking.phone}</p><p className="break-all font-mono text-xs text-slate-500">Reference: {data.booking._id}</p><BookingChecks bookingId={bookingId} initiallyOpen /></section></Workspace>;
}
