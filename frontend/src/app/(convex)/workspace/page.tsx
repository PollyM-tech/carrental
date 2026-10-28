"use client";
import { Suspense, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { normalisePhone } from "../../../../convex/lib/identity";
import { bookingDates } from "../../../../convex/lib/booking_input";
import InPersonVerification from "@/components/auth/InPersonVerification";
import { rentalTerms } from "@/config/rental-policy";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";

const statusLabels = { requested: "Request received", in_review: "Being reviewed", cancelled: "Cancelled", approved: "Approved — complete handover before payment/release", overdue: "Return outstanding — contact Movara", returned: "Returned" };
export default function CustomerBookings() { return <Suspense fallback={<main className="p-10">Opening booking dashboard…</main>}><BookingWorkspace /></Suspense>; }
function BookingWorkspace() {
  const searchParams = useSearchParams();
  const account = useQuery(api.accounts.current);
  const rows = useQuery(api.bookingRequests.mine, account && !account.staff ? {} : "skip");
  const vehicles = useQuery(api.vehicles.publicList, {});
  const create = useMutation(api.bookingRequests.create); const cancel = useMutation(api.bookingRequests.cancel); const savePhone = useMutation(api.accounts.savePhone);
  const { signOut } = useAuthActions(); const router = useRouter();
  const [phoneOverride, setPhone] = useState<string | null>(null);
  const [vehicleOverride, setVehicle] = useState<string | null>(null);
  const vehicle = vehicleOverride ?? searchParams.get("car") ?? ""; const [pickup, setPickup] = useState(""); const [returned, setReturned] = useState(""); const [location, setLocation] = useState("Nairobi");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const bookingSubmitPending = useRef(false);
  const requestKey = useRef<string | null>(null);
  const actionBusy = busy || bookingSubmitting;
  const chosen = vehicles?.find(car => car._id === vehicle);
  const phone = phoneOverride ?? account?.phone ?? "";
  const contactSavePending = useRef(false);
  let phoneUnchanged = phone === account?.phone;
  try { phoneUnchanged = normalisePhone(phone) === account?.phone; } catch { /* Show validation feedback if saving invalid input is attempted. */ }
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  if (account === undefined) return <main className="p-10 text-center">Opening your booking dashboard…</main>;
  if (!account) return <main className="p-10"><Link href="/sign-in" className="underline">Sign in to view your bookings</Link></main>;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="inline-flex items-center gap-2 font-semibold text-orange-700 underline underline-offset-4"><span aria-hidden="true">←</span> Back to website</Link><h1 className="mt-2 text-3xl font-bold text-[#0B1C4D]">Your booking dashboard</h1><p className="mt-2 break-all text-sm text-slate-600">{account.email}</p></div><button disabled={actionBusy} className="underline" onClick={() => void run(async () => { await signOut(); router.replace("/sign-in"); })}>Sign out</button></div>
    <Message message={message} />
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Your contact number</h2><Field type="tel" label="Phone / WhatsApp number with country code" value={phone} onChange={setPhone} /><p className="text-sm text-slate-600">Use + and your country code, for example +44 7700 900123 or +1 202 555 0123. Kenyan 07… and 01… numbers are also accepted. Saving a number does not verify ownership.</p><button disabled={actionBusy || phoneUnchanged || !phone.trim()} className={buttonStyle} onClick={() => {
      if (actionBusy || phoneUnchanged || contactSavePending.current) return;
      contactSavePending.current = true;
      const submittedPhone = phone;
      void run(async () => {
        try { const result = await savePhone({ phone: normalisePhone(submittedPhone) }); setPhone(current => current === null || current === submittedPhone ? result.phone : current); setMessage("Contact number saved."); }
        finally { contactSavePending.current = false; }
      });
    }}>{phoneUnchanged ? "Saved" : "Save contact number"}</button></section>
    <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={async event => {
      event.preventDefault();
      if (bookingSubmitPending.current) return;
      bookingSubmitPending.current = true; setBookingSubmitting(true); setMessage("");
      try {
        if (!chosen) throw new Error("Choose an available vehicle.");
        const internationalPhone = normalisePhone(phone); bookingDates(pickup, returned);
        requestKey.current ??= crypto.randomUUID();
        await create({ requestKey: requestKey.current, vehicleId: vehicle as Id<"movaraVehicles">, pickupDate: pickup, returnDate: returned, pickupLocation: location, phone: internationalPhone });
        requestKey.current = null; setVehicle(""); setPickup(""); setReturned("");
        setPhone(current => current === null || current === phone ? internationalPhone : current);
        setMessage("Booking request received. Movara will contact you to confirm vehicle availability, pricing and the next steps.");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Please retry."); }
      finally { bookingSubmitPending.current = false; setBookingSubmitting(false); }
    }}><h2 className="text-xl font-bold">Request a booking</h2><p className="text-sm text-slate-600">Tell us the vehicle you need and your dates. Our team will confirm availability and the flat daily or agreed market rate. Submitting a request does not reserve a vehicle or confirm a rental.</p>
      <fieldset disabled={bookingSubmitting} className="space-y-4"><label className="block text-sm font-semibold">Vehicle<select required value={vehicle} onChange={event => { setVehicle(event.target.value); requestKey.current = null; }} className="mt-2 w-full rounded-xl border p-3"><option value="">{vehicles === undefined ? "Loading vehicles…" : "Choose a vehicle"}</option>{vehicles?.map(car => <option key={car._id} value={car._id}>{car.name} · KES {car.pricePerDay.toLocaleString()} / day</option>)}</select></label>
      {vehicles?.length === 0 && <p>No vehicles are currently published. Please contact Movara for assistance.</p>}
      {chosen && <p className="text-sm text-slate-600">Listed daily rate: KES {chosen.pricePerDay.toLocaleString()}. Availability is checked for your dates when you submit. Final rental terms are confirmed by our team; rental payment and the security deposit are collected only after all checks and handover approvals are complete.</p>}
      <div className="grid gap-4 sm:grid-cols-2"><Field required type="date" label="Pickup date" value={pickup} onChange={setPickup} /><Field required type="date" label="Return date" value={returned} onChange={setReturned} /></div>
      <Field required label="Pickup location in Kenya" value={location} onChange={setLocation} />
      <p className="text-sm text-slate-600">Self-drive drivers must be 22+ and have held a licence for at least two years. Document checks, guarantor/next-of-kin details and a manually signed contract are required before handover. Cross-border travel is unavailable.</p><p className="text-xs text-slate-500">Do not enter ID/licence numbers or payment codes in these fields. No payment is requested at this stage.</p><button type="submit" disabled={bookingSubmitting} aria-busy={bookingSubmitting} className={buttonStyle}>{bookingSubmitting ? "Submitting…" : "Submit booking request"}</button></fieldset>
    </form>
    <section className="space-y-3 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Before you confirm a rental</h2><p className="text-sm text-slate-600">{rentalTerms.payment}</p><p className="text-sm text-slate-600">{rentalTerms.deposit}</p><p className="text-sm text-slate-600">{rentalTerms.contract}</p><p className="text-sm text-slate-600">{rentalTerms.failedHandover}</p><p className="text-sm text-slate-600">{rentalTerms.noShow}</p></section>
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Your booking requests</h2>{rows === undefined ? <p>Loading your requests…</p> : rows.length === 0 ? <p>No booking requests yet. Submit your preferred vehicle and dates above.</p> : rows.map(row => <article key={row._id} className="space-y-2 rounded-xl border p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{row.vehiclePreference}</h3><span className="text-sm font-semibold text-orange-700">{statusLabels[row.status]}</span></div><p className="text-sm">{row.pickupDate} → {row.returnDate} · {row.rentalDays} days</p><p className="text-sm">Pickup: {row.pickupLocation}</p>{row.estimatedRentalKes !== undefined && <p className="text-sm">Rental estimate: KES {row.estimatedRentalKes.toLocaleString()} · KES {row.dailyRateKes?.toLocaleString()} / day. Subject to confirmed terms.</p>}<p className="text-sm">Contact: {row.phone}</p><p className="font-mono text-xs text-slate-500">Reference: {row._id}</p>{["requested", "in_review"].includes(row.status) && <button disabled={actionBusy} className="text-sm font-semibold underline" onClick={() => void run(async () => { await cancel({ id: row._id }); setMessage("Booking request cancelled."); })}>Cancel this request</button>}<InPersonVerification bookingId={row._id} editable={["requested", "in_review"].includes(row.status)} /></article>)}</section>
    <p className="text-sm text-slate-600">Need assistance? <Link href="/contact" className="font-semibold text-orange-700 underline">Contact Movara</Link> or WhatsApp/call <a href="tel:+254716741039" className="underline">0716 741 039</a>.</p>
  </main>;
}
