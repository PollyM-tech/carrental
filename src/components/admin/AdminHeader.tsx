"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CalendarCheck,
  Car,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  X,
} from "lucide-react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type AdminHeaderProps = {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
};

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

type BookingWithCar = Doc<"bookings"> & {
  carImageUrl?: string | null;
};

function subscribeToAdminToken(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAdminTokenSnapshot() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return localStorage.getItem("mobri_admin_token");
}

function getAdminTokenServerSnapshot() {
  return undefined;
}

function formatDate(date?: string) {
  if (!date) return "Date not set";

  try {
    return new Intl.DateTimeFormat("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export default function AdminHeader({
  title = "Dashboard",
  subtitle,
  onMenuClick,
}: AdminHeaderProps) {
  const router = useRouter();

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const [searchValue, setSearchValue] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const cars = useQuery(
    api.cars.listCars,
    typeof adminToken === "string" ? { adminToken } : "skip",
  ) as CarWithDisplayImage[] | undefined;

  const bookings = useQuery(
    api.bookings.listAll,
    typeof adminToken === "string" ? { adminToken } : "skip",
  ) as BookingWithCar[] | undefined;

  const pendingBookings = useMemo(() => {
    return (bookings ?? []).filter((booking) => booking.status === "pending");
  }, [bookings]);

  const searchResults = useMemo(() => {
    const value = searchValue.trim().toLowerCase();

    if (!value) {
      return {
        cars: [],
        bookings: [],
      };
    }

    const matchedCars = (cars ?? [])
      .filter((car) => {
        return (
          car.name.toLowerCase().includes(value) ||
          car.category.toLowerCase().includes(value) ||
          car.brand?.toLowerCase().includes(value) ||
          car.model?.toLowerCase().includes(value) ||
          car.location?.toLowerCase().includes(value)
        );
      })
      .slice(0, 5);

    const matchedBookings = (bookings ?? [])
      .filter((booking) => {
        return (
          booking.customerName.toLowerCase().includes(value) ||
          booking.customerPhone?.toLowerCase().includes(value) ||
          booking.customerEmail?.toLowerCase().includes(value) ||
          booking.carName?.toLowerCase().includes(value) ||
          booking.pickupLocation?.toLowerCase().includes(value) ||
          booking.returnLocation?.toLowerCase().includes(value)
        );
      })
      .slice(0, 5);

    return {
      cars: matchedCars,
      bookings: matchedBookings,
    };
  }, [cars, bookings, searchValue]);

  const hasSearchResults =
    searchResults.cars.length > 0 || searchResults.bookings.length > 0;

  function handleLogout() {
    localStorage.removeItem("mobri_admin_token");
    router.push("/admin-login");
  }

  function handleSearchFocus() {
    setSearchOpen(true);
    setNotificationsOpen(false);
  }

  function handleNotificationClick() {
    setNotificationsOpen((current) => !current);
    setSearchOpen(false);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchValue("");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#06142A] shadow-sm transition hover:bg-slate-50 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>
          )}

          <div>
            <h1 className="truncate text-xl font-black tracking-[-0.04em] text-[#06142A] sm:text-2xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-1 hidden max-w-xs text-sm font-semibold leading-6 text-slate-500 md:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="relative hidden w-full max-w-xl xl:block">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-blue-200 focus-within:ring-4 focus-within:ring-blue-50">
            <Search size={19} className="text-slate-400" />

            <input
              type="text"
              value={searchValue}
              onFocus={handleSearchFocus}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search cars, bookings, customers..."
              className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searchValue ? (
              <button
                type="button"
                onClick={closeSearch}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-500">
                ⌘ K
              </span>
            )}
          </div>

          {searchOpen && searchValue.trim() && (
            <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
              {!hasSearchResults ? (
                <div className="p-5 text-center">
                  <p className="text-sm font-black text-slate-950">
                    No results found
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Try searching by car name, customer name, phone, or
                    location.
                  </p>
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto p-3">
                  {searchResults.cars.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                        Cars
                      </p>

                      {searchResults.cars.map((car) => (
                        <Link
                          key={car._id}
                          href="/dashboard/cars"
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Car size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-slate-950">
                              {car.name}
                            </p>
                            <p className="truncate text-xs font-semibold text-slate-500">
                              {car.category} · KSh{" "}
                              {car.pricePerDay.toLocaleString()}/day ·{" "}
                              {car.status}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.bookings.length > 0 && (
                    <div className="mt-2">
                      <p className="px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400">
                        Bookings
                      </p>

                      {searchResults.bookings.map((booking) => (
                        <Link
                          key={booking._id}
                          href="/dashboard/bookings"
                          onClick={closeSearch}
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-slate-50"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                            <CalendarCheck size={18} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-slate-950">
                              {booking.customerName}
                            </p>
                            <p className="truncate text-xs font-semibold text-slate-500">
                              {booking.carName || "Car not selected"} ·{" "}
                              {booking.status} ·{" "}
                              {formatDate(booking.pickupDate)}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5">
          <div className="relative">
            <button
              type="button"
              onClick={handleNotificationClick}
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-[#06142A] shadow-sm transition hover:bg-slate-50"
              aria-label="Notifications"
            >
              <Bell size={20} />

              {pendingBookings.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-black text-white">
                  {pendingBookings.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-14 z-50 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:w-[380px]">
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="text-sm font-black text-slate-950">
                    Notifications
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {pendingBookings.length} pending booking
                    {pendingBookings.length === 1 ? "" : "s"}
                  </p>
                </div>

                {pendingBookings.length === 0 ? (
                  <div className="p-5 text-center">
                    <p className="text-sm font-black text-slate-950">
                      No new booking requests
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      New customer bookings will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[360px] overflow-y-auto p-3">
                    {pendingBookings.slice(0, 6).map((booking) => (
                      <Link
                        key={booking._id}
                        href="/dashboard/bookings"
                        onClick={() => setNotificationsOpen(false)}
                        className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-orange-50"
                      >
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <CalendarCheck size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-950">
                            New booking from {booking.customerName}
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {booking.carName || "Car not selected"} ·{" "}
                            {formatDate(booking.pickupDate)}
                          </p>

                          <p className="mt-1 text-xs font-bold text-orange-600">
                            Review booking
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 p-3">
                  <Link
                    href="/dashboard/bookings"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl bg-[#06142A] px-4 py-3 text-sm font-black text-white transition hover:bg-[#FF6B00]"
                  >
                    View all bookings
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06142A] text-sm font-black text-white">
              AU
            </div>

            <div>
              <p className="text-sm font-black text-[#06142A]">Admin User</p>
              <p className="text-xs font-semibold text-slate-500">
                Administrator
              </p>
            </div>

            <ChevronDown size={18} className="text-[#06142A]" />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#06142A] text-white transition hover:bg-[#FF6B00]"
            aria-label="Logout"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </header>
  );
}
