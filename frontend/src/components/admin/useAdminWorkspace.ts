"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
export function useAdminWorkspace() {
  const overview = useQuery(api.accounts.adminOverview);
  const { signOut } = useAuthActions(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function run(action: () => Promise<void>) {
    setBusy(true); setMessage("");
    try { await action(); }
    catch (e) { const raw = e instanceof Error ? e.message : "Please retry."; setMessage(raw.match(/Uncaught Error: ([^\n]+)/)?.[1] ?? raw); }
    finally { setBusy(false); }
  }
  const session = overview ? { access: overview, availablePaths: overview.availablePaths, signingOut: busy, onSignOut: () => void run(async () => { await signOut(); router.replace("/movara-access"); router.refresh(); }) } : undefined;
  return { overview, session, busy, message, setMessage, run };
}
