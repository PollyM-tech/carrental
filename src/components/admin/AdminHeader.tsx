"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Car, LogOut, Menu, ShieldCheck } from "lucide-react";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export default function AdminHeader({
  title = "Admin Dashboard",
  subtitle = "Manage MoBri Car Hire operations.",
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("mobri_admin_token");
    router.push("/admin-login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>
          )}

          <Link
            href="/dashboard"
            className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-lg shadow-orange-600/20 sm:flex"
            aria-label="Go to admin dashboard"
          >
            <Car size={24} />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-[-0.03em] text-slate-950 sm:text-2xl">
                {title}
              </h1>

              <span className="hidden items-center gap-1 rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-700 sm:inline-flex">
                <ShieldCheck size={14} />
                Admin
              </span>
            </div>

            <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500 sm:text-sm">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100 md:inline-flex"
          >
            View Website
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:bg-orange-700"
          >
            <LogOut size={17} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
