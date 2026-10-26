"use client";
import { useEffect, useState } from "react";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";
type Case = { id: string; booking: string; customer: string; status: string; reason: string; due_at: string | null; submitted_at: string; details?: Record<string, string | boolean>; document_ids?: string[]; decisions?: { decision: string; reason: string; created_at: string }[] };
const checkLabels: Record<string, string> = { details_match: "Typed details match uploaded documents", documents_genuine: "Documents look genuine and unaltered", ntsa_checked: "Licence checked through NTSA", correct_class: "Licence class covers the selected vehicle" };
export default function Reviews() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selected, setSelected] = useState<Case | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() { setCases(await workflow<Case[]>("workflow/reviews/", { staff: true })); }
  useEffect(() => { void workflow<Case[]>("workflow/reviews/", { staff: true }).then(setCases).catch(e => setMessage(e.message)); }, []);
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch (e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  async function decision(value: string) { if (!selected) return; setSelected(await workflow<Case>(`workflow/reviews/${selected.id}/`, { staff: true, method: "POST", data: { decision: value, reason, checks } })); await load(); setMessage("Review action recorded."); }
  return <Workspace title="Document review"><Message message={message} /><p>Online approval is conditional. Identity and original documents are checked again at pickup.</p>
    <button className="underline" disabled={busy} onClick={() => void run(load)}>Refresh queue</button>
    <div className="grid items-start gap-6 xl:grid-cols-[320px_1fr]">
      <section className="space-y-3">{!cases.length && <p>No submitted cases.</p>}{cases.map(item => <button key={item.id} className={`block w-full rounded-xl border bg-white p-4 text-left ${selected?.id === item.id ? "ring-2 ring-orange-500" : ""}`} onClick={() => void run(async () => { setSelected(await workflow<Case>(`workflow/reviews/${item.id}/`, { staff: true })); setChecks({}); setReason(""); })}><strong className="break-all">{item.customer}</strong><p className="mt-1 text-sm">{item.status.replaceAll("_", " ")}</p><p className="text-xs">{item.due_at ? `Due ${new Date(item.due_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}` : "Review target: 30 minutes before handover"}</p></button>)}</section>
      {selected && <section className="space-y-5 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">{selected.customer}</h2><p className="text-sm">Booking {selected.booking}</p>
        <dl className="grid gap-3 sm:grid-cols-2">{Object.entries(selected.details ?? {}).map(([key, value]) => <div key={key}><dt className="text-xs uppercase text-slate-500">{key.replaceAll("_", " ")}</dt><dd className="break-words font-semibold">{String(value)}</dd></div>)}</dl>
        <div className="flex flex-wrap gap-3">{selected.document_ids?.map((id, i) => <button key={id} className="rounded-xl border px-4 py-2 text-sm underline" disabled={busy} onClick={() => { const tab = window.open("about:blank", "_blank"); if (tab) tab.opener = null; void run(async () => { try { const result = await workflow<{ url: string }>(`workflow/documents/${id}/link/`, { staff: true, method: "POST", data: {} }); if (tab) tab.location.href = result.url; else setMessage("Allow a new tab to view the document."); } catch(e) { tab?.close(); throw e; } }); }}>View {["ID front", "ID back", "licence front", "licence back"][i]}</button>)}</div>
        <p className="text-xs text-slate-600">Document links expire after 60 seconds. Access is recorded.</p>
        {selected.status === "submitted" && <button className={buttonStyle} disabled={busy} onClick={() => void run(() => decision("start"))}>Start review</button>}
        {selected.status === "in_review" && <><div className="space-y-3">{Object.entries(checkLabels).map(([key, label]) => <label key={key} className="flex items-start gap-3"><input type="checkbox" checked={checks[key] ?? false} onChange={e => setChecks({ ...checks, [key]: e.target.checked })} />{label}</label>)}</div><Field label="Decision reason / correction instructions" value={reason} onChange={setReason} /><div className="flex flex-wrap gap-3">{["approve", "correction", "reject"].map(value => <button key={value} disabled={busy} className={buttonStyle} onClick={() => void run(() => decision(value))}>{value === "correction" ? "Request correction" : value === "approve" ? "Approve conditionally" : "Reject"}</button>)}</div></>}
        <Message message={selected.reason} /><details><summary>Decision history</summary>{selected.decisions?.map((d, i) => <p key={i} className="mt-2 text-sm">{d.decision}: {d.reason} · {new Date(d.created_at).toLocaleString()}</p>)}</details>
      </section>}
    </div>
  </Workspace>;
}
