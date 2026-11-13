"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import ReferralSource from "@/components/shared/ReferralSource";
import { signupReferral } from "../../../convex/lib/referral";
import { Message, buttonStyle } from "@/components/shared/FormFields";
export default function SignupReferralCompletion() {
  const save = useMutation(api.accounts.completeSignupReferral);
  const [source, setSource] = useState("");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={async event => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setMessage("");
    try { await save(signupReferral({ referralSource: source, referralDetails: details })); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save. Please retry."); }
    finally { setBusy(false); }
  }}><h2 className="text-xl font-bold text-[#0B1C4D]">Finish creating your account</h2><p className="text-sm text-slate-600">Tell us how you found Movara to complete your registration.</p><Message message={message} /><fieldset disabled={busy} className="space-y-4"><ReferralSource required value={source} onChange={setSource} details={details} onDetailsChange={setDetails} /><button className={buttonStyle} disabled={busy}>{busy ? "Saving…" : "Complete registration"}</button></fieldset></form>;
}
