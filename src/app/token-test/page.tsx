"use client";

import {
  useAccessToken,
  useAuth,
} from "@workos-inc/authkit-nextjs/components";
import { useEffect, useState } from "react";

type TokenClaims = {
  iss?: string;
  aud?: string | string[];
  sub?: string;
  exp?: number;
  iat?: number;
};

function decodeJwtPayload(token: string): TokenClaims {
  const payload = token.split(".")[1];

  if (!payload) {
    throw new Error("Invalid JWT token format");
  }

  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );

  const json = atob(padded);
  return JSON.parse(json);
}

export default function TokenTestPage() {
  const { user, loading } = useAuth();
  const { getAccessToken } = useAccessToken();

  const [claims, setClaims] = useState<TokenClaims | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function run() {
      try {
        setError("");

        const token = await getAccessToken();

        if (!token) {
          setClaims(null);
          return;
        }

        const decoded = decodeJwtPayload(token);

        setClaims({
          iss: decoded.iss,
          aud: decoded.aud,
          sub: decoded.sub,
          exp: decoded.exp,
          iat: decoded.iat,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    }

    if (!loading && user) {
      run();
    }
  }, [loading, user, getAccessToken]);

  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <section className="mx-auto max-w-3xl rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-black text-[#0A1628]">
          WorkOS Token Claims Test
        </h1>

        <pre className="mt-6 overflow-auto rounded-2xl bg-slate-950 p-5 text-sm text-white">
          {JSON.stringify(
            {
              loading,
              userEmail: user?.email ?? null,
              claims,
              error,
            },
            null,
            2,
          )}
        </pre>
      </section>
    </main>
  );
}