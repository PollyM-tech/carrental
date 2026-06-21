import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  LayoutDashboard,
  Search,
  Settings,
  Star,
  ClipboardList,
  ArrowRight,
  Headphones,
  Building2,
} from "lucide-react";

const ADMIN_ROLES = new Set(["platform_admin", "platform-admin", "admin"]);
const STAFF_ROLES = new Set(["staff"]);

function hasAllowedRole(role?: string, roles?: string[]) {
  const allRoles = [role, ...(roles ?? [])].filter(
    (currentRole): currentRole is string => Boolean(currentRole),
  );

  return allRoles.some((currentRole) => {
    const normalizedRole = currentRole.toLowerCase();
    return ADMIN_ROLES.has(normalizedRole) || STAFF_ROLES.has(normalizedRole);
  });
}

const stats = [
  {
    title: "Total Cars",
    value: "48",
    description: "All vehicles in fleet",
    icon: Car,
    link: "/dashboard/cars",
    linkText: "View all cars",
  },
  {
    title: "Available Cars",
    value: "28",
    description: "Ready for rent",
    icon: CheckCircle2,
    link: "/dashboard/cars",
    linkText: "View available",
  },
  {
    title: "Featured Cars",
    value: "12",
    description: "Premium selection",
    icon: Star,
    link: "/dashboard/cars",
    linkText: "Manage featured",
  },
  {
    title: "New Bookings",
    value: "7",
    description: "In the last 7 days",
    icon: CalendarDays,
    link: "/dashboard/bookings",
    linkText: "View bookings",
  },
];

const fleetSummary = [
  {
    car: "Toyota Corolla 2023",
    plate: "KCA 123A",
    type: "Economy",
    status: "Available",
    price: "KES 3,500 / day",
  },
  {
    car: "Hyundai Creta 2023",
    plate: "KDG 789D",
    type: "SUV",
    status: "Featured",
    price: "KES 5,500 / day",
  },
  {
    car: "Toyota Hiace 2022",
    plate: "KDH 456P",
    type: "Van",
    status: "Available",
    price: "KES 7,500 / day",
  },
  {
    car: "Land Cruiser V8 2022",
    plate: "KCV 001V",
    type: "Luxury",
    status: "Unavailable",
    price: "KES 18,000 / day",
  },
];

const recentBookings = [
  {
    customer: "John Thompson",
    phone: "+254 712 345 678",
    car: "Toyota Corolla 2023",
    plate: "KCA 123A",
    date: "28 May 2025",
    time: "10:00 AM",
    status: "Confirmed",
  },
  {
    customer: "Sarah Miller",
    phone: "+254 722 987 654",
    car: "Hyundai Creta 2023",
    plate: "KDG 789D",
    date: "29 May 2025",
    time: "02:00 PM",
    status: "Confirmed",
  },
  {
    customer: "Robert Daniels",
    phone: "+254 733 456 789",
    car: "VW Polo Vivo 2022",
    plate: "KDL 345C",
    date: "30 May 2025",
    time: "09:00 AM",
    status: "Pending",
  },
  {
    customer: "Lisa Williams",
    phone: "+254 721 001 987",
    car: "Toyota Fortuner 2022",
    plate: "KCZ 234X",
    date: "31 May 2025",
    time: "11:00 AM",
    status: "Confirmed",
  },
];

function statusClass(status: string) {
  if (status === "Available" || status === "Confirmed") {
    return "bg-green-100 text-green-700";
  }

  if (status === "Featured") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "Pending") {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-red-100 text-red-700";
}

