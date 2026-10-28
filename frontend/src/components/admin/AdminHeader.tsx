
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../convex/_generated/api";
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
  onSignOut?: () => void;
  signingOut?: boolean;
};

export default function AdminHeader({
  title = "Dashboard",
  subtitle,
  onMenuClick,
  onSignOut,
  signingOut = false,
}: AdminHeaderProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationsReadAt, setNotificationsReadAt] = useState(0);
  useEffect(() => { const saved = window.localStorage.getItem("movara_admin_notifications_read_at"); if (saved) setNotificationsReadAt(Number(saved)); }, []);
  const vehicles = useQuery(api.vehicles.list);
  const bookings = useQuery(api.bookingRequests.staffList);
  const query = search.trim().toLowerCase();
  const vehicleResults = query ? (vehicles ?? []).filter(vehicle => `${vehicle.name} ${vehicle.registration} ${vehicle.category}`.toLowerCase().includes(query)).slice(0, 5) : [];
  const bookingResults = query ? (bookings ?? []).filter(booking => `${booking.vehiclePreference} ${booking.email} ${booking.phone}`.toLowerCase().includes(query)).slice(0, 5) : [];
  const notificationRows = (bookings ?? []).filter(booking => ["requested", "in_review", "approved", "overdue", "returned"].includes(booking.status));
  const unreadNotifications = notificationRows.filter(booking => booking.updatedAt > notificationsReadAt);
  const notifications = (notificationsOpen ? notificationRows : unreadNotifications).slice(0, 8);

  function handleLogout() {
    if (onSignOut) { onSignOut(); return; }
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
        <div className="relative hidden max-w-md flex-1 lg:block">
          <div className="flex h-10 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-slate-500">
            <Search size={17} aria-hidden="true" /><input aria-label="Search cars, bookings and customers" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search cars, bookings, customers..." className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-slate-400" />
          </div>
          {query && <div className="absolute left-0 right-0 top-12 z-50 space-y-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xl">{vehicleResults.length > 0 && <div><p className="px-2 text-xs font-bold uppercase text-slate-500">Cars</p>{vehicleResults.map(vehicle => <Link key={vehicle._id} href="/dashboard/cars" onClick={() => setSearch("")} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50">{vehicle.name} · {vehicle.registration}</Link>)}</div>}{bookingResults.length > 0 && <div><p className="px-2 text-xs font-bold uppercase text-slate-500">Bookings</p>{bookingResults.map(booking => <Link key={booking._id} href={`/dashboard/bookings/${booking._id}`} onClick={() => setSearch("")} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50">{booking.vehiclePreference} · {booking.email} · {booking.status}</Link>)}</div>}{vehicleResults.length === 0 && bookingResults.length === 0 && <p className="px-2 py-2 text-sm text-slate-500">No matching cars or bookings.</p>}</div>}
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

          <div className="relative">
            <button type="button" onClick={() => { const next = !notificationsOpen; setNotificationsOpen(next); if (next && notifications.length > 0) { const now = Date.now(); setNotificationsReadAt(now); window.localStorage.setItem("movara_admin_notifications_read_at", String(now)); } }} aria-label="Open booking notifications" title="Booking notifications" className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-orange-200 hover:text-orange-700">
              <Bell size={19} aria-hidden="true" />
              {unreadNotifications.length > 0 && <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-orange-600 px-1 text-center text-[10px] font-bold text-white">{unreadNotifications.length}</span>}
            </button>
            {notificationsOpen && <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"><div className="flex items-center justify-between px-2 pb-2"><p className="font-bold text-[#0B1C4D]">Booking notifications</p><button type="button" className="text-xs underline" onClick={() => setNotificationsOpen(false)}>Close</button></div>{notifications.length === 0 ? <p className="px-2 py-3 text-sm text-slate-500">No booking activity.</p> : <div className="max-h-80 space-y-1 overflow-y-auto">{notifications.map(booking => <Link key={booking._id} href={`/dashboard/bookings/${booking._id}`} onClick={() => setNotificationsOpen(false)} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-50"><p className="font-semibold">{booking.vehiclePreference}</p><p className="text-xs text-slate-500">{booking.email} · {booking.status.replaceAll("_", " ")}</p><p className="text-xs text-slate-500">{booking.pickupDate} → {booking.returnDate}</p></Link>)}</div>}<Link href="/dashboard/bookings" onClick={() => setNotificationsOpen(false)} className="mt-2 block border-t px-2 pt-2 text-sm font-semibold text-orange-700 underline">View all bookings</Link></div>}
          </div>

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
            disabled={signingOut}
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
