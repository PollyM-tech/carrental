"use client";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
export type WorkspaceAccess = { owner: boolean; roles: readonly string[] };
export default function Workspace({ title, children, session }: {
  title: string; children: React.ReactNode;
  session?: { access: WorkspaceAccess; availablePaths: readonly string[]; onSignOut: () => void; signingOut: boolean };
}) {
  const [open, setOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50"><AdminSidebar isOpen={open} onClose={() => setOpen(false)} providedAccess={session?.access} availablePaths={session?.availablePaths} /><div className="min-w-0 flex-1"><AdminHeader title={title} onMenuClick={() => setOpen(true)} onSignOut={session?.onSignOut} signingOut={session?.signingOut} /><main className="space-y-6 p-4 sm:p-8">{children}</main></div></div>;
}
