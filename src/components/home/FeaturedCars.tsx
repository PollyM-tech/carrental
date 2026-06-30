"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { ArrowRight, Car, Fuel, Heart, Star, Users } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

const categories = ["All Cars", "Sedan", "SUV", "Hatchback", "Luxury", "Van"];

export default function FeaturedCars() {
  const cars = useQuery(api.cars.listFeaturedCars) as
    | CarWithDisplayImage[]
    | undefined;

  return (
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            Featured Cars
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Explore Our Featured Cars
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Handpicked vehicles for comfort, style, daily movement, business
            trips, and memorable travel experiences.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${
                  index === 0
                    ? "bg-[#06142A] text-white shadow-lg shadow-slate-950/10"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <Link
            href="/cars"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-[#0A1628] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 sm:w-fit"
          >
            View all cars
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="mt-8">
          {cars === undefined ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_28px_80px_rgba(10,22,40,0.08)]">
              <p className="text-sm font-semibold text-slate-500">
                Loading featured cars...
              </p>
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-[0_28px_80px_rgba(10,22,40,0.08)]">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <Car size={20} />
              </div>

              <h3 className="mt-4 text-lg font-black text-[#0A1628]">
                No featured cars yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
                Mark cars as featured from the admin dashboard to show them
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {cars.slice(0, 4).map((car) => (
                <article
                  key={car._id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                >
                  <div className="relative h-48 overflow-hidden rounded-2xl bg-slate-100">
                    {car.displayImageUrl ? (
                      <Image
                        src={car.displayImageUrl}
                        alt={car.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                        No image
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-orange-600 shadow-sm backdrop-blur">
                      Featured
                    </span>

                    <button
                      type="button"
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-[#0A1628] shadow-sm backdrop-blur transition hover:bg-orange-600 hover:text-white"
                      aria-label={`Save ${car.name}`}
                    >
                      <Heart size={17} />
                    </button>
                  </div>

                  <div className="px-3 pb-4 pt-4">
                    <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-orange-600">
                      {car.category}
                    </span>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-[#0A1628]">
                          {car.name}
                        </h3>

                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <Star
                            size={13}
                            className="fill-orange-500 text-orange-500"
                          />
                          <span className="font-black text-[#0A1628]">
                            {car.rating ?? 4.8}
                          </span>
                          <span className="text-slate-500">
                            ({car.reviewCount ?? 0})
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black leading-tight text-[#0A1628]">
                          KSh {car.pricePerDay.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          / day
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500">
                        <div className="flex min-w-0 items-center gap-1">
                          <Users size={13} />
                          <span className="truncate">{car.seats} Seats</span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1">
                          <Car size={13} />
                          <span className="truncate">{car.transmission}</span>
                        </div>

                        <div className="flex min-w-0 items-center gap-1">
                          <Fuel size={13} />
                          <span className="truncate">{car.fuel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                      <Link
                        href={`/contact?car=${encodeURIComponent(car.name)}`}
                        className="inline-flex items-center justify-center rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-orange-700"
                      >
                        Book Now
                      </Link>

                      <Link
                        href={`/cars/${car._id}`}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-[#0A1628] transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                        aria-label={`View ${car.name}`}
                      >
                        <ArrowRight size={18} />
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
  );
}
