"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Payment, money } from "@/components/shared/BookingPayments";
import { Field, Message, inputStyle, buttonStyle } from "@/components/shared/FormFields";
type FinancePayment = Payment & { car_name: string; review_reason: string; received_minor: number | null; notes: { reason: string; created_at: string }[] };
type Check = { amount: string; date: string; reason: string; checked: boolean };
export default function Payments() {
  const [rows, setRows] = useState<FinancePayment[]>([]); const [filter, setFilter] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [checks, setChecks] = useState<Record<string, Check>>({});
  async function load() { setRows(await workflow<FinancePayment[]>("payments/finance/", { staff: true })); }
  useEffect(() => { void workflow<FinancePayment[]>("payments/finance/", { staff: true }).then(setRows).catch(e => setMessage(e.message)); }, []);
  function update(id: string, values: Partial<Check>) { setChecks(current => ({ ...current, [id]: { ...(current[id] ?? { amount: "", date: "", reason: "", checked: false }), ...values } })); }
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  async function decide(row: FinancePayment, action: string) {
    const check = checks[row.id]; if (!check?.reason.trim()) throw new Error("Record your verification findings first.");
    let amount: number | undefined; let paidAt: string | undefined;
    if (action === "confirm") {
      if (!check.checked || !/^\d+(\.\d{1,2})?$/.test(check.amount) || !check.date) throw new Error("Check the receiving account and enter the actual amount and payment time.");
      const [whole, cents = ""] = check.amount.split("."); amount = Number(whole)*100+Number(cents.padEnd(2, "0"));
      paidAt = new Date(`${check.date}:00+03:00`).toISOString();
    }
    const result = await workflow<Payment>(`payments/manual/${row.id}/decision/`, { staff: true, method: "POST", data: { action, reason: check.reason, amount_minor: amount, paid_at: paidAt, checked_receiving_account: check.checked } });
    await load(); setMessage(result.message);
  }
  return <Workspace title="Payments and reconciliation"><Message message={message} /><p>Check each M-Pesa code, amount, recipient and payment time in the dedicated receiving account. A customer code or screenshot alone does not confirm payment. Late payments and incorrect amounts require finance follow-up.</p>
    <div className="flex flex-wrap items-end gap-4"><label className="grow font-semibold">Status<select className={inputStyle} value={filter} onChange={e => setFilter(e.target.value)}><option value="">All</option>{["submitted", "manual_review", "confirmed", "failed", "pending"].map(status => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></label><button className={buttonStyle} disabled={busy} onClick={() => void run(load)}>Refresh payments</button></div>
    {rows.filter(row => !filter || row.status === filter).map(row => <section key={row.id} className="space-y-3 rounded-2xl border bg-white p-5">
      <div className="flex flex-wrap justify-between gap-3"><h2 className="text-lg font-bold">{row.car_name}</h2><span>{row.status.replaceAll("_", " ")} · {row.provider}</span></div><p className="break-all font-mono text-xs">{row.reference}</p><Link className="text-sm font-bold text-orange-700 underline" href={`/dashboard/bookings/${row.booking_id}`}>Open booking</Link>
      <p>Expected amount: <strong>{money(row.base_minor)}</strong> · Verified received: <strong>{row.received_minor === null ? "Not verified" : money(row.received_minor)}</strong></p>
      {row.transaction_code && <p>Submitted M-Pesa code: <strong>{row.transaction_code}</strong> · {row.receiving_till ? "Receiving till" : "Receiving phone"}: <strong>{row.receiving_till || row.receiving_phone}</strong></p>}{row.review_reason && <Message message={row.review_reason} />}
      {row.provider === "manual_mpesa" && row.status === "submitted" && <><Field label="Actual amount received (KES)" value={checks[row.id]?.amount ?? ""} onChange={amount => update(row.id, { amount })} /><label className="block font-semibold">Payment date and time (Nairobi)<input type="datetime-local" className={inputStyle} value={checks[row.id]?.date ?? ""} onChange={e => update(row.id, { date: e.target.value })} /></label><label className="flex gap-3 text-sm"><input type="checkbox" checked={checks[row.id]?.checked ?? false} onChange={e => update(row.id, { checked: e.target.checked })} />I checked this exact transaction code in the receiving account and verified the amount, recipient and time.</label></>}
      <Field label="Verification findings / follow-up note" value={checks[row.id]?.reason ?? ""} onChange={reason => update(row.id, { reason })} />
      {row.provider === "manual_mpesa" && row.status === "submitted" && <div className="flex flex-wrap gap-3"><button disabled={busy || !checks[row.id]?.checked} className={buttonStyle} onClick={() => void run(() => decide(row, "confirm"))}>Record verified receipt</button><button disabled={busy || !checks[row.id]?.reason.trim()} className="font-bold text-red-700 underline" onClick={() => void run(() => decide(row, "reject"))}>Reject unverified code</button></div>}
      <button disabled={busy || !checks[row.id]?.reason.trim()} className="font-bold underline" onClick={() => void run(async () => { await workflow(`payments/finance/${row.id}/notes/`, { staff: true, method: "POST", data: { reason: checks[row.id]?.reason } }); await load(); setMessage("Finance note recorded."); })}>Record follow-up note</button>
      {row.notes.map((note, i) => <p key={i} className="border-t pt-2 text-sm">{note.reason} · {new Date(note.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>)}
    </section>)}{!rows.length && <p>No payment submissions yet.</p>}
  </Workspace>;
}
