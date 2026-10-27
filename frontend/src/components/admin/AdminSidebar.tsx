
"use client";

import { useEffect, useState } from "react";
import { workflow } from "@/lib/workflow";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  CarFront,
  ExternalLink,
  LayoutDashboard,
  Settings,
  X,
} from "lucide-react";

type AdminSidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
  providedAccess?: { owner: boolean; roles: readonly string[] };
  availablePaths?: readonly string[];
};

const navLinks = [
  { label: "Data requests", href: "/dashboard/data-requests", icon: Settings },
  { label: "Payments", href: "/dashboard/payments", icon: CalendarDays },
  { label: "Payment policy", href: "/dashboard/payment-settings", icon: Settings },
  { label: "Fleet compliance", href: "/dashboard/fleet", icon: CarFront },
  { label: "Approved policies", href: "/dashboard/policies", icon: Settings },
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Manage Cars",
    href: "/dashboard/cars",
    icon: CarFront,
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
  providedAccess,
  availablePaths,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [legacyAccess, setAccess] = useState<{ owner: boolean; roles: string[] } | null>(null);
  useEffect(() => { if (providedAccess) return; void workflow<{ owner: boolean; roles: string[] }>("workflow/access/", { staff: true }).then(setAccess).catch(() => {}); }, [providedAccess]);
  const access = providedAccess ?? legacyAccess;
  function visible(href: string) {
    if (access?.owner) return true;
    if (["/dashboard/team", "/dashboard/audit", "/dashboard/policies", "/dashboard/settings", "/dashboard/payment-settings", "/dashboard/data-requests"].includes(href)) return false;
    if (["/dashboard/cars", "/dashboard/fleet"].includes(href)) return access?.roles.includes("fleet_manager");
    if (href === "/dashboard/payments") return access?.roles.includes("finance");
    if (href === "/dashboard/bookings") return access?.roles.some(role => ["front_desk", "finance", "kyc_reviewer"].includes(role));
    if (href === "/dashboard/phone-verification") return access?.roles.includes("kyc_reviewer");
    if (href === "/dashboard/kyc") return access?.roles.includes("kyc_reviewer");
    return true;
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        aria-label="Admin sidebar"
        aria-hidden={!isOpen ? undefined : undefined}
        className={`fixed inset-y-0 left-0 z-50 w-[82vw] max-w-[260px] border-r border-white/10 bg-[#0B1C4D] text-white shadow-xl transition-transform duration-300 lg:sticky lg:top-0 lg:z-30 lg:h-dvh lg:w-[250px] lg:max-w-none lg:translate-x-0 lg:shadow-none ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {/* Branding */}
          <div className="flex min-h-[88px] items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <Link
              href="/dashboard"
              onClick={onClose}
              aria-label="Movara admin dashboard"
              className="flex min-w-0 items-center gap-3"
            >
              <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image
                  src="/logo.png"
                  alt="Movara Car Hire logo"
                  fill
                  sizes="44px"
                  className="object-contain p-1"
                />
              </div>

              <div className="min-w-0 leading-tight">
                <p className="truncate text-[17px] font-bold tracking-tight">
                  Movara
                </p>

                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.13em] text-orange-300">
                  Admin Dashboard
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close admin menu"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20 lg:hidden"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </div>

          {/* Main navigation */}
          <div className="px-4 pb-2 pt-7">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400">
              MAIN MENU
            </p>
          </div>

          <nav
            aria-label="Admin navigation"
            className="flex-1 space-y-1 px-3 py-3"
          >
            {navLinks.filter(link => visible(link.href) && (!availablePaths || availablePaths.includes(link.href))).map((link) => {
              const Icon = link.icon;

              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" &&
                  pathname.startsWith(`${link.href}/`));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={
                    isActive ? "page" : undefined
                  }
                  className={`relative flex min-h-11 items-center gap-3 rounded-lg px-3.5 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF7A00] ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-[#FF7A00]"
                    />
                  )}

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={
                      isActive
                        ? "text-[#FF7A00]"
                        : "text-slate-400"
                    }
                  />

                  <span className="truncate">
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom area */}
          <div className="border-t border-white/10 px-4 py-5">
            <Link
              href="/"
              onClick={onClose}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-[13px] font-medium text-slate-200 transition-colors hover:bg-white/10"
            >
              <span>View Website</span>
              <ExternalLink
                size={16}
                aria-hidden="true"
                className="text-orange-300"
              />
            </Link>

            <p className="mt-5 px-1 text-[11px] leading-5 text-slate-400">
              © {new Date().getFullYear()} Movara Car Hire
              <span className="block">
                Admin Management
              </span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
