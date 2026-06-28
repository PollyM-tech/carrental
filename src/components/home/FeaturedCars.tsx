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
    <section className="bg-[#f6f8fb] px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1420px]">
        <div className="text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-orange-600">
            Featured Cars
          </p>

          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-orange-600" />

          <h2 className="mt-6 text-xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">
            Explore Our Featured Cars
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
            Handpicked premium vehicles for your comfort, style, and an
            unforgettable driving experience.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible lg:pb-0">
            {categories.map((category, index) => (
              <button
                key={category}
                type="button"
                className={`shrink-0 rounded-full px-6 py-3 text-sm font-black transition ${
                  index === 0
                    ? "bg-[#06142A] text-white shadow-lg shadow-slate-950/10"
                    : "border border-slate-200 bg-white text-slate-950 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <Link
            href="/cars"
            className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-black text-slate-950 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 sm:w-fit"
          >
            View all cars
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="mt-8">
          {cars === undefined ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <p className="text-sm font-bold text-slate-500">
                Loading featured cars...
              </p>
            </div>
          ) : cars.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Car size={26} />
              </div>

              <h3 className="mt-4 text-xl font-black text-slate-950">
                No featured cars yet
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Mark cars as featured from the admin dashboard to show them
                here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {cars.slice(0, 4).map((car) => (
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

                    <button
                      type="button"
                      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-slate-950 shadow-sm backdrop-blur transition hover:bg-orange-600 hover:text-white"
                      aria-label="Save car"
                    >
                      <Heart size={19} />
                    </button>
                  </div>

                  <div className="px-3 pb-4 pt-4">
                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                      {car.category}
                    </span>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-black leading-tight text-slate-950">
                          {car.name}
                        </h3>

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
                        href="/cars"
                        className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-300 text-slate-950 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                        aria-label={`View ${car.name}`}
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
  );
}
