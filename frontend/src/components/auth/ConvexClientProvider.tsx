"use client";
import SessionGuard from "./SessionGuard";
import { useState, type ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const url = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is required.");
    return new ConvexReactClient(url);
  });
  return <ConvexAuthNextjsProvider client={client}><SessionGuard>{children}</SessionGuard></ConvexAuthNextjsProvider>;
}
