"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { Car, Lock } from "lucide-react";

import { api } from "../../../convex/_generated/api";

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useMutation(api.admin.login);

  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const result = await login({
        password,
      });

      localStorage.setItem("mobri_admin_token", result.token);
      router.push("/dashboard");
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
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20">
          <Car size={30} />
        </div>

        <h1 className="mt-6 text-center text-3xl font-black tracking-[-0.04em] text-slate-950">
          Admin Login
        </h1>

        <p className="mt-2 text-center text-sm leading-6 text-slate-500">
          Enter the admin password to manage MoBri Car Hire.
        </p>

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6">
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-12 w-full rounded-xl bg-orange-600 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Logging in..." : "Login"}
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
