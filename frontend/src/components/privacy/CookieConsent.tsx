"use client";
import { tagManagerId } from "@/lib/analytics";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { consentCookie, readCookieChoice, type CookieChoice } from "@/lib/cookie-consent";
function subscribe(callback: () => void) {
  window.addEventListener("movara:cookie-choice", callback);
  window.addEventListener("focus", callback);
  return () => { window.removeEventListener("movara:cookie-choice", callback); window.removeEventListener("focus", callback); };
}
export default function CookieConsent() {
  const choice = useSyncExternalStore(subscribe, () => { try { return readCookieChoice(document.cookie); } catch { return "unknown" as CookieChoice; } }, () => "unknown" as CookieChoice);
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    const open = () => setEditing(true);
    window.addEventListener("movara:open-cookie-settings", open);
    return () => window.removeEventListener("movara:open-cookie-settings", open);
  }, []);
  const [memoryChoice, setMemoryChoice] = useState<CookieChoice>("unknown");
  function save(value: "accepted" | "declined") {
    try { document.cookie = consentCookie(value, window.location.protocol === "https:"); } catch { /* Respect the choice in memory if browser storage is blocked. */ }
    setMemoryChoice(value); setEditing(false);
    window.dispatchEvent(new Event("movara:cookie-choice"));
  }
  const visible = editing || (choice === "unknown" && memoryChoice === "unknown");
  return <>{visible ? <section aria-labelledby="cookie-preferences-title" className="fixed inset-x-3 bottom-24 z-[80] mx-auto max-h-[calc(100dvh-7rem)] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:bottom-5 sm:left-5 sm:right-auto">
    <h2 id="cookie-preferences-title" className="font-bold text-[#0B1C4D]">Cookies on Movara Car Hire</h2><p className="mt-2 text-sm leading-6 text-slate-600">Essential cookies keep your account secure and allow email and Google sign-in. You can accept or decline optional cookies. Your choice does not prevent signing in. Google manages cookies on its own sign-in pages.</p><p className="mt-1 text-xs text-slate-500">{tagManagerId ? "With your permission, Google Tag Manager loads analytics tags to help us measure website visits and booking enquiries. Advertising cookies are not enabled." : "No optional analytics or advertising cookies are currently enabled."} <Link href="/privacy" className="underline">Privacy and cookies</Link></p>
    <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => save("accepted")} className="rounded-xl border border-[#0B1C4D] bg-[#0B1C4D] px-5 py-2.5 text-sm font-semibold text-white">Accept analytics cookies</button><button type="button" onClick={() => save("declined")} className="rounded-xl border border-[#0B1C4D] px-5 py-2.5 text-sm font-semibold text-[#0B1C4D]">Essential cookies only</button></div>
  </section> : <button type="button" onClick={() => setEditing(true)} className="fixed bottom-3 left-3 z-30 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 shadow-sm">Cookie settings</button>}</>;
}
