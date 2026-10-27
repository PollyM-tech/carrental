"use client";
import { isConnectionError } from "@/lib/connection-errors";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { normalisePhone } from "../../../../convex/lib/identity";
import { rentalTerms } from "@/config/rental-policy";
import { siteConfig } from "@/config/site";
import { signedInHome } from "@/lib/auth-routing";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";

export default function SignIn() {
  const { signIn, signOut } = useAuthActions();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const router = useRouter();
  const account = useQuery(api.accounts.current, isAuthenticated ? {} : "skip");
  useEffect(() => {
    if (!account) return;
    const selectedCar = new URLSearchParams(window.location.search).get("car");
    router.replace(signedInHome(account) + (!account.staff && selectedCar ? `?car=${encodeURIComponent(selectedCar)}` : ""));
  }, [account, router]);
  const [signup, setSignup] = useState(false);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const owner = email.trim().toLowerCase() === "movaracarhire@gmail.com";
  return <main className="mx-auto max-w-5xl space-y-5 px-4 py-10 sm:py-14"><Link href="/" className="font-bold text-orange-700">Movara Car Hire</Link><h1 className="text-3xl font-bold text-[#0B1C4D]">{signup ? "Create your Movara account" : "Sign in to Movara"}</h1><p className="max-w-2xl text-slate-600">Request a vehicle, view your booking requests and keep your contact details up to date.</p><div className="grid items-start gap-6 md:grid-cols-2"><section aria-label={signup ? "Account registration" : "Account sign in"} className="space-y-4 md:order-2"><Message message={message} />
    {isLoading ? <p>Checking your session…</p> : isAuthenticated ? <div className="space-y-4"><p>Opening your {account?.staff ? "admin dashboard" : "booking dashboard"}…</p><button disabled={busy} className="block underline" onClick={async () => { setBusy(true); try { await signOut(); } catch { setMessage("Could not sign out. Please retry."); } finally { setBusy(false); } }}>Sign out</button></div> : <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      if (owner) { setMessage("Use the private admin sign-in page for this account."); setBusy(false); return; }
      let internationalPhone: string | undefined;
      if (signup && (!owner || phone.trim())) {
        try { internationalPhone = normalisePhone(phone); } catch (error) { setMessage(error instanceof Error ? error.message : "Enter a valid phone number."); setBusy(false); return; }
      }
      try {
        const result = await signIn("password", { email: email.trim().toLowerCase(), password, flow: signup ? "signUp" : "signIn", ...(internationalPhone ? { phone: internationalPhone } : {}), portal: "customer" });
        setPassword("");
        if (!result.signingIn) setMessage("Please complete sign-in to continue.");
      } catch (error) { setMessage(isConnectionError(error) ? "Unable to reach Movara. Check your connection and try again." : error instanceof Error && error.message.includes("LOGIN_LOCKED") ? "Five failed login attempts. Wait 15 minutes before trying again." : signup ? (owner ? "Account creation failed. Use the private admin sign-in page. If already registered, sign in." : "Account creation failed. Check your details. If already registered, sign in.") : "Sign-in failed. Check your email and password, then try again."); }
      finally { setBusy(false); }
    }}>
      <Field required label="Email" type="email" value={email} onChange={setEmail} />
      <Field required label={signup ? "Password (12–128 characters)" : "Password"} type="password" value={password} onChange={setPassword} />
      {signup && <><Field label="Phone / WhatsApp number with country code" type="tel" required={!owner} value={phone} onChange={setPhone} /><p className="text-xs text-slate-600">International numbers welcome: +44 7700 900123, +1 202 555 0123, or +254 716 741039. Kenyan 07… and 01… numbers also work.</p></>}
      <button disabled={busy || signup && (password.length < 12 || password.length > 128)} className={buttonStyle}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
      <button type="button" disabled={busy} className="block text-sm underline" onClick={() => { setSignup(!signup); setMessage(""); setPassword(""); }}>{signup ? "Already registered? Sign in" : "New here? Create an account"}</button>
    </form>}
    <p className="text-sm text-slate-600">Customers continue to their booking dashboard after signing in.</p></section>
    <aside className="space-y-5 rounded-2xl md:order-1 border border-orange-100 bg-orange-50 p-6"><h2 className="text-xl font-bold text-[#0B1C4D]">Your rental, step by step</h2><ol className="list-decimal space-y-3 pl-5 text-sm text-slate-700"><li>Choose a vehicle and dates, then submit your booking request.</li><li>Complete the required checks with Movara, including physical identity and document clearance and a manually signed contract at handover.</li><li>Once every stage is approved, pay the rental amount and security deposit. Movara verifies payment before releasing the vehicle.</li></ol><div className="rounded-xl bg-white p-4"><h3 className="font-bold text-[#0B1C4D]">Pay only after clearance</h3><p className="mt-2 text-sm text-slate-700">{rentalTerms.payment}</p><p className="mt-2 text-sm text-slate-600">Creating an account or submitting a request requires no payment and does not reserve a vehicle.</p></div><p className="text-sm text-slate-700">Drivers must be 22+ with a licence held for at least two years. Every vehicle requires guarantor and next-of-kin details. International phone numbers are welcome.</p><p className="text-sm text-slate-700">Need help? <a href={`https://wa.me/${siteConfig.whatsapp}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-800 underline">WhatsApp Movara</a> or <a href={`tel:+${siteConfig.whatsapp}`} className="underline">call {siteConfig.phone}</a>.</p><Link href="/cars" className="inline-block text-sm font-semibold text-orange-800 underline">Browse vehicles</Link></aside></div>
  </main>;
}
