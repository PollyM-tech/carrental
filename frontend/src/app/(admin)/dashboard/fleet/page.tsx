"use client";
import { useEffect, useState } from "react";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Field, Message, inputStyle, buttonStyle } from "@/components/shared/FormFields";
type Compliance = { documents: { id: number; kind: string; reference: string; expires_on: string }[]; blocks: { id: number; starts_on: string; ends_on: string; reason: string }[] };
export default function FleetCompliance() {
  const [cars, setCars] = useState<{ _id: string; name: string }[]>([]); const [car, setCar] = useState("");
  const [records, setRecords] = useState<Compliance | null>(null); const [kind, setKind] = useState("insurance");
  const [reference, setReference] = useState(""); const [expires, setExpires] = useState("");
  const [start, setStart] = useState(""); const [end, setEnd] = useState(""); const [reason, setReason] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false);
  useEffect(() => { void workflow<typeof cars>("rentals/cars/", { staff: true }).then(setCars).catch(e => setMessage(e.message)); }, []);
  async function load(id: string) { setRecords(await workflow<Compliance>(`workflow/fleet/${id}/`, { staff: true })); }
  async function save(data: unknown) { setBusy(true); setMessage(""); try { await workflow(`workflow/fleet/${car}/`, { staff: true, method: "POST", data }); await load(car); setMessage("Fleet record saved."); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  return <Workspace title="Fleet compliance"><Message message={message} /><p>Vehicles need insurance and inspection valid through the rental end date. Service and repair periods block availability.</p><label className="block font-bold">Vehicle<select className={inputStyle} value={car} onChange={e => { setCar(e.target.value); setRecords(null); if (e.target.value) void load(e.target.value).catch(e => setMessage(e.message)); }}><option value="">Select vehicle</option>{cars.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
    {car && <div className="grid gap-6 lg:grid-cols-2"><form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={e => { e.preventDefault(); void save({ type: "document", kind, reference, expires_on: expires }); }}><h2 className="text-xl font-bold">Insurance / inspection record</h2><label>Type<select className={inputStyle} value={kind} onChange={e => setKind(e.target.value)}><option value="insurance">Insurance</option><option value="inspection">Inspection</option></select></label><Field required label="Reference" value={reference} onChange={setReference} /><Field required type="date" label="Valid through" value={expires} onChange={setExpires} /><button disabled={busy} className={buttonStyle}>Add record</button>{records?.documents.map(d => <p key={d.id} className="text-sm">{d.kind}: {d.reference} · expires {d.expires_on}</p>)}</form>
    <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={e => { e.preventDefault(); void save({ type: "block", starts_on: start, ends_on: end, reason }); }}><h2 className="text-xl font-bold">Service or repair block</h2><Field required type="date" label="Start" value={start} onChange={setStart} /><Field required type="date" label="End (available again)" value={end} onChange={setEnd} /><Field required label="Reason" value={reason} onChange={setReason} /><button disabled={busy} className={buttonStyle}>Block dates</button>{records?.blocks.map(b => <p key={b.id} className="text-sm">{b.starts_on} → {b.ends_on}: {b.reason}</p>)}</form></div>}
  </Workspace>;
}
