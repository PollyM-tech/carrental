"use client";

import {
  Authenticated,
  AuthLoading,
  Unauthenticated,
  useQuery,
} from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function AuthTestPage() {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange-600">
          Convex Auth Test
        </p>

        <h1 className="mt-3 text-3xl font-black text-[#0A1628]">
          WorkOS + Convex Connection
        </h1>

        <AuthLoading>
          <p className="mt-6 text-slate-600">Checking authentication...</p>
        </AuthLoading>

        <Unauthenticated>
          <p className="mt-6 rounded-2xl bg-red-50 p-5 text-sm font-bold text-red-700">
            Convex sees you as unauthenticated. Go to /sign-in first, then come
            back here.
          </p>
        </Unauthenticated>

        <Authenticated>
          <CurrentUserBlock />
        </Authenticated>
      </section>
    </main>
  );
}

function CurrentUserBlock() {
  const user = useQuery(api.authTest.currentUser);

  return (
    <pre className="mt-6 overflow-auto rounded-2xl bg-slate-950 p-5 text-sm text-white">
      {JSON.stringify(user, null, 2)}
    </pre>
  );
}