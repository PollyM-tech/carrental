import type { Metadata } from "next";
import type { ReactNode } from "react";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import ConnectionProblem from "@/components/auth/ConnectionProblem";
import { isConnectionError, retryConnectionRead } from "@/lib/connection-errors";
import { api } from "../../../../convex/_generated/api";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const token = await convexAuthNextjsToken();
  if (!token) redirect("/movara-access");
  let account;
  try { account = await retryConnectionRead(() => fetchQuery(api.accounts.current, {}, { token })); }
  catch (error) { if (isConnectionError(error)) return <ConnectionProblem />; throw error; }
  if (!account) redirect("/movara-access");
  if (!account.staff) redirect("/workspace");
  return <>{children}</>;
}
