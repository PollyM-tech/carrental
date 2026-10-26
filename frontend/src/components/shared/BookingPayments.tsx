"use client";
import { useEffect, useState } from "react";
import { workflow } from "@/lib/workflow";
import { Field, Message, buttonStyle } from "./FormFields";
export type Payment = { id: string; reference: string; booking_id: string; status: string; provider: string; receiving_phone: string; receiving_till: string; transaction_code: string | null; domain: string; currency: string; channel: string; fee_mode: string; rental_minor: number; deposit_minor: number; handover_deposit_minor: number; base_minor: number; surcharge_minor: number | null; total_minor: number | null; quote_expires_at: string; hold_expires_at: string; checkout_url: string; message: string; paid_at: string | null };
export function money(amount: number | null) { return amount === null ? "Not reported" : new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount/100); }
export default function BookingPayments({ bookingId, bookingStatus, onConfirmed }: { bookingId: string; bookingStatus: string; onConfirmed: () => Promise<void> }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [quote, setQuote] = useState<Payment | null>(null);
  const [code, setCode] = useState(""); const [accept, setAccept] = useState(false);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [now, setNow] = useState(0);
  const canPay = ["awaiting_payment", "payment_pending_verification"].includes(bookingStatus);
  const pending = payments.some(p => ["submitted", "manual_review", "pending", "initializing", "initialization_unknown"].includes(p.status));
  useEffect(() => {
    let active = true;
    void workflow<Payment[]>(`payments/bookings/${bookingId}/`).then(rows => { if (active) { setPayments(rows); setQuote(rows.find(p => p.provider === "manual_mpesa" && p.status === "quoted") ?? null); } }).catch(e => { if (active) setMessage(e.message); });
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => { active = false; clearInterval(interval); };
  }, [bookingId]);
  async function refresh() { const rows = await workflow<Payment[]>(`payments/bookings/${bookingId}/`); setPayments(rows); if (rows.some(p => p.status === "confirmed")) await onConfirmed(); }
  async function run(action: () => Promise<void>) { setBusy(true); setMessage(""); try { await action(); } catch(e) { setMessage(e instanceof Error ? e.message : "Please retry."); } finally { setBusy(false); } }
  const expired = quote && (!canPay || now > 0 && (new Date(quote.hold_expires_at).getTime() <= now || new Date(quote.quote_expires_at).getTime() <= now));
  return <section className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50/30 p-5">
    <h3 className="text-xl font-bold text-[#0B1C4D]">{canPay ? "Pay with M-Pesa Buy Goods" : "Payment records"}</h3><Message message={message} />
    {canPay && !pending && <><p className="text-sm">Review your booking amount before sending money. Finance checks the receiving account before confirming your booking. Original documents and a manually signed contract are required before handover.</p>
      <button disabled={busy} className={buttonStyle} onClick={() => void run(async () => { const result = await workflow<Payment>(`payments/bookings/${bookingId}/`, { method: "POST", data: { channel: "manual_mpesa" } }); setQuote(result); setAccept(false); await refresh(); })}>Review payment amount</button></>}
    {quote && quote.status === "quoted" && !pending && !payments.some(p => p.status === "confirmed") && <div className="space-y-4 rounded-xl border bg-white p-5">
      <dl className="space-y-2 text-sm"><div>Rental: <strong>{money(quote.rental_minor)}</strong></div>{quote.deposit_minor > 0 && <div>Security deposit included: {money(quote.deposit_minor)}</div>}<div>Movara processing surcharge: <strong>{money(0)}</strong></div><div className="border-t pt-3 text-base">Amount to send: <strong>{money(quote.total_minor)}</strong></div></dl>
      {quote.handover_deposit_minor > 0 && <p>Deposit due separately at pickup: {money(quote.handover_deposit_minor)}.</p>}
      <p className="text-sm">Any applicable M-Pesa charges are shown by Safaricom before payment. Vehicle hold ends {new Date(quote.hold_expires_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}.</p>
      {expired ? <Message message="Do not send money using this expired quote. Refresh the amount or contact Movara. If you already paid, submit your transaction code below for finance review." /> : <><p>Open M-Pesa → {quote.receiving_till ? "Lipa na M-Pesa → Buy Goods and Services → enter till" : "Send Money → enter"} <strong>{quote.receiving_till || quote.receiving_phone}</strong> → pay <strong>{money(quote.total_minor)}</strong>.</p><p className="text-sm">Check the recipient name in M-Pesa before authorising. Contact Movara if it does not match the expected recipient.</p></>}
      <Field label="M-Pesa transaction code (10 characters)" value={code} onChange={v => setCode(v.toUpperCase())} />
      <label className="flex items-start gap-3 text-sm"><input className="mt-1" type="checkbox" checked={accept} onChange={e => setAccept(e.target.checked)} /><span>I sent the displayed amount to {quote.receiving_till ? `till ${quote.receiving_till}` : quote.receiving_phone} and want finance to verify the transaction.</span></label>
      <button disabled={busy || !accept || !/^[A-Z0-9]{10}$/.test(code.trim())} className={buttonStyle} onClick={() => void run(async () => { const result = await workflow<Payment>(`payments/manual/${quote.id}/submit/`, { method: "POST", data: { accept_amount: true, transaction_code: code.trim() } }); setQuote(null); setMessage(result.message); await refresh(); })}>Submit transaction code</button>
    </div>}
    {payments.filter(p => p.status !== "quoted").map(payment => <div className="space-y-2 rounded-xl border bg-white p-4" key={payment.id}><p className="break-all font-mono text-xs">{payment.reference}</p><p className="font-bold">{payment.status.replaceAll("_", " ")} · {money(payment.total_minor)}</p>{payment.transaction_code && <p>Transaction code: {payment.transaction_code}</p>}<p className="text-sm">{payment.message}</p>{payment.paid_at && <p className="text-xs">Paid {new Date(payment.paid_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</p>}</div>)}
    <button disabled={busy} className="text-sm font-bold underline" onClick={() => void run(refresh)}>Refresh payment status</button>
  </section>;
}
