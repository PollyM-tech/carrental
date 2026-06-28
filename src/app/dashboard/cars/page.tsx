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

        <main className="px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1500px]">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h1 className="text-3xl font-black tracking-[-0.04em] text-[#06142A]">
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
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 sm:w-fit"
              >
                <Plus size={18} />
                Add Car
              </button>
            </div>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Cars"
                value={carStats.total}
                description="All vehicles in fleet"
                icon={Car}
                linkLabel="View all cars"
              />

              <StatCard
                title="Available Cars"
                value={carStats.available}
                description="Ready for rent"
                icon={CheckCircle2}
                linkLabel="View available"
              />

              <StatCard
                title="Featured Cars"
                value={carStats.featured}
                description="Premium selection"
                icon={Star}
                linkLabel="Manage featured"
              />

              <StatCard
                title="Maintenance"
                value={carStats.maintenance}
                description={`${carStats.booked} booked vehicles`}
                icon={Wrench}
                linkLabel="View maintenance"
              />
            </section>

            <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-xl font-black text-[#06142A]">
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
                  placeholder="Search cars by name, brand, model, plate, category, or location..."
                  className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
                />
              </div>

              {cars === undefined ? (
                <div className="rounded-xl bg-slate-50 p-10 text-center">
                  <p className="text-sm font-bold text-slate-500">
                    Loading cars...
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
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  linkLabel: string;
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

      <button
        type="button"
        className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9]"
      >
        {linkLabel}
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
