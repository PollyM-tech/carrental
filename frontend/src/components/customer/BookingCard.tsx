"use client";
import Image from "next/image";
import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";
import InPersonVerification from "@/components/auth/InPersonVerification";

type Booking = FunctionReturnType<typeof api.bookingRequests.mine>[number];
const labels = { requested: "Request received", in_review: "Under review", approved: "Approved", overdue: "Return outstanding", returned: "Vehicle returned", cancelled: "Cancelled" };
const next = {
  requested: "Our team will confirm availability and pricing. You can prepare your identification and contact details below.",
  in_review: "Movara is reviewing your request. Arrange your in-person checks and bring the documents listed in the pickup checklist.",
  approved: "Your dates are reserved. Contact Movara to confirm pickup arrangements. Pay only after all checks and the signed paper contract are complete and Movara confirms clearance. Payment must be verified before vehicle release.",
  overdue: "Contact Movara immediately to arrange the vehicle’s return.",
  returned: "Your vehicle return has been recorded. Contact Movara for any outstanding settlement or questions.",
  cancelled: "This request is closed. You can request another vehicle below.",
};
const stages = ["Request received", "Under review", "Approved", "Ready for handover", "Vehicle returned"];
export default function BookingCard({ booking, busy, onCancel }: { booking: Booking; busy: boolean; onCancel: () => void }) {
  const pending = ["requested", "in_review"].includes(booking.status);
  const [stage, completed] = booking.status === "returned" ? [4, true] : booking.status === "approved" || booking.status === "overdue" ? [booking.handoverReady ? 3 : 2, false] : booking.status === "in_review" ? [1, false] : [0, false];
  const whatsapp = `https://wa.me/254716741039?text=${encodeURIComponent(`Hello Movara, ${pending ? "I would like to request a change to" : "I need help with"} booking ${booking._id} (${booking.vehiclePreference}, ${booking.pickupDate} to ${booking.returnDate}).`)}`;
  return <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="grid gap-5 p-5 sm:grid-cols-[160px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">{booking.displayImageUrl ? <Image src={booking.displayImageUrl} alt={booking.vehiclePreference} fill sizes="(max-width: 640px) 100vw, 160px" className="object-cover" unoptimized /> : <div className="flex h-full items-center justify-center p-4 text-center font-semibold text-slate-500">{booking.vehiclePreference}</div>}</div>
      <div className="space-y-3"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-xl font-bold text-[#0B1C4D]">{booking.vehiclePreference}</h3><span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-800">{booking.refundRecorded ? "Refund recorded" : booking.status === "approved" && booking.vehicleReleased ? "Vehicle collected" : booking.status === "approved" && booking.handoverReady ? "Ready for handover" : labels[booking.status]}</span></div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-slate-500">Pickup date</dt><dd className="font-semibold">{booking.pickupDate}</dd></div><div><dt className="text-slate-500">Return date</dt><dd className="font-semibold">{booking.returnDate}</dd></div><div><dt className="text-slate-500">Pickup location</dt><dd>{booking.pickupLocation}</dd></div><div><dt className="text-slate-500">{booking.agreedRentalKes !== undefined ? "Agreed rental" : "Rental estimate"} · {booking.rentalDays} days</dt><dd>{booking.agreedRentalKes !== undefined ? `KES ${booking.agreedRentalKes.toLocaleString()}` : booking.estimatedRentalKes !== undefined ? `KES ${booking.estimatedRentalKes.toLocaleString()}` : "Price on request"}</dd></div></dl>
        <p className="text-xs text-slate-500">Final price and deposit are confirmed by Movara in your rental terms.</p><p className="break-all font-mono text-xs text-slate-500">Reference: {booking._id}</p>
      </div>
    </div>
    <div className="space-y-4 border-t p-5">
      {booking.status !== "cancelled" && <ol aria-label="Booking progress" className="grid gap-2 text-xs sm:grid-cols-5">{stages.map((label, index) => <li key={label} aria-current={index === stage ? "step" : undefined} className={`rounded-lg border p-3 ${index <= stage ? "border-orange-200 bg-orange-50 text-orange-900" : "border-slate-200 text-slate-500"}`}><span className="mb-1 block font-bold">{index < stage || completed ? "✓" : index + 1}</span>{label}{index === 3 && !completed && !booking.handoverReady && <span className="mt-1 block">Awaiting confirmation</span>}</li>)}</ol>}
      <div className="rounded-xl bg-slate-50 p-4"><h4 className="font-semibold">{["returned", "cancelled"].includes(booking.status) ? "Booking update" : "Your next step"}</h4><p className="mt-1 text-sm leading-relaxed text-slate-600">{booking.refundRecorded ? "A refund has been recorded. Contact Movara about cancellation or a new booking request." : booking.status === "approved" && booking.vehicleReleased ? "Vehicle collection has been recorded. Follow the signed contract and return the car by the agreed date." : booking.status === "approved" && booking.handoverReady ? "Your signed contract and payment verification are recorded. Contact Movara to collect your vehicle at the agreed time." : next[booking.status]}</p></div>
      <div className="flex flex-wrap gap-4 text-sm font-semibold"><a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-green-800 underline">{pending ? "Request a change on WhatsApp" : "Contact Movara about this booking"}</a><a href="tel:+254716741039" className="underline">Call Movara</a>{pending && <button disabled={busy} onClick={onCancel} className="text-red-700 underline disabled:opacity-50">Cancel this request</button>}</div>
      {booking.status === "approved" && <p className="text-xs text-slate-500">To change or cancel an approved booking, contact Movara.</p>}
      {!["returned", "cancelled"].includes(booking.status) && <InPersonVerification bookingId={booking._id} editable={pending} />}
    </div>
  </article>;
}
