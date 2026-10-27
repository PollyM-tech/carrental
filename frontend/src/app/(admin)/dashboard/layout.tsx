import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConvexAuthNextjsServerProvider, convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import ConvexClientProvider from "@/components/auth/ConvexClientProvider";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/movara-access");
  const account = await fetchQuery(api.accounts.current, {}, { token });
  if (!account) redirect("/movara-access");
  if (!account.staff) redirect("/workspace");
  return <ConvexAuthNextjsServerProvider><ConvexClientProvider>{children}</ConvexClientProvider></ConvexAuthNextjsServerProvider>;
}
