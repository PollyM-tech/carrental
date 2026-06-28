"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Settings,
  Star,
  Wrench,
} from "lucide-react";

import { api } from "../../../convex/_generated/api";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function DashboardPage() {
  const router = useRouter();

  const [adminToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("mobri_admin_token");
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = useQuery(
    api.bookings.getStats,
    adminToken ? { adminToken } : "skip",
  );

  const todayLabel = useMemo(() => {
    return new Intl.DateTimeFormat("en-KE", {
      weekday: "long",
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date());
  }, []);

  if (!adminToken) {
    router.push("/admin-login");

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
          title="Admin Dashboard"
          subtitle="Overview of bookings, vehicles, and MoBri Car Hire activity."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1420px]">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
                  Overview
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Welcome back, Admin
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Track fleet availability, booking activity, revenue, and
                  vehicle status from one admin view.
                </p>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-700 shadow-sm">
                <CalendarCheck size={18} className="text-orange-600" />
                {todayLabel}
              </div>
            </div>

            {stats === undefined ? (
              <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Loading dashboard stats...
                </p>
              </div>
            ) : (
              <>
                <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard
                    title="Total Cars"
                    value={stats.totalCars}
                    description={`${stats.availableCars} available`}
                    icon={Car}
                    link="/dashboard/cars"
                    linkText="Manage cars"
                  />

                  <StatCard
                    title="Featured Cars"
                    value={stats.featuredCars}
                    description="Shown on homepage"
                    icon={Star}
                    link="/dashboard/cars"
                    linkText="View featured"
                  />

                  <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    description={`${stats.pendingBookings} pending`}
                    icon={CalendarCheck}
                    link="/dashboard/bookings"
                    linkText="View bookings"
                  />

                  <StatCard
                    title="Monthly Revenue"
                    value={`KSh ${stats.revenueThisMonth.toLocaleString()}`}
                    description="Completed bookings"
                    icon={DollarSign}
                    link="/dashboard/bookings"
                    linkText="View revenue"
                  />
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-950">
                          Booking Status
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Current booking pipeline summary.
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <CalendarCheck size={22} />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <StatusRow
                        label="Pending"
                        value={stats.pendingBookings}
                      />
                      <StatusRow
                        label="Confirmed"
                        value={stats.confirmedBookings}
                      />
                      <StatusRow label="Active" value={stats.activeBookings} />
                      <StatusRow
                        label="Completed"
                        value={stats.completedBookings}
                      />
                      <StatusRow
                        label="Cancelled"
                        value={stats.cancelledBookings}
                      />
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-black text-slate-950">
                          Fleet Status
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Vehicle availability and homepage visibility.
                        </p>
                      </div>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                        <Wrench size={22} />
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <StatusRow
                        label="Available"
                        value={stats.availableCars}
                      />
                      <StatusRow label="Booked" value={stats.bookedCars} />
                      <StatusRow
                        label="Maintenance"
                        value={stats.maintenanceCars}
                      />
                      <StatusRow
                        label="Unavailable"
                        value={stats.unavailableCars}
                      />
                      <StatusRow label="Featured" value={stats.featuredCars} />
                    </div>
                  </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-3">
                  <QuickAction
                    title="Manage Cars"
                    description="Add, edit, feature, and manage your fleet."
                    href="/dashboard/cars"
                    icon={Car}
                  />

                  <QuickAction
                    title="View Bookings"
                    description="Review booking requests and update statuses."
                    href="/dashboard/bookings"
                    icon={CalendarCheck}
                  />

                  <QuickAction
                    title="Settings"
                    description="Update business contact and WhatsApp details."
                    href="/dashboard/settings"
                    icon={Settings}
                  />
                </section>
              </>
            )}
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
  link,
  linkText,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  link: string;
  linkText: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-black tracking-[-0.04em] text-slate-950">
            {value}
          </p>
          <p className="mt-2 text-xs font-bold text-orange-600">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Icon size={22} />
        </div>
      </div>

      <Link
        href={link}
        className="mt-6 inline-flex items-center gap-2 text-sm font-black text-orange-600 transition hover:text-orange-700"
      >
        {linkText}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="rounded-full bg-white px-3 py-1 text-sm font-black text-slate-950 shadow-sm">
        {value}
      </span>
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
  icon: React.ElementType;
}) {
  return (
    <Link
      href={href}
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-600/10 sm:p-6"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-600 group-hover:text-white">
        <Icon size={22} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
