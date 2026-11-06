"use client";
import { bookingWhatsAppUrl } from "@/lib/booking-whatsapp";
import CustomerData from "@/components/privacy/CustomerData";
import SecondaryContact from "@/components/shared/SecondaryContact";
import { Suspense, useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { normalisePhone } from "../../../../convex/lib/identity";
import { bookingDates } from "../../../../convex/lib/booking_input";
import BookingCard from "@/components/customer/BookingCard";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import { rentalTerms } from "@/config/rental-policy";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";

export default function CustomerBookings() { return <Suspense fallback={<main className="p-10">Opening booking dashboard…</main>}><BookingWorkspace /></Suspense>; }
function BookingWorkspace() {
  const searchParams = useSearchParams();
  const account = useQuery(api.accounts.current);
  const rows = useQuery(api.bookingRequests.mine, account && !account.staff ? {} : "skip");
  const vehicles = useQuery(api.vehicles.publicList, {});
  const create = useMutation(api.bookingRequests.create); const cancel = useMutation(api.bookingRequests.cancel); const savePhone = useMutation(api.accounts.savePhone);
  const { signOut } = useAuthActions(); const router = useRouter();
  const [nameOverride, setName] = useState<string | null>(null);
  const customerName = nameOverride ?? account?.name ?? "";
  const [savedBooking, setSavedBooking] = useState<{ reference: string; url: string } | null>(null);
  const [bookingFeedback, setBookingFeedback] = useState("");
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
  return <main className="mx-auto max-w-5xl space-y-8 px-4 pt-8 pb-28">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><Link href="/" className="inline-flex items-center gap-2 font-semibold text-orange-700 underline underline-offset-4"><span aria-hidden="true">←</span> Back to website</Link><h1 className="mt-2 text-3xl font-bold text-[#0B1C4D]">Your booking dashboard</h1><p className="mt-2 break-all text-sm text-slate-600">{account.email}</p></div><button disabled={actionBusy} className="underline" onClick={() => void run(async () => { await signOut(); router.replace("/sign-in"); })}>Sign out</button></div>
    <Message message={message} />
    <section className="space-y-4" aria-labelledby="active-bookings"><div className="flex flex-wrap items-center justify-between gap-3"><h2 id="active-bookings" className="text-2xl font-bold text-[#0B1C4D]">Your active bookings</h2><a href="#request-booking" className="font-semibold text-orange-700 underline">Request another vehicle</a></div>{rows === undefined ? <p>Loading your bookings…</p> : rows.filter(row => !["returned", "cancelled"].includes(row.status)).length === 0 ? <div className="rounded-2xl border bg-white p-6"><p>You have no active bookings. Choose a vehicle and dates below to get started.</p></div> : rows.filter(row => !["returned", "cancelled"].includes(row.status)).map(row => <BookingCard key={row._id} booking={row} busy={actionBusy} onCancel={() => { if (actionBusy || !window.confirm("Cancel this booking request?")) return; void run(async () => { await cancel({ id: row._id }); setMessage("Booking request cancelled."); }); }} />)}</section>
    <section className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/50 p-6"><h2 className="text-xl font-bold text-[#0B1C4D]">Prepare for pickup</h2><ul className="list-disc space-y-2 pl-5 text-sm text-slate-700"><li>Bring your original ID or passport and driving licence for in-person checks.</li><li>Have your guarantor’s and next-of-kin’s names and contact numbers ready, with their permission.</li><li>Self-drive drivers must be at least 22 and have held a licence for at least two years.</li><li>Review and sign the paper rental contract with Movara at handover.</li><li>Pay only after clearance. Movara must verify payment before releasing the vehicle.</li></ul><p className="text-sm">Need help arranging pickup? <a href="tel:+254716741039" className="font-semibold underline">Call 0716 741 039</a><span> / </span><SecondaryContact />.</p></section>
    <form id="request-booking" className="scroll-mt-6 space-y-4 rounded-2xl border bg-white p-6" onSubmit={async event => {
      event.preventDefault();
      if (bookingSubmitPending.current) return;
      bookingSubmitPending.current = true; setBookingSubmitting(true); setMessage(""); setBookingFeedback("");
      try {
        if (!chosen) throw new Error("Choose an available vehicle.");
        const internationalPhone = normalisePhone(phone); bookingDates(pickup, returned);
        requestKey.current ??= crypto.randomUUID();
        const reference = await create({ customerName, requestKey: requestKey.current, vehicleId: vehicle as Id<"movaraVehicles">, pickupDate: pickup, returnDate: returned, pickupLocation: location, phone: internationalPhone });
        const url = bookingWhatsAppUrl({ reference, name: customerName, email: account.email, phone: internationalPhone, vehicle: chosen.name, pickupDate: pickup, returnDate: returned, pickupLocation: location });
        setSavedBooking({ reference, url });
        requestKey.current = null; setVehicle(""); setPickup(""); setReturned("");
        setPhone(current => current === null || current === phone ? internationalPhone : current);
        setBookingFeedback("Your booking request is saved. Opening WhatsApp—tap Send to notify Movara.");
        try { window.location.assign(url); } catch { setBookingFeedback("Your booking request is saved. Use Open WhatsApp below and tap Send to notify Movara."); }
      } catch (error) { const raw = error instanceof Error ? error.message : "Please retry."; setBookingFeedback(raw.match(/Uncaught Error: ([^\n]+)/)?.[1] ?? raw); }
      finally { bookingSubmitPending.current = false; setBookingSubmitting(false); }
    }}><h2 className="text-xl font-bold">Request a booking</h2><Message message={bookingFeedback} />{savedBooking && <div role="status" className="space-y-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm"><p>Saved booking reference: <span className="break-all font-mono">{savedBooking.reference}</span></p><a href={savedBooking.url} target="_blank" rel="noopener noreferrer" className="inline-block font-bold text-green-800 underline">Open WhatsApp and send booking details</a><p>Your request is already in Movara’s admin dashboard, even if you do not send the WhatsApp message.</p></div>}<p className="text-sm text-slate-600">Tell us the vehicle you need and your dates. Our team will confirm availability and the flat daily or agreed market rate. Submitting a request does not reserve a vehicle or confirm a rental.</p>
      <fieldset disabled={bookingSubmitting} className="space-y-4"><Field required label="Full name" value={customerName} onChange={setName} /><Field required type="tel" label="Phone / WhatsApp number with country code" value={phone} onChange={setPhone} /><label className="block text-sm font-semibold">Vehicle<select required value={vehicle} onChange={event => { setVehicle(event.target.value); requestKey.current = null; }} className="mt-2 w-full rounded-xl border p-3"><option value="">{vehicles === undefined ? "Loading vehicles…" : "Choose a vehicle"}</option>{vehicles?.map(car => <option key={car._id} value={car._id}>{car.name} · {car.pricePerDay === null ? "Price on request" : `KES ${car.pricePerDay.toLocaleString()} / day`}</option>)}</select></label>
      {vehicles?.length === 0 && <p>No vehicles are currently published. Please contact Movara for assistance.</p>}
      {chosen && chosen.pricePerDay !== null && <p className="text-sm text-slate-600">Listed daily rate: KES {chosen.pricePerDay.toLocaleString()}. Availability is checked for your dates when you submit. Final rental terms are confirmed by our team; rental payment and the security deposit are collected only after all checks and handover approvals are complete.</p>}
      <div className="grid gap-4 sm:grid-cols-2"><Field required type="date" label="Pickup date" value={pickup} onChange={setPickup} /><Field required type="date" label="Return date" value={returned} onChange={setReturned} /></div>
      <Field required label="Pickup location in Kenya" value={location} onChange={setLocation} />
      <p className="text-sm text-slate-600">Self-drive drivers must be 22+ and have held a licence for at least two years. Document checks, guarantor/next-of-kin details and a manually signed contract are required before handover. Cross-border travel is unavailable.</p><p className="text-xs text-slate-500">Do not enter ID/licence numbers or payment codes in these fields. No payment is requested at this stage.</p><button type="submit" disabled={bookingSubmitting} aria-busy={bookingSubmitting} className={buttonStyle}>{bookingSubmitting ? "Submitting…" : "Submit request & open WhatsApp"}</button></fieldset>
    </form>
    <section className="space-y-3 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Before you confirm a rental</h2><p className="text-sm text-slate-600">{rentalTerms.payment}</p><p className="text-sm text-slate-600">{rentalTerms.deposit}</p><p className="text-sm text-slate-600">{rentalTerms.contract}</p><p className="text-sm text-slate-600">{rentalTerms.failedHandover}</p><p className="text-sm text-slate-600">{rentalTerms.noShow}</p></section>
    <section className="space-y-4"><h2 className="text-2xl font-bold text-[#0B1C4D]">Past bookings</h2>{rows === undefined ? <p>Loading…</p> : rows.filter(row => ["returned", "cancelled"].includes(row.status)).length === 0 ? <p className="text-sm text-slate-600">Your returned and cancelled bookings will appear here.</p> : rows.filter(row => ["returned", "cancelled"].includes(row.status)).map(row => <BookingCard key={row._id} booking={row} busy={actionBusy} onCancel={() => {}} />)}</section>
    <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Your contact number</h2><Field type="tel" label="Phone / WhatsApp number with country code" value={phone} onChange={setPhone} /><p className="text-sm text-slate-600">Use + and your country code, for example +44 7700 900123 or +1 202 555 0123. Kenyan 07… and 01… numbers are also accepted. Saving a number does not verify ownership.</p><button disabled={actionBusy || phoneUnchanged || !phone.trim()} className={buttonStyle} onClick={() => {
      if (actionBusy || phoneUnchanged || contactSavePending.current) return;
      contactSavePending.current = true;
      const submittedPhone = phone;
      void run(async () => {
        try { const result = await savePhone({ phone: normalisePhone(submittedPhone) }); setPhone(current => current === null || current === submittedPhone ? result.phone : current); setMessage("Contact number saved."); }
        finally { contactSavePending.current = false; }
      });
    }}>{phoneUnchanged ? "Saved" : "Save contact number"}</button></section>
    <p className="text-sm text-slate-600">Need assistance? <Link href="/contact" className="font-semibold text-orange-700 underline">Contact Movara</Link> or WhatsApp/call <a href="tel:+254716741039" className="underline">0716 741 039</a><span> / </span><SecondaryContact />.</p>
    <CustomerData />
    <WhatsAppButton />
  </main>;
}
