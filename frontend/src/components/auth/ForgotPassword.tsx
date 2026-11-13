"use client";
import { useRef, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";
import { isConnectionError } from "@/lib/connection-errors";

export default function ForgotPassword({ portal, onBack }: { portal: "customer" | "admin"; onBack: () => void }) {
  const available = useQuery(api.security.passwordResetAvailable);
  const { signIn } = useAuthActions();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [message, setMessage] = useState("");
  return <section className="space-y-4 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold text-[#0B1C4D]">Reset your password</h2><Message message={message} />
    {available === undefined ? <p>Checking password recovery…</p> : !available ? <p className="text-sm text-slate-600">Email password recovery is not available yet. <a className="font-semibold underline" href="https://wa.me/254716741039" target="_blank" rel="noopener noreferrer">Contact Movara for help</a>. Never send your password or reset code over WhatsApp.</p> : <form className="space-y-4" onSubmit={async event => {
      event.preventDefault();
      if (pending.current) return;
      if (sentTo && password !== confirmation) { setMessage("Your passwords do not match."); return; }
      pending.current = true; setBusy(true); setMessage("");
      try {
        if (!sentTo) {
          const address = email.trim().toLowerCase();
          await signIn("password", { flow: "reset", email: address, portal });
          setSentTo(address);
          setMessage("Code sent to your email.");
        } else {
          const result = await signIn("password", { flow: "reset-verification", email: sentTo, code: code.trim(), newPassword: password, portal });
          setPassword(""); setConfirmation(""); setCode("");
          if (!result.signingIn) throw new Error("Invalid reset code");
          setMessage("Password updated. Opening your dashboard…");
        }
      } catch (error) {
        setMessage(isConnectionError(error) ? "Unable to reach Movara. Check your connection and retry." : error instanceof Error && error.message.includes("LOGIN_LOCKED") ? "Too many attempts. Wait 15 minutes before trying again." : sentTo ? "The code is invalid or expired. Check it or request a new code. Passwords must be 12–128 characters." : "Unable to request a reset right now. Please try again later.");
      } finally { pending.current = false; setBusy(false); }
    }}>
      {sentTo ? <><p className="break-all text-sm text-slate-600">Enter the code sent to {sentTo}. Codes expire after 15 minutes.</p><Field required label="Email reset code" value={code} onChange={setCode} /><Field required type="password" label="New password (12–128 characters)" value={password} onChange={setPassword} /><Field required type="password" label="Confirm new password" value={confirmation} onChange={setConfirmation} /></> : <Field required type="email" label="Your account email" value={email} onChange={setEmail} />}
      <button className={buttonStyle} disabled={busy || Boolean(sentTo && (password.length < 12 || password.length > 128))}>{busy ? "Please wait…" : sentTo ? "Save new password" : "Send reset code"}</button>
      {sentTo && <button type="button" disabled={busy} className="block text-sm underline" onClick={() => { setSentTo(""); setCode(""); setPassword(""); setConfirmation(""); setMessage(""); }}>Use another email or request a new code</button>}
    </form>}
    <button type="button" disabled={busy} onClick={onBack} className="text-sm underline">Back to sign in</button>
  </section>;
}
