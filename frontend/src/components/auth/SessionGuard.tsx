"use client";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
export default function SessionGuard({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useConvexAuth(); const { signOut } = useAuthActions();
  const status = useQuery(api.security.status, isAuthenticated ? {} : "skip"); const touch = useMutation(api.security.touch);
  const router = useRouter(); const pathname = usePathname();
  const [now, setNow] = useState(() => Date.now()); const [ending, setEnding] = useState(false); const [error, setError] = useState("");
  const lastSent = useRef(0); const inFlight = useRef(false); const endingRef = useRef(false); const stayButton = useRef<HTMLButtonElement>(null);
  const expired = isAuthenticated && (status === null || (!!status && now >= status.expiresAt));
  const warning = isAuthenticated && !!status && now >= status.warningAt && now < status.expiresAt;
  const logout = useCallback(async (broadcast = true) => {
    if (endingRef.current) return; endingRef.current = true; setEnding(true); setError("");
    if (broadcast) { try { localStorage.setItem("movara:logout", String(Date.now())); } catch { /* Storage may be disabled. */ } }
    try { await signOut(); router.replace(pathname.startsWith("/dashboard") || pathname === "/movara-access" ? "/movara-access" : "/sign-in"); router.refresh(); }
    catch { setError("Your session has ended. Reconnect and select Sign out to continue securely."); }
    finally { endingRef.current = false; setEnding(false); }
  }, [signOut, router, pathname]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const tick = () => setNow(Date.now()); const timer = setInterval(tick, 1000);
    window.addEventListener("focus", tick); document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(timer); window.removeEventListener("focus", tick); document.removeEventListener("visibilitychange", tick); };
  }, [isAuthenticated]);
  useEffect(() => { if (!expired || error) return; const timer = setTimeout(() => { void logout(); }, 0); return () => clearTimeout(timer); }, [expired, error, logout]);
  useEffect(() => {
    const receive = (event: StorageEvent) => { if (event.key === "movara:logout" && isAuthenticated) void logout(false); };
    window.addEventListener("storage", receive); return () => window.removeEventListener("storage", receive);
  }, [isAuthenticated, logout]);
  useEffect(() => {
    if (!isAuthenticated || !status || expired || warning) return;
    let pending = false;
    const persist = async () => {
      if (!pending || inFlight.current || document.visibilityState !== "visible") return;
      pending = false; inFlight.current = true; lastSent.current = Date.now();
      try { const result = await touch({}); if (!result) void logout(); } catch { /* The server deadline still applies while offline. */ }
      finally { inFlight.current = false; }
    };
    const activity = () => { pending = true; if (Date.now() - lastSent.current >= 15000) void persist(); };
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    for (const name of events) window.addEventListener(name, activity, { passive: true });
    const timer = setInterval(() => { void persist(); }, 15000);
    return () => { clearInterval(timer); for (const name of events) window.removeEventListener(name, activity); };
  }, [isAuthenticated, status, expired, warning, touch, logout]);
  useEffect(() => {
    if (!warning) return; const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stayButton.current?.focus(); return () => previous?.focus();
  }, [warning]);
  if (isAuthenticated && (status === undefined || expired || ending || error)) return <main className="mx-auto max-w-lg space-y-4 p-10 text-center"><p>{error || (expired ? "Your session has expired. Signing out…" : "Checking your session…")}</p>{error && <button className="font-bold underline" onClick={() => void logout()}>Sign out</button>}</main>;
  return <>{!isLoading && children}{warning && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4"><section role="alertdialog" aria-modal="true" aria-labelledby="session-warning-title" aria-describedby="session-warning-description" className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl" onKeyDown={event => { if (event.key === "Tab") { const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>("button"); const first = buttons[0], last = buttons[buttons.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }}><h2 id="session-warning-title" className="text-xl font-bold text-[#0B1C4D]">Are you still there?</h2><p id="session-warning-description">You have been inactive for 30 minutes. For your security, you will be signed out in {Math.max(0, Math.ceil((status!.expiresAt - now) / 1000))} seconds.</p><div className="flex flex-wrap gap-3"><button ref={stayButton} className="rounded-xl bg-orange-600 px-4 py-3 font-bold text-white" onClick={async () => { try { const result = await touch({}); if (!result) await logout(); } catch { setError("Unable to renew your session. Reconnect and sign out before continuing."); } }}>Stay signed in</button><button className="rounded-xl border px-4 py-3 font-bold" onClick={() => void logout()}>Sign out</button></div></section></div>}</>;
}
