"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Search } from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BookingsTable from "@/components/admin/BookingsTable";

type BookingStatus =
  | "all"
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

type BookingWithCar = Doc<"bookings"> & {
  carImageUrl?: string | null;
};

const filters: { label: string; value: BookingStatus }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function DashboardBookingsPage() {
  const router = useRouter();

  const [adminToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mobri_admin_token");
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingStatus>("all");

  useEffect(() => {
    if (!adminToken) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  const bookings = useQuery(
    api.bookings.listAll,
    adminToken
      ? {
          adminToken,
          status: filter === "all" ? undefined : filter,
        }
      : "skip",
  ) as BookingWithCar[] | undefined;

  const filteredBookings = useMemo(() => {
    const value = search.trim().toLowerCase();

    return (bookings ?? []).filter((booking) => {
      return (
        !value ||
        booking.customerName.toLowerCase().includes(value) ||
        booking.customerPhone?.toLowerCase().includes(value) ||
        booking.customerEmail?.toLowerCase().includes(value) ||
        booking.carName?.toLowerCase().includes(value) ||
        booking.pickupLocation?.toLowerCase().includes(value) ||
        booking.returnLocation?.toLowerCase().includes(value)
      );
    });
  }, [bookings, search]);

  if (!adminToken) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Redirecting to admin login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] lg:flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader
          title="Bookings Management"
          subtitle="Review customer booking requests and update booking status."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1420px]">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
                  Admin Bookings
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Bookings Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  View new booking requests, confirm reservations, activate
                  rentals, cancel requests, and mark bookings as completed.
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <CalendarCheck size={24} />
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by customer, phone, email, car, or location..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 xl:flex-wrap xl:overflow-visible xl:pb-0">
                {filters.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`shrink-0 rounded-xl px-4 py-3 text-xs font-black transition ${
                      filter === item.value
                        ? "bg-orange-600 text-white"
                        : "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              {bookings === undefined ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-sm font-bold text-slate-500">
                    Loading bookings...
                  </p>
                </div>
              ) : (
                <BookingsTable bookings={filteredBookings} />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
