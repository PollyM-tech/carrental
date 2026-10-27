"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { FunctionReturnType } from "convex/server";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";

type Details = FunctionReturnType<typeof api.customerCare.mine>;
export default function InPersonVerification({ bookingId, editable }: { bookingId: Id<"movaraBookingRequests">; editable: boolean }) {
  const [open, setOpen] = useState(false);
  const data = useQuery(api.customerCare.mine, open ? { bookingId } : "skip");
  return <div className="space-y-3 border-t pt-3"><button className="text-sm font-semibold text-orange-700 underline" onClick={() => setOpen(!open)}>{open ? "Hide identification details" : "Identification & contact details"}</button>{open && (data === undefined ? <p>Loading…</p> : <ContactForm key={data?.revision ?? "new"} data={data} bookingId={bookingId} editable={editable} />)}</div>;
}
function ContactForm({ data, bookingId, editable }: { data: Details; bookingId: Id<"movaraBookingRequests">; editable: boolean }) {
  const submit = useMutation(api.customerCare.submit);
  const [form, setForm] = useState({ fullName: data?.fullName ?? "", nextOfKinName: data?.nextOfKinName ?? "", nextOfKinPhone: data?.nextOfKinPhone ?? "", guarantorName: data?.guarantorName ?? "", guarantorPhone: data?.guarantorPhone ?? "" });
  const [consent, setConsent] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const labels = { awaiting_in_person: "Bring your original documents for checking", approved: "In-person checks approved", needs_correction: "Contact details need correction", rejected: "Checks not approved — contact Movara" };
  if (data?.manualClearanceRecorded) return <section className="space-y-2 rounded-xl bg-slate-50 p-4"><h4 className="font-bold">In-person identification approved</h4><p className="text-sm">Your signed paper contract and completed in-person requirements have been recorded by Movara. Contact Movara if your details need correction.</p></section>;
  return <form className="space-y-3 rounded-xl bg-slate-50 p-4" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage("");
    try { await submit({ ...form, bookingId, consentToContacts: consent }); setMessage("Details saved. Bring your original ID/passport and driving licence to the agreed identification appointment."); }
    catch(e) { const raw = e instanceof Error ? e.message : "Unable to save."; setMessage(raw.match(/Uncaught Error: ([^\n]+)/)?.[1] ?? raw); }
    finally { setBusy(false); }
  }}><h4 className="font-bold">In-person identification</h4><p className="text-sm">Online ID/licence upload is currently closed. Bring your original ID or passport and driving licence. Movara will check them in person before approving your rental. No payment or deposit is due before all approvals and manual contract signing.</p>{data && <p className="text-sm font-semibold">{labels[data.status]}</p>}{data?.customerMessage && <p className="text-sm">Movara: {data.customerMessage}</p>}<Message message={message} /><fieldset disabled={busy || !editable} className="grid gap-3 sm:grid-cols-2">{([['fullName','Your full name','text'],['nextOfKinName','Next-of-kin full name','text'],['nextOfKinPhone','Next-of-kin phone (+country code)','tel'],['guarantorName','Guarantor full name','text'],['guarantorPhone','Guarantor phone (+country code)','tel']] as const).map(([key,label,type]) => <Field key={key} required label={label} type={type} value={form[key]} onChange={value => setForm({ ...form, [key]: value })} />)}</fieldset>{editable ? <><label className="flex gap-2 text-sm"><input type="checkbox" required checked={consent} disabled={busy} onChange={e => setConsent(e.target.checked)} /><span>I have permission to share these contacts with Movara for rental verification and rental-related contact. Updating details requires a fresh review.</span></label><button disabled={busy || !consent} className={buttonStyle}>{busy ? "Saving…" : "Save for in-person checks"}</button></> : <p className="text-sm">Contact Movara to correct details on this approved or closed booking.</p>}</form>;
}
