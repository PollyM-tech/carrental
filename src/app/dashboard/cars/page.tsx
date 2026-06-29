"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Plus,
  Search,
  Star,
  Wrench,
} from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import CarForm from "@/components/admin/CarForm";
import CarsTable from "@/components/admin/CarsTable";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

type FilterStatus =
  | "all"
  | "available"
  | "booked"
  | "maintenance"
  | "unavailable"
  | "featured";

const filters: { label: string; value: FilterStatus }[] = [
  { label: "All Cars", value: "all" },
  { label: "Available", value: "available" },
  { label: "Booked", value: "booked" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Unavailable", value: "unavailable" },
  { label: "Featured", value: "featured" },
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

export default function DashboardCarsPage() {
  const router = useRouter();

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<CarWithDisplayImage | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  useEffect(() => {
    if (adminToken === null) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  const cars = useQuery(
    api.cars.listCars,
    typeof adminToken === "string" ? { adminToken } : "skip",
  ) as CarWithDisplayImage[] | undefined;

  const carStats = useMemo(() => {
    const list = cars ?? [];

    return {
      total: list.length,
      available: list.filter((car) => car.status === "available").length,
      booked: list.filter((car) => car.status === "booked").length,
      maintenance: list.filter((car) => car.status === "maintenance").length,
      featured: list.filter((car) => car.isFeatured).length,
    };
  }, [cars]);

  const filteredCars = useMemo(() => {
    const value = search.trim().toLowerCase();

    return (cars ?? []).filter((car) => {
      const matchesSearch =
        !value ||
        car.name.toLowerCase().includes(value) ||
        car.category.toLowerCase().includes(value) ||
        car.brand?.toLowerCase().includes(value) ||
        car.model?.toLowerCase().includes(value) ||
        car.location?.toLowerCase().includes(value) ||
        car.plateNumber?.toLowerCase().includes(value);

      const matchesFilter =
        filter === "all" ||
        car.status === filter ||
        (filter === "featured" && car.isFeatured);

      return matchesSearch && matchesFilter;
    });
  }, [cars, search, filter]);

  function handleAddCar() {
    setEditingCar(null);
    setShowForm(true);
  }

  function handleEditCar(car: CarWithDisplayImage) {
    setEditingCar(car);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingCar(null);
  }

  function handleStatCardClick(targetFilter: FilterStatus) {
    setFilter(targetFilter);

    if (typeof window !== "undefined") {
      const fleetSection = document.getElementById("fleet-list");
      fleetSection?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

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
          title="Cars"
          subtitle="Manage your vehicle fleet, availability, and featured cars."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-3 py-6 sm:px-6 sm:py-7 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-7 md:flex-row md:items-center">
              <div>
                <h1 className="text-2xl font-black tracking-[-0.03em] text-[#06142A] sm:text-3xl">
                  Cars Management
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  Add vehicles, upload images, update prices, and control which
                  cars appear on the public website.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCar}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[0.98] sm:w-fit"
              >
                <Plus size={18} aria-hidden="true" />
                Add Car
              </button>
            </div>

            <section className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Cars"
                value={carStats.total}
                description="All vehicles in fleet"
                icon={Car}
                linkLabel="View all cars"
                isActive={filter === "all"}
                onClick={() => handleStatCardClick("all")}
              />

              <StatCard
                title="Available Cars"
                value={carStats.available}
                description="Ready for rent"
                icon={CheckCircle2}
                linkLabel="View available"
                isActive={filter === "available"}
                onClick={() => handleStatCardClick("available")}
              />

              <StatCard
                title="Featured Cars"
                value={carStats.featured}
                description="Premium selection"
                icon={Star}
                linkLabel="Manage featured"
                isActive={filter === "featured"}
                onClick={() => handleStatCardClick("featured")}
              />

              <StatCard
                title="Maintenance"
                value={carStats.maintenance}
                description={`${carStats.booked} booked vehicles`}
                icon={Wrench}
                linkLabel="View maintenance"
                isActive={filter === "maintenance"}
                onClick={() => handleStatCardClick("maintenance")}
              />
            </section>

            <section
              id="fleet-list"
              className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-black text-[#06142A] sm:text-xl">
                    Fleet List
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Showing{" "}
                    <span className="font-black text-[#06142A]">
                      {filteredCars.length}
                    </span>{" "}
                    of{" "}
                    <span className="font-black text-[#06142A]">
                      {cars?.length ?? 0}
                    </span>{" "}
                    cars.
                  </p>
                </div>

                <div className="relative">
                  <div
                    className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0"
                    role="group"
                    aria-label="Filter cars by status"
                  >
                    {filters.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFilter(item.value)}
                        aria-pressed={filter === item.value}
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

                  {/* Fade hint that the filter row scrolls horizontally on mobile */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent lg:hidden"
                  />
                </div>
              </div>

              <div className="mb-5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search
                  size={18}
                  className="shrink-0 text-slate-400"
                  aria-hidden="true"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name, brand, model, plate, category, location..."
                  aria-label="Search cars by name, brand, model, plate, category, or location"
                  className="w-full min-w-0 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {cars === undefined ? (
                <div className="rounded-xl bg-slate-50 p-10 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    Loading cars...
                  </p>
                </div>
              ) : filteredCars.length === 0 ? (
                <div className="rounded-xl bg-slate-50 p-10 text-center">
                  <p className="text-sm font-black text-slate-700">
                    No cars match your search or filter
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    Try a different search term or select a different status
                    filter.
                  </p>
                </div>
              ) : (
                <CarsTable cars={filteredCars} onEdit={handleEditCar} />
              )}
            </section>
          </div>
        </main>
      </div>

      {showForm && <CarForm car={editingCar} onClose={handleCloseForm} />}
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  linkLabel,
  isActive,
  onClick,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  linkLabel: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:border-[#1E6FD9]/40 hover:shadow-md sm:p-6 ${
        isActive
          ? "border-[#1E6FD9] ring-2 ring-[#1E6FD9]/15"
          : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-4 sm:gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9] sm:h-16 sm:w-16">
          <Icon size={28} className="sm:hidden" aria-hidden="true" />
          <Icon size={32} className="hidden sm:block" aria-hidden="true" />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-slate-700">{title}</p>

          <h3 className="mt-1 text-3xl font-black tracking-[-0.03em] text-[#06142A] sm:text-4xl">
            {value}
          </h3>

          <p className="mt-1 text-sm font-medium text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9] sm:mt-6">
        {linkLabel}
        <ArrowRight size={16} aria-hidden="true" />
      </span>
    </button>
  );
}
