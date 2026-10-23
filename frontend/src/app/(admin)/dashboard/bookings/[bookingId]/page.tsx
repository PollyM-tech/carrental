"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import type { Booking } from "@/lib/types";
import { Message } from "@/components/shared/FormFields";
type Detail = Booking & { history?: { previous: string; current: string; created_at: string; reason: string }[] };
export default function BookingDetail() {
  const { bookingId } = useParams<{ bookingId: string }>(); const [booking, setBooking] = useState<Detail | null>(null); const [message, setMessage] = useState("");
  useEffect(() => { void workflow<Detail>(`rentals/bookings/detail/?bookingId=${bookingId}`, { staff: true }).then(setBooking).catch(e => setMessage(e.message)); }, [bookingId]);
  return <Workspace title="Booking details"><Link href="/dashboard/bookings" className="underline">Back to bookings</Link><Message message={message} />{booking && <section className="space-y-4 rounded-2xl border bg-white p-6"><h1 className="text-2xl font-bold">{booking.carName}</h1><p>{booking.customerName} · {booking.customerEmail} · {booking.customerPhone}</p><p>{booking.pickupDate} → {booking.returnDate}</p><p className="font-bold">{booking.status.replaceAll("_", " ")}</p><p>KSh {booking.totalAmount?.toLocaleString() ?? "Pending"}</p><Link className="inline-block rounded-xl bg-orange-600 px-5 py-3 text-white" href="/dashboard/kyc">Open document review</Link><h2 className="font-bold">Status history</h2>{booking.history?.map((entry, i) => <p key={i} className="text-sm">{entry.previous.replaceAll("_", " ")} → {entry.current.replaceAll("_", " ")} · {new Date(entry.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} {entry.reason}</p>)}<Message message="Finance verifies manual M-Pesa receipts before confirming payment. Vehicle release remains disabled until the handover module is ready." /></section>}</Workspace>;
}
