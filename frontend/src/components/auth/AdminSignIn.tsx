"use client";
import { isConnectionError } from "@/lib/connection-errors";
import { useEffect, useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";
export default function AdminSignIn() {
  const { signIn, signOut } = useAuthActions(); const { isAuthenticated } = useConvexAuth();
  const account = useQuery(api.accounts.current, isAuthenticated ? {} : "skip"); const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => { if (account?.staff) router.replace("/dashboard"); }, [account, router]);
  return <main className="mx-auto max-w-md space-y-5 px-4 py-16"><p className="font-bold text-orange-700">Movara Car Hire</p><h1 className="text-3xl font-bold text-[#0B1C4D]">Admin sign in</h1><Message message={message} />{isAuthenticated ? <div className="space-y-4"><p>{account?.staff ? "Opening the admin dashboard…" : "This session does not have admin access. Sign out to use the authorized admin account."}</p><button disabled={busy} className="underline" onClick={async () => { setBusy(true); try { await signOut(); } finally { setBusy(false); } }}>Sign out</button></div> : <form className="space-y-4 rounded-2xl border bg-white p-6" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage("");
    try { if (email.trim().toLowerCase() !== "movaracarhire@gmail.com") throw new Error("Unauthorized account"); await signIn("password", { email: email.trim().toLowerCase(), password, flow: "signIn", portal: "admin" }); setPassword(""); }
    catch (error) { setMessage(isConnectionError(error) ? "Unable to reach Movara. Check your connection and try again." : error instanceof Error && error.message.includes("LOGIN_LOCKED") ? "Five failed login attempts. Wait 15 minutes before trying again." : "Unable to sign in. Use the authorized admin email and password."); }
    finally { setBusy(false); }
  }}><Field required label="Admin email" type="email" value={email} onChange={setEmail} /><Field required label="Password" type="password" value={password} onChange={setPassword} /><button disabled={busy} className={buttonStyle}>{busy ? "Signing in…" : "Sign in to admin"}</button></form>}</main>;
}
