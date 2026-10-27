
"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  Search,
  Users,
} from "lucide-react";

import {
  formatPrice,
} from "@/data/cars";

import { useCatalogue } from "@/lib/use-catalogue";

export default function CarsPage() {
  const { cars, error, loading } = useCatalogue();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Cars");

  const categories = useMemo(
    () => [
      "All Cars",
      ...new Set(cars.map((car) => car.category)),
    ],
    [cars]
  );

  const filteredCars = cars.filter((car) => {
    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      [
        car.name,
        car.brand,
        car.model,
        car.category,
        car.location,
      ].some((value) =>
        value.toLowerCase().includes(query)
      );

    return (
      matchesSearch &&
      (category === "All Cars" ||
        car.category === category)
    );
  });

  return (
    <main className="bg-white">
      {/* Compact page introduction */}
      <section className="bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-[#E86D00]">
            MOVARA FLEET
          </span>

          <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[34px] lg:text-[38px]">
            Find the Right Car{" "}
            <span className="text-[#FF7A00]">
              for Your Journey.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Explore self-drive car hire options for
            personal travel, business trips, and
            family journeys with Movara Car Hire.
          </p>
        </div>
      </section>

      {loading && <p className="p-6 text-center" role="status">Loading vehicles…</p>}
      {error && <p className="p-6 text-center text-red-700" role="alert">{error}</p>}
      {/* Fleet and filters */}
      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 lg:max-w-sm">
              <Search
                size={17}
                className="shrink-0 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search vehicles..."
                aria-label="Search vehicles"
                className="w-full bg-transparent text-sm text-[#0B1C4D] outline-none placeholder:text-slate-400"
              />
            </div>

            {/* Category filters */}
            {categories.length > 1 && (
              <div
                role="group"
                aria-label="Filter vehicles by category"
                className="flex gap-2 overflow-x-auto pb-1"
              >
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    aria-pressed={category === item}
                    className={`shrink-0 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition-colors ${
                      category === item
                        ? "border-[#0B1C4D] bg-[#0B1C4D] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Results */}
          {filteredCars.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-[#F5F8FF] px-6 py-12 text-center">
              <CarFront
                size={30}
                className="mx-auto text-[#FF7A00]"
                aria-hidden="true"
              />

              <h2 className="mt-3 text-lg font-bold text-[#0B1C4D]">
                {cars.length === 0
                  ? "Our Fleet Is Being Updated"
                  : "No Matching Vehicles"}
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">
                {cars.length === 0
                  ? "Please contact our team to inquire about available vehicles."
                  : "Try another vehicle name or category."}
              </p>

              {cars.length === 0 ? (
                <Link
                  href="/contact"
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#E86D00]"
                >
                  Contact Movara
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All Cars");
                  }}
                  className="mt-5 text-sm font-medium text-[#E86D00] hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCars.map((car) => (
                <article
                  key={car.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-colors hover:border-orange-200"
                >
                  <div className="relative h-44 overflow-hidden bg-slate-100">
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {car.status !== "available" && (
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-medium text-[#0B1C4D]">
                        {car.status === "booked"
                          ? "Booked"
                          : "Unavailable"}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <p className="text-xs text-[#E86D00]">
                      {car.category}
                    </p>

                    <h2 className="mt-1 text-[15px] font-bold text-[#0B1C4D]">
                      {car.name}
                    </h2>

                    <p className="mt-3 text-base font-bold text-[#0B1C4D]">
                      {formatPrice(car.pricePerDay)}
                      {car.pricePerDay !== null && (
                        <span className="ml-1 text-xs font-normal text-slate-500">
                          / day
                        </span>
                      )}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {car.seats} seats
                      </span>

                      <span className="flex items-center gap-1">
                        <Gauge size={14} />
                        {car.transmission}
                      </span>

                      <span className="flex items-center gap-1">
                        <Fuel size={14} />
                        {car.fuel}
                      </span>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                      <Link
                        href={`/cars/${encodeURIComponent(car.id)}`}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-[#0B1C4D] hover:border-orange-200"
                      >
                        View Details
                      </Link>

                      {car.status === "available" ? (
                        <Link
                          href={`/workspace?car=${encodeURIComponent(car.id)}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#FF7A00] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#E86D00]"
                        >
                          Book Now
                        </Link>
                      ) : (
                        <span className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-[13px] text-slate-500">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
