"use client";
import { useEffect, useState } from "react";
import { workflow } from "@/lib/workflow";
import { Field, Message, buttonStyle, inputStyle } from "./FormFields";
type Request = { id: string; kind: string; status: string; resolution: string; created_at: string };
export default function PrivacyControls() {
  const [rows, setRows] = useState<Request[]>([]);
  const [kind, setKind] = useState("access"); const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  async function load() { setRows(await workflow<Request[]>("workflow/privacy/requests/")); }
  useEffect(() => { void workflow<Request[]>("workflow/privacy/requests/").then(setRows).catch(e => setMessage(e.message)); }, []);
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  return <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Your personal data</h2><Message message={message} />
    <p className="text-sm">Download your data, update your profile above, or ask the owner for access, correction or deletion. Open rentals, payment reconciliation and documented holds may delay deletion. Some financial and audit records are retained separately.</p>
    <button disabled={busy} className={buttonStyle} onClick={() => void run(async () => { const data = await workflow<object>("workflow/privacy/export/"); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "movara-personal-data.json"; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage("Your data download is ready."); })}>Download my data</button>
    <form className="space-y-3" onSubmit={event => { event.preventDefault(); void run(async () => { await workflow("workflow/privacy/requests/", { method: "POST", data: { kind, details, ...(kind === "deletion" ? { password } : {}) } }); setDetails(""); setPassword(""); setAccept(false); await load(); setMessage("Request sent to the owner for review."); }); }}>
      <label className="block font-semibold">Request type<select className={inputStyle} value={kind} onChange={e => { setKind(e.target.value); setAccept(false); }}><option value="access">Access or copies of my data</option><option value="correction">Correct my data</option><option value="deletion">Delete my operational data and close my account</option></select></label>
      <label className="block font-semibold">Details<textarea className={inputStyle} maxLength={2000} value={details} onChange={e => setDetails(e.target.value)} required={kind === "correction"} /></label>
      <p className="text-xs text-slate-600">Describe the request without including ID numbers, licence numbers, passwords or document photos.</p>
      {kind === "deletion" && <Field required type="password" label="Confirm current password" value={password} onChange={setPassword} />}
      {kind === "deletion" && <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} required /><span>I understand approved deletion closes my account. Financial/audit evidence may remain, and unresolved rentals or payments must be resolved first.</span></label>}
      <button disabled={busy || kind === "deletion" && !accept} className={buttonStyle}>Submit data request</button>
    </form>
    <button disabled={busy} className="underline" onClick={() => void run(load)}>Refresh requests</button>
    {rows.map(row => <div key={row.id} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{row.kind} · {row.status.replaceAll("_", " ")}</p><p>{row.resolution || "Awaiting owner review"}</p></div>)}
  </section>;
}
