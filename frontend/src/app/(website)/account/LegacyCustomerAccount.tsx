"use client";
import { useEffect, useState } from "react";
import PrivacyControls from "@/components/shared/PrivacyControls";
import BookingPayments from "@/components/shared/BookingPayments";
import { workflow, PublicCar } from "@/lib/workflow";
import { Field, Message, buttonStyle, inputStyle } from "@/components/shared/FormFields";

type Booking = { _id: string; carName: string; status: string; pickupDate: string; returnDate: string; totalAmount: number };
type Details = { full_name: string; id_number: string; date_of_birth: string; licence_number: string; licence_class: string; licence_issued: string; licence_expiry: string; address: string; next_of_kin_name: string; next_of_kin_phone: string; destination: string; cross_border: boolean; guarantor_name: string; guarantor_phone: string; id_expiry: string };
type Progress = { booking: Booking; documents: { id: string; kind: string; created_at: string }[]; kyc: { status: string; reason: string; due_at: string | null } | null; history: { current: string; created_at: string }[] };
const emptyDetails: Details = { full_name: "", id_number: "", date_of_birth: "", licence_number: "", licence_class: "", licence_issued: "", licence_expiry: "", address: "", next_of_kin_name: "", next_of_kin_phone: "", destination: "", cross_border: false, guarantor_name: "", guarantor_phone: "", id_expiry: "" };
const labels: Record<string, string> = { full_name: "Full name on ID", id_number: "ID or passport number", date_of_birth: "Date of birth", licence_number: "Driving licence number", licence_class: "Licence class", licence_issued: "Licence issue date", licence_expiry: "Licence expiry date", address: "Residential address", next_of_kin_name: "Next-of-kin name", next_of_kin_phone: "Next-of-kin phone", destination: "Intended destination" };

