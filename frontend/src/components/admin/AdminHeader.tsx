
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  ExternalLink,
  LogOut,
  Menu,
  Search,
  UserRound,
} from "lucide-react";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

export default function AdminHeader({
  title = "Dashboard",
  subtitle,
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("movara_admin_token");

    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu and page information */}
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              aria-label="Open admin navigation"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-[#0B1C4D] transition hover:bg-slate-50 lg:hidden"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-[#0B1C4D] sm:text-xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-0.5 hidden max-w-md truncate text-xs text-slate-500 sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Center: Search will be enabled when Django is ready */}
        <div className="hidden max-w-md flex-1 lg:block">
          <div
            aria-label="Admin search unavailable until backend is connected"
            className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-slate-400"
          >
            <Search size={17} aria-hidden="true" />

            <span className="truncate text-[13px]">
              Search cars, bookings, customers...
            </span>

            <span className="ml-auto shrink-0 text-[10px]">
              Coming soon
            </span>
          </div>
        </div>

        {/* Right: Website, notifications and account */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Open public website"
            title="View website"
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-[13px] font-medium text-slate-600 transition hover:border-[#FF7A00] hover:text-[#0B1C4D] sm:flex"
          >
            <ExternalLink size={16} aria-hidden="true" />
            <span className="hidden xl:inline">
              View Website
            </span>
          </Link>

          <span
            aria-label="Booking notifications are unavailable until Django is connected"
            title="Notifications will be enabled with Django"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-400"
          >
            <Bell size={19} aria-hidden="true" />
          </span>

          <div className="hidden h-8 w-px bg-slate-200 sm:block" />

          <div className="hidden items-center gap-2.5 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F8FF] text-[#0B1C4D]">
              <UserRound size={18} aria-hidden="true" />
            </div>

            <div className="hidden leading-tight md:block">
              <p className="text-[13px] font-semibold text-[#0B1C4D]">
                Administrator
              </p>
              <p className="text-[11px] text-slate-500">
                Movara Car Hire
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
