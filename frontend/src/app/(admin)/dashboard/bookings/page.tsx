"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  Search,
  XCircle,
} from "lucide-react";

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
  { label: "All Bookings", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Active", value: "active" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

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

export default function DashboardBookingsPage() {
  const router = useRouter();

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<BookingStatus>("all");

  useEffect(() => {
    if (adminToken === null) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  const bookings = useQuery(
    api.bookings.listAll,
    typeof adminToken === "string"
      ? {
          adminToken,
          status: filter === "all" ? undefined : filter,
        }
      : "skip",
  ) as BookingWithCar[] | undefined;

  const bookingStats = useMemo(() => {
    const list = bookings ?? [];

    return {
      total: list.length,
      pending: list.filter((booking) => booking.status === "pending").length,
      confirmed: list.filter((booking) => booking.status === "confirmed")
        .length,
      active: list.filter((booking) => booking.status === "active").length,
      completed: list.filter((booking) => booking.status === "completed")
        .length,
      cancelled: list.filter((booking) => booking.status === "cancelled")
        .length,
    };
  }, [bookings]);

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

  if (adminToken === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  if (adminToken === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Redirecting to admin login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#06142A] lg:flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader
          title="Bookings"
          subtitle="Review requests, confirm reservations, and manage rental status."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Bookings Management
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  View customer booking requests, confirm reservations, activate
                  rentals, cancel requests, and mark completed bookings.
                </p>
              </div>
            </div>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Bookings"
                value={bookingStats.total}
                description="All customer requests"
                icon={CalendarCheck}
              />

              <StatCard
                title="Pending"
                value={bookingStats.pending}
                description="Needs review"
                icon={Clock}
              />

              <StatCard
                title="Confirmed"
                value={bookingStats.confirmed}
                description={`${bookingStats.active} active rentals`}
                icon={CheckCircle2}
              />

              <StatCard
                title="Completed"
                value={bookingStats.completed}
                description={`${bookingStats.cancelled} cancelled requests`}
                icon={XCircle}
              />
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-xl font-black text-[#06142A]">
                    Bookings List
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Showing{" "}
                    <span className="font-black text-[#06142A]">
                      {filteredBookings.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-[#06142A]">
                      {bookings?.length ?? 0}
                    </span>{" "}
                    bookings.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
                  {filters.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setFilter(item.value)}
                      className={`shrink-0 rounded-xl px-4 py-3 text-xs font-black transition ${
                        filter === item.value
                          ? "bg-[#1E6FD9] text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-[#1E6FD9]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by customer, phone, email, car, pickup location, or return location..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {bookings === undefined ? (
                <div className="rounded-xl bg-slate-50 p-10 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    Loading bookings...
                  </p>
                </div>
              ) : (
                <BookingsTable bookings={filteredBookings} />
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
          <Icon size={32} />
        </div>

        <div>
          <p className="text-sm font-black text-slate-700">{title}</p>

          <h3 className="mt-1 text-4xl font-black tracking-[-0.04em] text-[#06142A]">
            {value}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