export default async function DashboardPage() {
  const { user, organizationId, role, roles } = await withAuth({
    ensureSignedIn: true,
  });

  const adminOrgId = process.env.WORKOS_ADMIN_ORG_ID;
  const staffOrgId = process.env.WORKOS_STAFF_ORG_ID;

  const isKnownOperationsOrg =
    Boolean(organizationId) &&
    (organizationId === adminOrgId || organizationId === staffOrgId);

  if (!isKnownOperationsOrg && !hasAllowedRole(role, roles)) {
    redirect("/unauthorized");
  }

  const displayName = user.firstName || user.email || "Admin";

  return (
    <main className="min-h-screen bg-[#F4F7FB] text-[#0A1628]">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 hidden h-screen w-72 flex-col bg-[#06142A] text-white lg:flex">
          <div className="flex h-40 items-center justify-center border-b border-white/10">
            <div className="relative h-28 w-28">
              <Image
                src="/logo.png"
                alt="MoBri Car Hire logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <nav className="flex-1 space-y-3 px-5 py-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-4 rounded-xl border-l-4 border-[#FF6B00] bg-[#1E6FD9]/30 px-4 py-4 font-semibold"
            >
              <LayoutDashboard className="h-5 w-5 text-[#FF6B00]" />
              Dashboard
            </Link>

            <Link
              href="/dashboard/cars"
              className="flex items-center gap-4 rounded-xl px-4 py-4 font-semibold text-white/85 transition hover:bg-white/10"
            >
              <Car className="h-5 w-5" />
              Cars
            </Link>

            <Link
              href="/dashboard/bookings"
              className="flex items-center gap-4 rounded-xl px-4 py-4 font-semibold text-white/85 transition hover:bg-white/10"
            >
              <ClipboardList className="h-5 w-5" />
              Bookings
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-4 rounded-xl px-4 py-4 font-semibold text-white/85 transition hover:bg-white/10"
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          <div className="space-y-5 px-5 pb-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">MoBri Car Hire</p>
                  <p className="text-sm text-white/60">Nairobi, Kenya</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Headphones className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold">Need help?</p>
                  <p className="text-sm text-[#1E6FD9]">Contact support</p>
                </div>
              </div>
            </div>

            <p className="text-sm text-white/50">
              © 2025 MoBri Car Hire
              <br />
              All rights reserved.
            </p>
          </div>
        </aside>

        <section className="flex min-h-screen flex-1 flex-col lg:ml-72">
          <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-6 backdrop-blur xl:px-10">
            <h1 className="text-2xl font-black">Dashboard</h1>

            <div className="hidden w-full max-w-xl items-center rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex">
              <Search className="mr-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cars, bookings, customers..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <span className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
                ⌘ K
              </span>
            </div>

            <div className="flex items-center gap-5">
              <button className="relative rounded-full border border-slate-200 bg-white p-3 shadow-sm">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-bold text-white">
                  3
                </span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#06142A] font-bold text-white">
                  {displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="font-bold">{displayName}</p>
                  <p className="text-sm text-slate-500">Administrator</p>
                </div>
                <ChevronDown className="hidden h-5 w-5 md:block" />
              </div>
            </div>
          </header>

          <div className="flex-1 px-6 py-8 xl:px-10">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h2 className="text-3xl font-black">Welcome back, Admin 👋</h2>
                <p className="mt-2 text-slate-600">
                  Overview of your fleet and bookings at a glance.
                </p>
              </div>

              <div className="flex w-fit items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <CalendarDays className="h-5 w-5" />
                <span className="font-semibold">Tuesday, 27 May 2025</span>
              </div>
            </div>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-start gap-5">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                        <Icon className="h-8 w-8" />
                      </div>

                      <div>
                        <p className="font-semibold text-slate-700">
                          {item.title}
                        </p>
                        <h3 className="mt-1 text-4xl font-black">
                          {item.value}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <Link
                      href={item.link}
                      className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1E6FD9]"
                    >
                      {item.linkText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-black">
                    <span className="text-[#FF6B00]">⚡</span>
                    Quick Actions
                  </h3>

                  <div className="mt-6 grid gap-5 md:grid-cols-2">
                    <Link
                      href="/dashboard/cars"
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-5 transition hover:border-[#1E6FD9]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                          <Car className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold">Manage Cars</p>
                          <p className="mt-1 text-sm text-slate-500">
                            Add, edit and manage your fleet
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                    </Link>

                    <Link
                      href="/dashboard/bookings"
                      className="flex items-center justify-between rounded-xl border border-slate-200 p-5 transition hover:border-[#1E6FD9]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                          <ClipboardList className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="font-bold">View Bookings</p>
                          <p className="mt-1 text-sm text-slate-500">
                            See all bookings and requests
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-black">
                      <ClipboardList className="h-5 w-5" />
                      Recent Bookings
                    </h3>

                    <Link
                      href="/dashboard/bookings"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#1E6FD9]"
                    >
                      View all bookings
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[680px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200 text-sm text-slate-500">
                          <th className="pb-3 font-bold">Customer</th>
                          <th className="pb-3 font-bold">Car</th>
                          <th className="pb-3 font-bold">Pickup Date</th>
                          <th className="pb-3 font-bold">Status</th>
                        </tr>
                      </thead>

                      <tbody>
                        {recentBookings.map((booking) => (
                          <tr
                            key={`${booking.customer}-${booking.plate}`}
                            className="border-b border-slate-100 last:border-none"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold">
                                  {booking.customer
                                    .split(" ")
                                    .map((name) => name[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="font-bold">
                                    {booking.customer}
                                  </p>
                                  <p className="text-sm text-slate-500">
                                    {booking.phone}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="py-4">
                              <p className="font-semibold">{booking.car}</p>
                              <p className="text-sm text-slate-500">
                                {booking.plate}
                              </p>
                            </td>

                            <td className="py-4">
                              <p className="font-semibold">{booking.date}</p>
                              <p className="text-sm text-slate-500">
                                {booking.time}
                              </p>
                            </td>

                            <td className="py-4">
                              <span
                                className={`rounded-lg px-3 py-2 text-sm font-bold ${statusClass(
                                  booking.status,
                                )}`}
                              >
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-xl font-black">
                      <Car className="h-5 w-5" />
                      Fleet Summary
                    </h3>

                    <Link
                      href="/dashboard/cars"
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#1E6FD9]"
                    >
                      View all cars
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>

                  <div className="space-y-3">
                    {fleetSummary.map((car) => (
                      <div
                        key={car.plate}
                        className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1fr] items-center gap-4 border-b border-slate-100 py-3 last:border-none"
                      >
                        <div>
                          <p className="font-bold">{car.car}</p>
                          <p className="text-sm text-slate-500">{car.plate}</p>
                        </div>

                        <p className="text-sm font-semibold text-slate-600">
                          {car.type}
                        </p>

                        <span
                          className={`w-fit rounded-lg px-3 py-2 text-sm font-bold ${statusClass(
                            car.status,
                          )}`}
                        >
                          {car.status}
                        </span>

                        <p className="text-sm font-bold text-slate-700">
                          {car.price}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/dashboard/cars"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#1E6FD9]"
                  >
                    Manage fleet
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-xl font-black">
                    <Settings className="h-5 w-5" />
                    System & Settings
                  </h3>

                  <p className="mt-2 text-slate-600">
                    Manage your business settings, users and preferences.
                  </p>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-start gap-3">
                      <Settings className="mt-1 h-5 w-5 text-[#06142A]" />
                      <div>
                        <p className="font-bold">General Settings</p>
                        <p className="text-sm text-slate-500">
                          Business info, location and preferences
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 text-[#06142A]" />
                      <div>
                        <p className="font-bold">User Management</p>
                        <p className="text-sm text-slate-500">
                          Manage admin users and roles
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ClipboardList className="mt-1 h-5 w-5 text-[#06142A]" />
                      <div>
                        <p className="font-bold">System Logs</p>
                        <p className="text-sm text-slate-500">
                          View system activity and logs
                        </p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/settings"
                    className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1E6FD9]"
                  >
                    Go to settings
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
