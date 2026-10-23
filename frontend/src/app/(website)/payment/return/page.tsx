"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { workflow } from "@/lib/workflow";
import type { Payment } from "@/components/shared/BookingPayments";
import { money } from "@/components/shared/BookingPayments";
import { Message, buttonStyle } from "@/components/shared/FormFields";
export default function PaymentReturn() {
  const [result, setResult] = useState<Payment | null>(null); const [message, setMessage] = useState("Checking your payment with Paystack…"); const [reference, setReference] = useState(""); const [busy, setBusy] = useState(true);
  useEffect(() => {
    let active = true;
    const ref = new URLSearchParams(window.location.search).get("reference") ?? "";
    if (!ref) { void Promise.resolve().then(() => { if (active) { setMessage("No payment reference was returned. Open My bookings to check your payment."); setBusy(false); } }); return () => { active = false; }; }
    void workflow<Payment>("payments/verify/", { method: "POST", data: { reference: ref } }).then(payment => { if (active) { setResult(payment); setMessage(payment.message); } }).catch(e => { if (active) setMessage(e.message+" Sign in to your customer account and check the payment before trying again."); }).finally(() => { if (active) { setReference(ref); setBusy(false); } });
    return () => { active = false; };
  }, []);
  return <main className="mx-auto max-w-xl space-y-5 px-4 py-14"><h1 className="text-3xl font-bold text-[#0B1C4D]">{result?.status === "confirmed" ? "Booking confirmed" : "Your payment"}</h1><Message message={message} />{result?.domain === "test" && <Message message="This was a test transaction. No real payment was collected." />}{reference && <p className="break-all font-mono text-xs">Reference: {reference}</p>}{result?.total_minor !== null && result?.total_minor !== undefined && <p className="text-xl font-bold">{money(result.total_minor)}</p>}{result && <p className="text-sm">Original identity documents and a signed contract are required before the vehicle can be released.</p>}{reference && result?.status !== "confirmed" && <button disabled={busy} className={buttonStyle} onClick={() => { setBusy(true); workflow<Payment>("payments/verify/", { method: "POST", data: { reference } }).then(payment => { setResult(payment); setMessage(payment.message); }).catch(e => setMessage(e.message)).finally(() => setBusy(false)); }}>Check again</button>}<Link className="block font-bold text-orange-700 underline" href={result ? `/account?booking=${result.booking_id}` : "/account"}>Open My bookings</Link></main>;
}
