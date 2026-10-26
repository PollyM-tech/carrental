"use client";
import { useEffect, useState } from "react";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";
type Row = { id: number; customer: string; phone: string; expires_at: string };
export default function PhoneVerification() {
  const [rows, setRows] = useState<Row[]>([]); const [id, setId] = useState<number | null>(null);
  const [reference, setReference] = useState(""); const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { void workflow<Row[]>("workflow/phone/manual/", { staff: true }).then(setRows).catch(e => setMessage(e.message)); }, []);
  async function load() { setRows(await workflow<Row[]>("workflow/phone/manual/", { staff: true })); }
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  return <Workspace title="WhatsApp phone verification"><Message message={message} /><p>Open Movara WhatsApp on 0716 741 039. Check the sender&apos;s full phone number against the customer number below and enter the reference from their message. A forwarded message, screenshot or customer name is insufficient.</p>
    <button disabled={busy} className="underline" onClick={() => void run(load)}>Refresh queue</button>
    {rows.map(row => <button key={row.id} className="block w-full rounded-xl border bg-white p-4 text-left" onClick={() => { setId(row.id); setReference(""); setChecked(false); }}><strong>{row.phone}</strong> · {row.customer}<p className="text-sm">Expires {new Date(row.expires_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p></button>)}
    {!rows.length && <p>No pending phone checks.</p>}
    {id !== null && <form className="space-y-4 rounded-xl border bg-white p-5" onSubmit={e => { e.preventDefault(); void run(async () => { await workflow("workflow/phone/manual/", { staff: true, method: "POST", data: { id, reference: reference.trim().toUpperCase(), checked_sender: checked } }); setId(null); await load(); setMessage("Phone verified and staff check recorded."); }); }}><p className="font-bold">Verify {rows.find(row => row.id === id)?.phone}</p><Field required label="12-character reference from the WhatsApp message" value={reference} onChange={setReference} /><label className="flex gap-2"><input type="checkbox" required checked={checked} onChange={e => setChecked(e.target.checked)} />I checked that the actual sender&apos;s full phone number matches.</label><button disabled={busy || !checked} className={buttonStyle}>Confirm phone verification</button></form>}
  </Workspace>;
}
