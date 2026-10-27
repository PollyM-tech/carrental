"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Fuel,
  Gauge,
  Users,
} from "lucide-react";

import {
  formatPrice,
} from "@/data/cars";

import { useCatalogue } from "@/lib/use-catalogue";

export default function FeaturedCars() {
  const { cars, error, loading } = useCatalogue();
  const featuredCars = cars.filter(car => car.isFeatured);
  return (
    <section
      id="featured-cars"
      aria-labelledby="featured-heading"
      className="bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E86D00]">
            FEATURED CARS
          </span>

          <h2
            id="featured-heading"
            className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[30px] lg:text-[34px]"
          >
            Explore Our{" "}
            <span className="text-[#FF7A00]">
              Featured Cars.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Find a suitable self-drive vehicle for your
            next journey with Movara Car Hire.
          </p>
        </div>

        {loading && <p role="status" className="text-center">Loading featured vehicles…</p>}
        {error && <p role="alert" className="text-center text-red-700">{error}</p>}
        {/* Vehicles */}
        {!loading && !error && (featuredCars.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-[#F5F8FF] px-6 py-9 text-center">
            <CarFront
              size={27}
              className="mx-auto text-[#FF7A00]"
              aria-hidden="true"
            />

            <h3 className="mt-3 text-base font-bold text-[#0B1C4D]">
              No Featured Vehicles Available Right Now
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
              No featured vehicles are available at the moment.
              Browse our fleet or contact us about your travel dates.
            </p>

            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#E86D00]"
            >
              Ask About Availability
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredCars.slice(0, 4).map((car) => (
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

                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#E86D00]">
                    Featured
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <span className="text-xs text-[#E86D00]">
                    {car.category}
                  </span>

                  <h3 className="mt-1 text-[15px] font-bold text-[#0B1C4D]">
                    {car.name}
                  </h3>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-base font-bold text-[#0B1C4D]">
                      {formatPrice(car.pricePerDay)}
                    </span>

                    {car.pricePerDay !== null && (
                      <span className="text-xs text-slate-500">
                        / day
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Users size={14} />
                      {car.seats} seats
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Gauge size={14} />
                      {car.transmission}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Fuel size={14} />
                      {car.fuel}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-2 pt-5">
                    <Link
                      href={`/cars/${encodeURIComponent(car.id)}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-[13px] font-medium text-[#0B1C4D] hover:border-orange-200"
                    >
                      Details
                    </Link>

                    <Link
                      href={`/workspace?car=${encodeURIComponent(car.id)}`}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[#FF7A00] px-3 py-2 text-[13px] font-medium text-white hover:bg-[#E86D00]"
                    >
                      Book Now
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ))}

        {/* Browse fleet */}
        <div className="mt-8 text-center">
          <Link
            href="/cars"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-[#0B1C4D] hover:border-orange-200 hover:text-[#E86D00]"
          >
            View All Cars
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
