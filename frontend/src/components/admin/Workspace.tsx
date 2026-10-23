"use client";
import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
export default function Workspace({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return <div className="flex min-h-screen bg-slate-50"><AdminSidebar isOpen={open} onClose={() => setOpen(false)} /><div className="min-w-0 flex-1"><AdminHeader title={title} onMenuClick={() => setOpen(true)} /><main className="space-y-6 p-4 sm:p-8">{children}</main></div></div>;
}
