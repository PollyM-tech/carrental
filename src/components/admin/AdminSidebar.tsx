"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Car,
  Headphones,
  LayoutDashboard,
  Settings,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const links = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Cars",
    href: "/dashboard/cars",
    icon: Car,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  isOpen = false,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        aria-label="Admin navigation"
        className={`fixed left-0 top-0 z-50 h-dvh w-[82vw] max-w-72 border-r border-white/10 bg-[#06142A] text-white shadow-2xl shadow-slate-950/30 transition-transform duration-300 sm:w-72 lg:sticky lg:top-0 lg:z-30 lg:h-dvh lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="relative flex min-h-36 items-center justify-center border-b border-white/10 px-4 py-6 sm:min-h-44">
            <Link
              href="/dashboard"
              onClick={onClose}
              aria-label="Go to dashboard"
              className="rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06142A]"
            >
              <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                <Image
                  src="/logo.png"
                  alt="MoBri Car Hire logo"
                  fill
                  sizes="(min-width: 640px) 112px, 96px"
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06142A] lg:hidden"
              aria-label="Close admin menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav
            aria-label="Main"
            className="flex-1 space-y-2 px-3 py-5 sm:space-y-3 sm:px-4 sm:py-7"
          >
            {links.map((link) => {
              const Icon = link.icon;

              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06142A] sm:py-4 ${
                    isActive
                      ? "bg-[#1E6FD9]/35 text-white shadow-lg shadow-blue-950/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 h-9 w-1 -translate-y-1/2 rounded-r-full bg-[#FF6B00] sm:h-10"
                    />
                  )}

                  <Icon
                    size={21}
                    aria-hidden="true"
                    className={isActive ? "text-[#FF6B00]" : "text-white/80"}
                  />

                  <span className="truncate">{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="space-y-3 px-3 pb-5 sm:space-y-4 sm:px-4 sm:pb-6">
            <Link
              href="/"
              onClick={onClose}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06142A]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Building2 size={20} aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black">Back to website</p>
                  <p className="mt-1 truncate text-xs font-semibold text-white/55">
                    Nairobi, Kenya
                  </p>
                </div>
              </div>
            </Link>

            <Link
              href="/contact"
              onClick={onClose}
              className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 focus-visible:ring-offset-[#06142A]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                  <Headphones size={20} aria-hidden="true" />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-black">Need help?</p>
                  <p className="mt-1 truncate text-xs font-bold text-[#1E6FD9]">
                    Contact support
                  </p>
                </div>
              </div>
            </Link>

            <p className="px-2 text-xs leading-6 text-white/55">
              © 2026 MoBri Car Hire
              <br />
              All rights reserved.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
