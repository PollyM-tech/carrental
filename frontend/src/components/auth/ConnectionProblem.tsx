"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
export default function ConnectionProblem({ reset }: { reset?: () => void }) {
  const router = useRouter(); const [pending, startTransition] = useTransition();
  return <main className="mx-auto max-w-lg space-y-5 px-4 py-16 text-center"><h1 className="text-2xl font-bold text-[#0B1C4D]">Unable to connect to Movara</h1><p className="text-slate-600">We couldn’t reach the service. Check your connection and try again.</p><button disabled={pending} className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white disabled:opacity-50" onClick={() => startTransition(() => { router.refresh(); reset?.(); })}>{pending ? "Retrying…" : "Try again"}</button></main>;
}
