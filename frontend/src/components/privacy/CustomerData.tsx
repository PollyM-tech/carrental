"use client";
import { useState } from "react";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Message, buttonStyle, inputStyle } from "@/components/shared/FormFields";
export default function CustomerData() {
  const requests = useQuery(api.dataRequests.mine);
  const create = useMutation(api.dataRequests.create); const convex = useConvex();
  const [kind, setKind] = useState<"access" | "correction" | "deletion">("access");
  const [details, setDetails] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  return <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Your information and privacy</h2><p className="text-sm text-slate-600">Download your account and booking information, or ask Movara to review an access, correction or deletion request. Do not enter identity-document numbers, passwords or payment codes.</p><Message message={message} />
    <button type="button" disabled={busy} className="font-semibold text-orange-700 underline" onClick={async () => {
      setBusy(true); setMessage("");
      try { const data = await convex.query(api.dataRequests.exportMine, {}); const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); const link = document.createElement("a"); link.href = url; link.download = "movara-account-data.json"; link.click(); URL.revokeObjectURL(url); }
      catch { setMessage("Unable to download your information. Please retry."); } finally { setBusy(false); }
    }}>Download my information</button>
    <form className="space-y-3" onSubmit={async event => { event.preventDefault(); if (busy) return; setBusy(true); setMessage(""); try { await create({ kind, details }); setDetails(""); setMessage("Your request has been sent to Movara for review."); } catch { setMessage("Unable to submit. Check for an existing open request below or contact Movara."); } finally { setBusy(false); } }}><label className="block text-sm font-semibold">Request type<select className={inputStyle} value={kind} disabled={busy} onChange={event => setKind(event.target.value as typeof kind)}><option value="access">Access my information</option><option value="correction">Correct my information</option><option value="deletion">Delete my account and information</option></select></label><label className="block text-sm font-semibold">Request details<textarea required maxLength={1000} className={inputStyle} value={details} disabled={busy} onChange={event => setDetails(event.target.value)} /></label><button className={buttonStyle} disabled={busy}>{busy ? "Please wait…" : "Submit privacy request"}</button></form>
    {requests?.map(row => <div key={row._id} className="rounded-xl border p-3 text-sm"><p className="font-semibold">{row.kind} · {row.status.replaceAll("_", " ")}</p><p className="mt-1 whitespace-pre-wrap">{row.details}</p>{row.customerMessage && <p className="mt-2 text-slate-600">Movara: {row.customerMessage}</p>}</div>)}
  </section>;
}
