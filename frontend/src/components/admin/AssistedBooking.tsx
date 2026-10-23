"use client";
import { useState } from "react";
import { workflow, PublicCar } from "@/lib/workflow";
import { Field, Message, buttonStyle, inputStyle } from "@/components/shared/FormFields";
export default function AssistedBooking({ onCreated }: { onCreated: () => Promise<void> }) {
  const [email, setEmail] = useState(""); const [pickup, setPickup] = useState(""); const [returned, setReturned] = useState(""); const [cars, setCars] = useState<PublicCar[]>([]); const [car, setCar] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  return <details className="rounded-xl border bg-white p-5"><summary className="cursor-pointer font-bold">Create a booking for a customer</summary><p className="my-3 text-sm">The customer needs an account. Their phone verification and document review still apply.</p><Message message={message} /><form className="mt-4 space-y-4" onSubmit={event => { event.preventDefault(); setBusy(true); setMessage(""); workflow("workflow/bookings/", { staff: true, method: "POST", data: { customer_email: email, carId: car, pickupDate: pickup, returnDate: returned } }).then(async () => { setMessage("Draft created for the customer. They can submit documents from My bookings."); await onCreated(); }).catch(e => setMessage(e.message)).finally(() => setBusy(false)); }}>
    <div className="grid gap-4 sm:grid-cols-3"><Field label="Customer email" type="email" required value={email} onChange={setEmail} /><Field label="Pickup" type="date" required value={pickup} onChange={setPickup} /><Field label="Return" type="date" required value={returned} onChange={setReturned} /></div>
    <button type="button" disabled={busy || !pickup || !returned} className="underline" onClick={() => { setBusy(true); workflow<PublicCar[]>(`workflow/public/cars/?pickupDate=${pickup}&returnDate=${returned}`, { public: true }).then(rows => { setCars(rows); setCar(""); }).catch(e => setMessage(e.message)).finally(() => setBusy(false)); }}>Check available vehicles</button>
    <select required className={inputStyle} value={car} onChange={e => setCar(e.target.value)}><option value="">Select vehicle</option>{cars.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select><button disabled={busy || !car} className={buttonStyle}>Create draft</button>
  </form></details>;
}
