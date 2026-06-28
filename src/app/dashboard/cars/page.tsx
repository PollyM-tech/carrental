"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

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
  { label: "All", value: "all" },
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

  const filteredCars = useMemo(() => {
    const value = search.trim().toLowerCase();

    return (cars ?? []).filter((car) => {
      const matchesSearch =
        !value ||
        car.name.toLowerCase().includes(value) ||
        car.category.toLowerCase().includes(value) ||
        car.brand?.toLowerCase().includes(value) ||
        car.model?.toLowerCase().includes(value) ||
        car.location?.toLowerCase().includes(value);

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
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb] px-4">
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
          title="Cars Management"
          subtitle="Add, update, feature, and manage MoBri Car Hire vehicles."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1420px]">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
                  Admin Fleet
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Cars Management
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Add cars, update details, mark maintenance, hide unavailable
                  cars, and choose which vehicles appear on the homepage.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCar}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-1 hover:bg-orange-700 sm:w-fit"
              >
                <Plus size={18} />
                Add Car
              </button>
            </div>

            <div className="mt-8 grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm xl:grid-cols-[1fr_auto]">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Search size={18} className="shrink-0 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by car name, brand, category, or location..."
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
              {cars === undefined ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-sm font-bold text-slate-500">
                    Loading cars...
                  </p>
                </div>
              ) : (
                <CarsTable cars={filteredCars} onEdit={handleEditCar} />
              )}
            </div>
          </div>
        </main>
      </div>

      {showForm && <CarForm car={editingCar} onClose={handleCloseForm} />}
    </div>
  );
}
