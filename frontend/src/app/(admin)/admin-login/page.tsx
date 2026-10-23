"use client";

import { useState } from "react";
import { useMutation } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import Image from "next/image";

import { api } from "@/lib/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useMutation(api.admin.login);
  const verify = useMutation(api.admin.verify);
  const [challenge, setChallenge] = useState<{ challenge: string; secret?: string } | null>(null);
  const [code, setCode] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      if (challenge) {
        const result = await verify({ challenge: challenge.challenge, code });
        localStorage.setItem("movara_admin_token", result.token);
        router.push("/dashboard");
      } else {
        setChallenge(await login({ email, password }));
        setPassword("");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Invalid admin password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="mx-auto flex flex-col items-center gap-3">
          <Image
            src="/logo.png"
            alt="Movara Car Hire logo"
            width={112}
            height={112}
            priority
            className="h-28 w-28 object-contain"
          />
          <p className="text-xl font-bold tracking-tight text-[#0B1C4D]">
            Movara <span className="text-[#E86D00]">Car Hire</span>
          </p>
        </div>

        <h1 className="mt-6 text-center text-3xl font-black tracking-[-0.04em] text-slate-950">
          Admin Login
        </h1>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Enter your staff email and password to manage Movara Car Hire.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
          {challenge ? <div className="space-y-4">
            {challenge.secret && <div className="rounded-xl bg-orange-50 p-4 text-sm">
              <p>Add a new account in your authenticator app using this setup key. Keep it private.</p>
              <code className="mt-3 block break-all select-all">{challenge.secret}</code>
            </div>}
            <label className="block font-bold">Authenticator code
              <input required autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6}" value={code} onChange={e => setCode(e.target.value)} className="mt-2 h-12 w-full rounded-xl border px-4" />
            </label>
            <button type="button" className="text-sm underline" onClick={() => { setChallenge(null); setCode(""); }}>Start again</button>
          </div> : <>
          <label className="mb-4 block text-sm font-bold">
            Staff email
            <input type="email" required autoComplete="username" value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-slate-300 px-4" />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">
              Admin Password
            </span>

            <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-300 px-4 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-100">
              <Lock size={18} className="text-slate-400" />

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
              />
            </div>
          </label>

          </>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-12 w-full rounded-xl bg-orange-600 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Checking…" : challenge ? "Verify and sign in" : "Continue"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="mt-4 w-full rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
        >
          Back to Website
        </button>
      </div>
    </main>
  );
}
