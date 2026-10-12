"use client";

import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ElementType,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import {
  ArrowRight,
  CalendarDays,
  Car,
  CheckCircle2,
  ClipboardList,
  MoreVertical,
  Settings,
  Star,
  Wrench,
  Zap,
} from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

type BookingWithCar = Doc<"bookings"> & {
  carImageUrl?: string | null;
};

function subscribeToAdminToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAdminTokenSnapshot() {
  if (typeof window === "undefined") return undefined;
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

function statusClass(status: string) {
  if (status === "available" || status === "confirmed") {
    return "bg-green-100 text-green-700";
  }

  if (status === "featured") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "pending" || status === "maintenance") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function DashboardPage() {
  const router = useRouter();

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (adminToken === null) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  const stats = useQuery(
    api.bookings.getStats,
    typeof adminToken === "string" ? { adminToken } : "skip",
  );

  const cars = useQuery(
    api.cars.listCars,
    typeof adminToken === "string" ? { adminToken } : "skip",
  ) as CarWithDisplayImage[] | undefined;

  const bookings = useQuery(
    api.bookings.listAll,
    typeof adminToken === "string" ? { adminToken } : "skip",
  ) as BookingWithCar[] | undefined;

  const recentBookings = useMemo(() => {
    return (bookings ?? []).slice(0, 4);
  }, [bookings]);

  const fleetSummary = useMemo(() => {
    return (cars ?? []).slice(0, 4);
  }, [cars]);

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-KE", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  if (adminToken === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
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
          title="Dashboard"
          subtitle="Overview of your fleet and bookings at a glance."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-3 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-7 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-black tracking-[-0.03em] text-[#06142A] sm:text-3xl">
                  Welcome back, Admin 👋
                </h1>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-[#06142A] shadow-sm sm:px-5 sm:py-4">
                <CalendarDays size={18} aria-hidden="true" />
                {todayLabel}
              </div>
            </div>

            {stats === undefined ||
            cars === undefined ||
            bookings === undefined ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Loading dashboard...
                </p>
              </div>
            ) : (
              <>
                <section className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Cars"
                    value={stats.totalCars}
                    description="All vehicles in fleet"
                    icon={Car}
                    href="/dashboard/cars"
                    hrefLabel="View all cars"
                  />

                  <StatCard
                    title="Available Cars"
                    value={stats.availableCars}
                    description="Ready for rent"
                    icon={CheckCircle2}
                    href="/dashboard/cars"
                    hrefLabel="View available"
                  />

                  <StatCard
                    title="Featured Cars"
                    value={stats.featuredCars}
                    description="Premium selection"
                    icon={Star}
                    href="/dashboard/cars"
                    hrefLabel="Manage featured"
                  />

                  <StatCard
                    title="New Bookings"
                    value={stats.pendingBookings}
                    description="Pending requests"
                    icon={CalendarDays}
                    href="/dashboard/bookings"
                    hrefLabel="View bookings"
                  />
                </section>

                {/*
                  Layout fix: stacks full-width on mobile, tablet, AND normal
                  laptops (up to 1535px). Only splits into a main + sidebar
                  layout on very large screens (2xl: 1536px+), where there's
                  enough room for the right column without squeezing it.
                */}
                <section className="mt-5 grid gap-5 2xl:grid-cols-[1fr_400px]">
                  <div className="space-y-5 min-w-0">
                    <DashboardCard>
                      <div className="mb-6 flex items-center gap-2">
                        <Zap
                          size={20}
                          className="text-[#06142A]"
                          aria-hidden="true"
                        />
                        <h2 className="text-lg font-black sm:text-xl">
                          Quick Actions
                        </h2>
                      </div>

                      <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                        <QuickAction
                          title="Manage Cars"
                          description="Add, edit and manage your fleet"
                          href="/dashboard/cars"
                          icon={Car}
                        />

                        <QuickAction
                          title="View Bookings"
                          description="See all bookings and requests"
                          href="/dashboard/bookings"
                          icon={CalendarDays}
                        />
                      </div>
                    </DashboardCard>

                    <DashboardCard>
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList size={20} aria-hidden="true" />
                          <h2 className="text-lg font-black sm:text-xl">
                            Recent Bookings
                          </h2>
                        </div>

                        <Link
                          href="/dashboard/bookings"
                          className="inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] hover:underline"
                        >
                          View all bookings
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>

                      {recentBookings.length === 0 ? (
                        <EmptyState text="No bookings yet." />
                      ) : (
                        <>
                          {/* Table view: tablet and up */}
                          <div className="hidden overflow-x-auto sm:block">
                            <table className="w-full min-w-[620px] text-left">
                              <thead>
                                <tr className="border-b border-slate-200 text-sm text-slate-500">
                                  <th className="pb-3 font-black">Customer</th>
                                  <th className="pb-3 font-black">Car</th>
                                  <th className="pb-3 font-black">
                                    Pickup Date
                                  </th>
                                  <th className="pb-3 font-black">Status</th>
                                  <th className="pb-3" />
                                </tr>
                              </thead>

                              <tbody>
                                {recentBookings.map((booking) => (
                                  <tr
                                    key={booking._id}
                                    className="border-b border-slate-100 last:border-none"
                                  >
                                    <td className="py-4">
                                      <div className="flex items-center gap-3">
                                        <div
                                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-[#06142A]"
                                          aria-hidden="true"
                                        >
                                          {booking.customerName
                                            .split(" ")
                                            .map((name) => name[0])
                                            .join("")
                                            .slice(0, 2)
                                            .toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-black">
                                            {booking.customerName}
                                          </p>
                                          <p className="truncate text-xs font-semibold text-slate-500">
                                            {booking.customerPhone ||
                                              "Phone not set"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>

                                    <td className="py-4">
                                      <p className="text-sm font-bold">
                                        {booking.carName || "Car not selected"}
                                      </p>
                                      <p className="text-xs font-semibold text-slate-500">
                                        {booking.pickupLocation ||
                                          "Location not set"}
                                      </p>
                                    </td>

                                    <td className="py-4">
                                      <p className="text-sm font-bold">
                                        {formatDate(booking.pickupDate)}
                                      </p>
                                      <p className="text-xs font-semibold text-slate-500">
                                        Return: {formatDate(booking.returnDate)}
                                      </p>
                                    </td>

                                    <td className="py-4">
                                      <span
                                        className={`rounded-lg px-3 py-2 text-xs font-black ${statusClass(
                                          booking.status,
                                        )}`}
                                      >
                                        {formatStatus(booking.status)}
                                      </span>
                                    </td>

                                    <td className="py-4 text-right">
                                      <MoreVertical
                                        size={18}
                                        className="text-slate-400"
                                        aria-hidden="true"
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Card view: mobile only */}
                          <div className="space-y-3 sm:hidden">
                            {recentBookings.map((booking) => (
                              <div
                                key={booking._id}
                                className="rounded-xl border border-slate-200 p-4"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex min-w-0 items-center gap-3">
                                    <div
                                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-black text-[#06142A]"
                                      aria-hidden="true"
                                    >
                                      {booking.customerName
                                        .split(" ")
                                        .map((name) => name[0])
                                        .join("")
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </div>

                                    <div className="min-w-0">
                                      <p className="truncate text-sm font-black">
                                        {booking.customerName}
                                      </p>
                                      <p className="truncate text-xs font-semibold text-slate-500">
                                        {booking.customerPhone ||
                                          "Phone not set"}
                                      </p>
                                    </div>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-black ${statusClass(
                                      booking.status,
                                    )}`}
                                  >
                                    {formatStatus(booking.status)}
                                  </span>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3 text-xs">
                                  <div>
                                    <p className="font-semibold text-slate-400">
                                      Car
                                    </p>
                                    <p className="mt-0.5 font-bold text-slate-700">
                                      {booking.carName || "Not selected"}
                                    </p>
                                  </div>

                                  <div>
                                    <p className="font-semibold text-slate-400">
                                      Pickup
                                    </p>
                                    <p className="mt-0.5 font-bold text-slate-700">
                                      {formatDate(booking.pickupDate)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </DashboardCard>
                  </div>

                  <div className="space-y-5 min-w-0">
                    <DashboardCard>
                      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Car size={20} aria-hidden="true" />
                          <h2 className="text-lg font-black sm:text-xl">
                            Fleet Summary
                          </h2>
                        </div>

                        <Link
                          href="/dashboard/cars"
                          className="inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] hover:underline"
                        >
                          View all cars
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>

                      {fleetSummary.length === 0 ? (
                        <EmptyState text="No cars added yet." />
                      ) : (
                        <div className="space-y-3">
                          {fleetSummary.map((car) => (
                            <div
                              key={car._id}
                              className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0"
                            >
                              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                {car.displayImageUrl ? (
                                  <Image
                                    src={car.displayImageUrl}
                                    alt={car.name}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-slate-400">
                                    No image
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-black">
                                  {car.name}
                                </p>
                                <p className="truncate text-xs font-semibold text-slate-500">
                                  {car.category} · KSh{" "}
                                  {car.pricePerDay.toLocaleString()}/day
                                </p>
                              </div>

                              <span
                                className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[11px] font-black ${statusClass(
                                  car.status,
                                )}`}
                              >
                                {formatStatus(car.status)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <Link
                        href="/dashboard/cars"
                        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] hover:underline"
                      >
                        Manage fleet
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </DashboardCard>

                    <DashboardCard>
                      <div className="flex items-center gap-2">
                        <Settings size={20} aria-hidden="true" />
                        <h2 className="text-lg font-black sm:text-xl">
                          System & Settings
                        </h2>
                      </div>

                      <p className="mt-2 text-sm font-medium text-slate-600">
                        Manage your business settings, users and preferences.
                      </p>

                      <div className="mt-6 space-y-4">
                        <SettingsRow
                          icon={Settings}
                          title="General Settings"
                          description="Business info, location and preferences"
                        />

                        <SettingsRow
                          icon={CheckCircle2}
                          title="Fleet Management"
                          description="Vehicle status and public visibility"
                        />

                        <SettingsRow
                          icon={ClipboardList}
                          title="Booking Logs"
                          description="View customer booking activity"
                        />
                      </div>

                      <Link
                        href="/dashboard/settings"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] hover:underline"
                      >
                        Go to settings
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </DashboardCard>
                  </div>
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      {children}
    </section>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  href,
  hrefLabel,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: ElementType;
  href: string;
  hrefLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9] sm:h-16 sm:w-16">
          <Icon size={28} className="sm:hidden" aria-hidden="true" />
          <Icon size={32} className="hidden sm:block" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-slate-700">{title}</p>
          <h3 className="mt-1 text-3xl font-black tracking-[-0.03em] sm:text-4xl">
            {value}
          </h3>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] hover:underline sm:mt-6"
      >
        {hrefLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
  icon: Icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-[#1E6FD9] hover:bg-blue-50/40 sm:p-5"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9] sm:h-16 sm:w-16">
          <Icon size={24} className="sm:hidden" aria-hidden="true" />
          <Icon size={32} className="hidden sm:block" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="truncate font-black">{title}</p>
          <p className="mt-1 text-sm font-medium leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <ArrowRight size={20} className="shrink-0" aria-hidden="true" />
    </Link>
  );
}

function SettingsRow({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon
        className="mt-1 h-5 w-5 shrink-0 text-[#06142A]"
        aria-hidden="true"
      />

      <div className="min-w-0">
        <p className="text-sm font-black">{title}</p>
        <p className="text-xs font-medium text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-6 text-center">
      <p className="text-sm font-bold text-slate-500">{text}</p>
    </div>
  );
}
