"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Car, Fuel, Search, Star, Users } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

export default function CarsPage() {
  const cars = useQuery(api.cars.listPublicCars) as
    | CarWithDisplayImage[]
    | undefined;

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Cars");

  const categories = useMemo(() => {
    const carCategories = (cars ?? [])
      .map((car) => car.category)
      .filter(Boolean);

    return ["All Cars", ...Array.from(new Set(carCategories))];
  }, [cars]);

  const filteredCars = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return (cars ?? []).filter((car) => {
      const matchesSearch =
        !searchValue ||
        car.name.toLowerCase().includes(searchValue) ||
        car.category.toLowerCase().includes(searchValue) ||
        car.brand?.toLowerCase().includes(searchValue) ||
        car.model?.toLowerCase().includes(searchValue) ||
        car.location?.toLowerCase().includes(searchValue);

      const matchesCategory =
        activeCategory === "All Cars" || car.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [cars, search, activeCategory]);

  return (
    <>
      <Navbar />

      <main className="bg-[#f6f8fb]">
        <section className="px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-3xl bg-[#06142A] px-5 py-12 text-center text-white sm:px-8 lg:py-16">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-500">
                Our Fleet
              </p>

              <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Find the Right Car for Your Trip
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                Browse available MoBri Car Hire vehicles, compare prices, and
                choose the best option for city drives, family trips, business
                travel, or airport transfers.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm lg:grid-cols-[1fr_auto]">
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

              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`shrink-0 rounded-xl px-4 py-3 text-xs font-black transition ${
                      activeCategory === category
                        ? "bg-orange-600 text-white"
                        : "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              {cars === undefined ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <p className="text-sm font-bold text-slate-500">
                    Loading available cars...
                  </p>
                </div>
              ) : filteredCars.length === 0 ? (
                <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                    <Car size={26} />
                  </div>

                  <h2 className="mt-4 text-xl font-black text-slate-950">
                    No cars found
                  </h2>

                  <p className="mt-2 text-sm text-slate-500">
                    Try another search term or choose a different category.
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredCars.map((car) => (
                    <article
                      key={car._id}
                      className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                    >
                      <div className="relative h-56 overflow-hidden rounded-2xl bg-slate-100">
                        {car.displayImageUrl ? (
                          <Image
                            src={car.displayImageUrl}
                            alt={car.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="px-3 pb-4 pt-4">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                          {car.category}
                        </span>

                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate text-base font-black leading-tight text-slate-950">
                              {car.name}
                            </h2>

                            <div className="mt-2 flex items-center gap-1 text-xs">
                              <Star
                                size={14}
                                className="fill-orange-500 text-orange-500"
                              />
                              <span className="font-black text-slate-950">
                                {car.rating ?? 4.8}
                              </span>
                              <span className="text-slate-500">
                                ({car.reviewCount ?? 0} reviews)
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-lg font-black leading-tight text-slate-950">
                              KSh {car.pricePerDay.toLocaleString()}
                            </p>
                            <p className="text-xs font-bold text-slate-500">
                              / day
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 border-t border-slate-100 pt-4">
                          <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1">
                              <Users size={15} />
                              {car.seats} Seats
                            </div>

                            <div className="flex items-center gap-1">
                              <Car size={15} />
                              {car.transmission}
                            </div>

                            <div className="flex items-center gap-1">
                              <Fuel size={15} />
                              {car.fuel}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                          <Link
                            href={`/contact?car=${encodeURIComponent(car.name)}`}
                            className="inline-flex items-center justify-center rounded-xl bg-[#06142A] px-4 py-3 text-sm font-black text-white transition hover:bg-orange-600"
                          >
                            Book Now
                          </Link>

                          <Link
                            href={`/contact?car=${encodeURIComponent(car.name)}`}
                            className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 text-slate-950 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                            aria-label={`Book ${car.name}`}
                          >
                            <ArrowRight size={20} />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
