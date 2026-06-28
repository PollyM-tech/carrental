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
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 border-r border-white/10 bg-[#06142A] text-white transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="relative flex h-44 items-center justify-center border-b border-white/10">
            <Link href="/dashboard" onClick={onClose}>
              <div className="relative h-28 w-28">
                <Image
                  src="/logo.png"
                  alt="MoBri Car Hire logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20 lg:hidden"
              aria-label="Close admin menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-3 px-4 py-7">
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
                  className={`relative flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-black transition ${
                    isActive
                      ? "bg-[#1E6FD9]/35 text-white shadow-lg shadow-blue-950/20"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 h-10 w-1 -translate-y-1/2 rounded-r-full bg-[#FF6B00]" />
                  )}

                  <Icon
                    size={21}
                    className={isActive ? "text-[#FF6B00]" : "text-white/80"}
                  />

                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 px-4 pb-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Building2 size={20} />
                </div>

                <div>
                  <p className="text-sm font-black">MoBri Car Hire</p>
                  <p className="mt-1 text-xs font-semibold text-white/55">
                    Nairobi, Kenya
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Headphones size={20} />
                </div>

                <div>
                  <p className="text-sm font-black">Need help?</p>
                  <p className="mt-1 text-xs font-bold text-[#1E6FD9]">
                    Contact support
                  </p>
                </div>
              </div>
            </div>

            <p className="px-2 text-xs leading-6 text-white/45">
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