export default function CustomerAccount() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);
  const [register, setRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [verified, setVerified] = useState(false);
  const [manual, setManual] = useState<{ reference: string; whatsapp_url: string; expires_at: string } | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cars, setCars] = useState<PublicCar[]>([]);
  const [carId, setCarId] = useState("");
  const [pickup, setPickup] = useState("");
  const [returned, setReturned] = useState("");
  const [progress, setProgress] = useState<Progress | null>(null);
  const [consent, setConsent] = useState(false);
  const [policy, setPolicy] = useState<{ privacy_notice_version: string; message: string }>({ privacy_notice_version: "", message: "" });
  const [notifications, setNotifications] = useState<{ id: number; message: string }[]>([]);

  async function loadAccount() {
    const [profile, rows, notes] = await Promise.all([
      workflow<{ details: Partial<Details>; phone_verified: boolean }>("workflow/profile/"),
      workflow<Booking[]>("workflow/bookings/"),
      workflow<{ id: number; message: string }[]>("workflow/notifications/"),
    ]);
    setDetails({ ...emptyDetails, ...profile.details }); setVerified(profile.phone_verified); setBookings(rows); setNotifications(notes);
  }
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [catalogue, publicPolicy] = await Promise.all([workflow<PublicCar[]>("workflow/public/cars/", { public: true }), workflow<typeof policy>("workflow/public/policy/", { public: true })]);
        if (!active) return;
        setCars(catalogue); setPolicy(publicPolicy);
        const selected = new URLSearchParams(window.location.search).get("car");
        if (selected) setCarId(selected);
        if (localStorage.getItem("movara_customer_token")) {
          await loadAccount(); if (active) setLoggedIn(true);
          const booking = new URLSearchParams(window.location.search).get("booking");
          if (booking) await openBooking(booking);
        }
      } catch (error) { if (active) setMessage(error instanceof Error ? error.message : "Could not load account."); }
      finally { if (active) setChecking(false); }
    }
    void init(); return () => { active = false; };
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); } catch (error) { setMessage(error instanceof Error ? error.message : "Please retry."); } finally { setBusy(false); }
  }
  async function openBooking(id: string) { setProgress(await workflow<Progress>(`workflow/bookings/${id}/`)); setConsent(false); }
  function signOut() { localStorage.removeItem("movara_customer_token"); setLoggedIn(false); setDetails(emptyDetails); setProgress(null); setBookings([]); }
  if (checking) return <main className="p-12 text-center">Loading your account…</main>;
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
    <div className="flex items-center justify-between"><h1 className="text-3xl font-bold text-[#0B1C4D]">Your Movara account</h1>{loggedIn && <button className="underline" onClick={signOut}>Sign out</button>}</div>
    <Message message={message} />
    {!loggedIn ? <form className="mx-auto max-w-md space-y-4 rounded-2xl border p-6" onSubmit={event => { event.preventDefault(); void run(async () => {
      if (register) await workflow("auth/register/", { public: true, method: "POST", data: { email, password, phone } });
      const result = await workflow<{ access: string }>("auth/login/", { public: true, method: "POST", data: { email, password } });
      localStorage.setItem("movara_customer_token", result.access); setLoggedIn(true); setPassword(""); await loadAccount();
    }); }}>
      <h2 className="text-xl font-bold">{register ? "Create your account" : "Customer sign in"}</h2>
      <Field label="Email" type="email" required value={email} onChange={setEmail} />
      <Field label="Password" type="password" required value={password} onChange={setPassword} />
      {register && <Field label="WhatsApp phone number" required value={phone} onChange={setPhone} />}
      <button disabled={busy} className={buttonStyle}>{register ? "Create account" : "Sign in"}</button>
      <button type="button" className="block text-sm underline" onClick={() => setRegister(!register)}>{register ? "Already registered? Sign in" : "New customer? Create an account"}</button>
    </form> : <>
      <section className="space-y-4 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">1. Verify your WhatsApp number</h2>
        <p className="text-sm">Send a verification reference to Movara on WhatsApp (0716 741 039). Staff check the sender before approving your number.</p>
        {verified ? <p className="text-green-700">Phone verified</p> : <div className="grid items-end gap-3 sm:grid-cols-3">
          <Field label="WhatsApp number, e.g. +254…" value={phone} onChange={setPhone} />
          <button disabled={busy} className={buttonStyle} onClick={() => void run(async () => { const response = await workflow<{ message: string; development_code?: string; reference?: string; whatsapp_url?: string; expires_at?: string }>("workflow/phone/request/", { method: "POST", data: { phone } }); if (response.reference && response.whatsapp_url && response.expires_at) setManual({ reference: response.reference, whatsapp_url: response.whatsapp_url, expires_at: response.expires_at }); setMessage(response.message + (response.development_code ? ` Code: ${response.development_code}` : "")); })}>Get verification reference</button>
          <button disabled={busy} className="underline" onClick={() => void run(async () => { await loadAccount(); setMessage("Phone verification status refreshed."); })}>Check approval status</button>
        </div>}
        {!verified && manual && <div className="space-y-2 rounded-xl bg-green-50 p-4"><p>Reference: <strong className="font-mono">{manual.reference}</strong></p><p className="text-sm">Expires {new Date(manual.expires_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}. Send from the number you entered above. Staff approval is required.</p><a className="inline-block font-bold text-green-800 underline" href={manual.whatsapp_url} target="_blank" rel="noopener noreferrer">Send reference on WhatsApp</a></div>}
      </section>
      <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={event => { event.preventDefault(); void run(async () => { await workflow("workflow/profile/", { method: "POST", data: details }); setMessage("Customer details saved."); }); }}>
        <h2 className="text-xl font-bold">2. Customer and driving licence details</h2>
        <div className="grid gap-4 sm:grid-cols-2">{Object.entries(labels).map(([key, label]) => <Field key={key} label={label} type={["date_of_birth", "licence_issued", "licence_expiry"].includes(key) ? "date" : "text"} required value={String(details[key as keyof Details])} onChange={value => setDetails({ ...details, [key]: value })} />)}</div>
        <Field type="date" label="ID or passport expiry (if applicable)" value={details.id_expiry} onChange={v => setDetails({ ...details, id_expiry: v })} />
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Guarantor name (all vehicles)" value={details.guarantor_name} onChange={v => setDetails({ ...details, guarantor_name: v })} /><Field label="Guarantor phone (all vehicles)" value={details.guarantor_phone} onChange={v => setDetails({ ...details, guarantor_phone: v })} /></div>
        <p className="text-sm text-slate-600">Cross-border travel is currently unavailable.</p>
        <button disabled={busy} className={buttonStyle}>Save details</button>
      </form>
      <section className="space-y-4 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">3. Choose a vehicle and dates</h2>
        <div className="grid gap-4 sm:grid-cols-3"><Field label="Pickup date" type="date" value={pickup} onChange={setPickup} /><Field label="Return date" type="date" value={returned} onChange={setReturned} /><button className={buttonStyle} disabled={busy || !pickup || !returned} onClick={() => void run(async () => { setCars(await workflow<PublicCar[]>(`workflow/public/cars/?pickupDate=${pickup}&returnDate=${returned}`, { public: true })); setCarId(""); setMessage("Available vehicles refreshed for your dates."); })}>Check availability</button></div>
        <label className="block font-semibold">Vehicle<select className={inputStyle} value={carId} onChange={e => setCarId(e.target.value)}><option value="">Select vehicle</option>{cars.map(car => <option key={car._id} value={car._id}>{car.name} — KSh {car.pricePerDay.toLocaleString()}/day</option>)}</select></label>
        <p className="text-sm text-slate-600">Creating a draft does not reserve the vehicle. A timed hold starts after document approval.</p>
        <button disabled={busy || !carId || !pickup || !returned} className={buttonStyle} onClick={() => void run(async () => { const booking = await workflow<Booking>("workflow/bookings/", { method: "POST", data: { carId, pickupDate: pickup, returnDate: returned } }); await loadAccount(); await openBooking(booking._id); setMessage("Draft created. Upload your documents below."); })}>Create booking draft</button>
      </section>
      <section className="space-y-4 rounded-2xl border bg-white p-6">
        <h2 className="text-xl font-bold">Your bookings</h2>
        {!bookings.length && <p>No bookings yet.</p>}
        {bookings.map(booking => <button key={booking._id} className="block w-full rounded-xl border p-4 text-left hover:bg-orange-50" onClick={() => void run(() => openBooking(booking._id))}><strong>{booking.carName}</strong><span className="block text-sm">{booking.pickupDate} → {booking.returnDate} · {booking.status.replaceAll("_", " ")} · KSh {booking.totalAmount.toLocaleString()}</span></button>)}
      </section>
      {progress && <section className="space-y-4 rounded-2xl border bg-white p-6">
        <div className="flex justify-between gap-3"><h2 className="text-xl font-bold">Documents: {progress.booking.carName}</h2><button className="underline" onClick={() => void run(async () => { await openBooking(progress.booking._id); await loadAccount(); })}>Refresh status</button></div>
        <div className="flex flex-wrap gap-3">{progress.documents.map(doc => <button key={doc.id} disabled={busy} className="text-sm underline" onClick={() => { const tab = window.open("about:blank", "_blank"); if (tab) tab.opener = null; void run(async () => { try { const result = await workflow<{ url: string }>(`workflow/documents/${doc.id}/link/`, { method: "POST", data: {} }); if (tab) tab.location.href = result.url; else setMessage("Allow a new tab to view your document."); } catch(e) { tab?.close(); throw e; } }); }}>View {doc.kind.replaceAll("_", " ")}</button>)}</div>
        <p>Status: <strong>{progress.booking.status.replaceAll("_", " ")}</strong></p>
        {progress.kyc?.reason && <Message message={progress.kyc.reason} />}
        <p className="text-sm text-slate-600">{policy.message} {progress.kyc?.due_at ? `Review due: ${new Date(progress.kyc.due_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}` : ""}</p>
        {["draft", "kyc_needs_correction"].includes(progress.booking.status) && <>
          {progress.booking.status === "draft" && <button className="underline" disabled={busy} onClick={() => void run(async () => { const result = await workflow<{ message: string }>(`workflow/bookings/${progress.booking._id}/reuse-documents/`, { method: "POST", data: {} }); await openBooking(progress.booking._id); setMessage(result.message); })}>Use approved documents already on file</button>}
          {policy.privacy_notice_version ? <label className="flex items-start gap-2"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} /><span>I have read the <a href="/privacy" className="underline">privacy notice</a> ({policy.privacy_notice_version}) and consent to document verification.</span></label> : <p className="text-sm text-orange-800">Document submission will open after the privacy notice and retention settings are approved.</p>}
          <p>Upload clear photos of the complete document. JPEG, PNG or WebP, up to 5MB. No online selfie is required.</p>
          <div className="grid gap-4 sm:grid-cols-2">{["id_front", "id_back", "licence_front", "licence_back"].map(kind => <label key={kind} className="rounded-xl border p-4 font-semibold">{kind.replaceAll("_", " ")}{progress.documents.some(d => d.kind === kind) && <span className="ml-2 text-sm text-green-700">Uploaded</span>}<input disabled={busy || !consent} className="mt-3 block w-full text-sm" type="file" accept="image/jpeg,image/png,image/webp" onChange={e => { const file = e.target.files?.[0]; if (!file) return; void run(async () => { const data = new FormData(); data.append("kind", kind); data.append("image", file); data.append("consent", "true"); data.append("consent_version", policy.privacy_notice_version); await workflow(`workflow/bookings/${progress.booking._id}/documents/`, { method: "POST", data }); await openBooking(progress.booking._id); setMessage("Document uploaded securely."); }); }} /></label>)}</div>

          <button className={buttonStyle} disabled={busy || !verified || !consent} onClick={() => void run(async () => { await workflow(`workflow/bookings/${progress.booking._id}/submit/`, { method: "POST", data: { consent, consent_version: policy.privacy_notice_version } }); await openBooking(progress.booking._id); await loadAccount(); setMessage("Documents submitted for review."); })}>Submit documents for review</button>
        </>}
        {["awaiting_payment", "payment_pending_verification", "confirmed", "expired", "handover_in_progress", "active", "returned", "closed"].includes(progress.booking.status) && <BookingPayments key={progress.booking._id} bookingId={progress.booking._id} bookingStatus={progress.booking.status} onConfirmed={async () => { await openBooking(progress.booking._id); await loadAccount(); }} />}
        <details><summary className="cursor-pointer font-semibold">Booking history</summary>{progress.history.map((entry, i) => <p key={i} className="mt-2 text-sm">{entry.current.replaceAll("_", " ")} · {new Date(entry.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>)}</details>
      </section>}
      <PrivacyControls />
      {notifications.length > 0 && <section className="rounded-2xl border p-6"><h2 className="text-xl font-bold">Updates</h2>{notifications.map(n => <p key={n.id} className="mt-3 text-sm">{n.message}</p>)}</section>}
    </>}
  </main>;
}
