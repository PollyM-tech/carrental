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

  function handleMobileSearchClick() {
    setSearchOpen((current) => !current);
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

  function closeNotifications() {
    setNotificationsOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#06142A] shadow-sm transition hover:border-[#1E6FD9]/30 hover:bg-slate-50 active:scale-95 sm:h-11 sm:w-11 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>
          )}

          <div className="min-w-0">
            <h1 className="truncate text-base font-black tracking-[-0.03em] text-[#06142A] sm:text-xl lg:text-2xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-0.5 hidden max-w-xs truncate text-xs font-semibold leading-5 text-slate-500 sm:block sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Search bar: visible from lg: up so laptops get quick search, not just xl: */}
        <div className="relative hidden w-full max-w-md lg:block lg:max-w-lg xl:max-w-xl">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition focus-within:border-[#1E6FD9] focus-within:ring-4 focus-within:ring-[#1E6FD9]/10 sm:gap-3 sm:px-4 sm:py-3">
            <Search
              size={18}
              className="shrink-0 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={searchValue}
              onFocus={handleSearchFocus}
              onChange={(event) => {
                setSearchValue(event.target.value);
                setSearchOpen(true);
              }}
              placeholder="Search cars, bookings, customers..."
              aria-label="Search cars, bookings, customers"
              className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />

            {searchValue ? (
              <button
                type="button"
                onClick={closeSearch}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            ) : (
              <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-black text-slate-500">
                ⌘ K
              </span>
            )}
          </div>

          {searchOpen && searchValue.trim() && (
            <div
              role="dialog"
              aria-label="Search results"
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[26rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10"
            >
              <SearchResultsPanel
                hasSearchResults={hasSearchResults}
                searchResults={searchResults}
                closeSearch={closeSearch}
              />
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={handleMobileSearchClick}
            aria-label="Search"
            aria-expanded={searchOpen}
            aria-haspopup="dialog"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#06142A] shadow-sm transition hover:border-[#1E6FD9]/30 hover:bg-slate-50 active:scale-95 sm:h-11 sm:w-11 lg:hidden"
          >
            <Search size={19} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label={`Notifications${pendingBookings.length > 0 ? `, ${pendingBookings.length} pending` : ""}`}
              aria-expanded={notificationsOpen}
              aria-haspopup="dialog"
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-[#06142A] shadow-sm transition hover:border-[#1E6FD9]/30 hover:bg-slate-50 active:scale-95 sm:h-11 sm:w-11"
            >
              <Bell size={20} />

              {pendingBookings.length > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-black text-white ring-2 ring-white"
                >
                  {pendingBookings.length}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div
                role="dialog"
                aria-label="Notifications"
                className="fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-96"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5">
                  <div>
                    <p className="text-sm font-black text-slate-950">
                      Notifications
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {pendingBookings.length} pending booking
                      {pendingBookings.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeNotifications}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200 sm:hidden"
                    aria-label="Close notifications"
                  >
                    <X size={16} />
                  </button>
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
                  <div className="max-h-[22rem] overflow-y-auto p-2.5 sm:p-3">
                    {pendingBookings.slice(0, 6).map((booking) => (
                      <Link
                        key={booking._id}
                        href="/dashboard/bookings"
                        onClick={closeNotifications}
                        className="flex gap-3 rounded-xl px-3 py-3 transition hover:bg-orange-50"
                      >
                        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                          <CalendarCheck size={18} aria-hidden="true" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black text-slate-950">
                            New booking from {booking.customerName}
                          </p>

                          <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                            {booking.carName || "Car not selected"} ·{" "}
                            {formatDate(booking.pickupDate)}
                          </p>

                          <p className="mt-1 text-xs font-bold text-[#FF6B00]">
                            Review booking
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div className="border-t border-slate-100 p-2.5 sm:p-3">
                  <Link
                    href="/dashboard/bookings"
                    onClick={closeNotifications}
                    className="flex w-full items-center justify-center rounded-xl bg-[#06142A] px-4 py-3 text-sm font-black text-white transition hover:bg-[#FF6B00]"
                  >
                    View all bookings
                  </Link>
                </div>
              </div>
            )}
          </div>

          <div className="hidden items-center gap-2.5 border-l border-slate-200 pl-2.5 md:flex md:gap-3 md:pl-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#06142A] text-sm font-black text-white"
              aria-hidden="true"
            >
              AU
            </div>

            <div className="hidden lg:block">
              <p className="text-sm font-black leading-tight text-[#06142A]">
                Admin User
              </p>
              <p className="text-xs font-semibold leading-tight text-slate-500">
                Administrator
              </p>
            </div>

            <ChevronDown
              size={18}
              className="hidden text-slate-400 lg:block"
              aria-hidden="true"
            />
          </div>

          <button
            type="button"
            onClick={handleLogout}
            aria-label="Log out"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#06142A] text-white transition hover:bg-[#FF6B00] active:scale-95 sm:h-11 sm:w-11"
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>

      {/* Mobile / tablet full-width search overlay (below lg:) */}
      {searchOpen && (
        <div
          role="dialog"
          aria-label="Search"
          className="fixed inset-x-3 top-[4.25rem] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:hidden"
        >
          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
            <Search
              size={19}
              className="shrink-0 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="text"
              value={searchValue}
              autoFocus
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              placeholder="Search cars, bookings..."
              aria-label="Search cars, bookings, customers"
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              onClick={closeSearch}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              aria-label="Close search"
            >
              <X size={16} />
            </button>
          </div>

          {searchValue.trim() ? (
            <SearchResultsPanel
              hasSearchResults={hasSearchResults}
              searchResults={searchResults}
              closeSearch={closeSearch}
            />
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm font-black text-slate-950">
                Search admin records
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                Search by customer, car, phone, email, or location.
              </p>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function SearchResultsPanel({
  hasSearchResults,
  searchResults,
  closeSearch,
}: {
  hasSearchResults: boolean;
  searchResults: {
    cars: CarWithDisplayImage[];
    bookings: BookingWithCar[];
  };
  closeSearch: () => void;
}) {
  if (!hasSearchResults) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm font-black text-slate-950">No results found</p>
        <p className="mt-1 text-xs font-semibold text-slate-500">
          Try searching by car name, customer name, phone, or location.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[24rem] overflow-y-auto p-2.5 sm:p-3">
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1E6FD9]">
                <Car size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">
                  {car.name}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {car.category} · KSh {car.pricePerDay.toLocaleString()}/day ·{" "}
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
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <CalendarCheck size={18} aria-hidden="true" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-slate-950">
                  {booking.customerName}
                </p>
                <p className="truncate text-xs font-semibold text-slate-500">
                  {booking.carName || "Car not selected"} · {booking.status} ·{" "}
                  {formatDate(booking.pickupDate)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
