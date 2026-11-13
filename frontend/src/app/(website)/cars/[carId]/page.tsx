import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/seo";

import VehicleGallery from "@/components/vehicles/VehicleGallery";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Fuel,
  Gauge,
  MapPin,
  Users,
} from "lucide-react";

import { formatPrice } from "@/data/cars";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../../convex/_generated/api";
import { catalogueCar } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ carId: string }>;
};

const getCar = cache(async (carId: string) => {
  const record = (await fetchQuery(api.vehicles.publicList, {})).find(vehicle => vehicle._id === carId);
  return record ? catalogueCar(record) : null;
});
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { carId } = await params;
  const car = await getCar(carId);
  return car ? pageMetadata(`${car.name} Hire in Nairobi`, `Request ${car.name} self-drive hire with Movara. ${car.pricePerDay === null ? "Ask for a quote." : `Listed daily rate: ${formatPrice(car.pricePerDay)}.`} Confirm availability and rental terms with our team.`, `/cars/${encodeURIComponent(carId)}`) : { title: "Vehicle not found", robots: { index: false } };
}

export default async function CarDetailsPage({
  params,
}: PageProps) {
  const { carId } = await params;
  const car = await getCar(carId);
  if (!car) notFound();

  const canInquire = car.status === "available";
  const whatsappUrl = `https://wa.me/254716741039?text=${encodeURIComponent(`Hello Movara, I would like to enquire about ${car.name}. My pickup date is: __. Return date: __. Please confirm availability and rental terms.`)}`;

  return (
    <main className="bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto mb-5 max-w-7xl"><a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-800 underline">Ask about {car.name} on WhatsApp</a></div>
      <div className="mx-auto max-w-7xl">
        <Link
          href="/cars"
          className="mb-6 inline-flex items-center gap-2 text-[13px] font-medium text-[#E86D00] hover:text-[#0B1C4D]"
        >
          <ArrowLeft size={16} />
          Back to Cars
        </Link>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Vehicle image */}
          <VehicleGallery images={car.images?.length ? car.images : [car.image]} name={car.name} />

          {/* Vehicle information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <span className="text-xs font-bold uppercase tracking-wide text-[#E86D00]">
              MOVARA CAR HIRE
            </span>

            <Link href={`/workspace?car=${car.id}`} className="mb-4 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Choose dates and book</Link>
            <h1 className="mt-2 text-[26px] font-bold leading-tight text-[#0B1C4D] sm:text-[32px]">
              {car.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {car.category && (<span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-[#E86D00]">
                {car.category}
              </span>)}

              <span className="rounded-full bg-[#F5F8FF] px-3 py-1 text-xs text-[#0B1C4D]">
                {car.status === "available"
                  ? "Available for inquiry"
                  : car.status === "booked"
                    ? "Booked"
                    : "Unavailable"}
              </span>
            </div>

            <p className="mt-5 text-[14px] leading-7 text-slate-600">
              {car.description}
            </p>

            {/* Price */}
            <div className="mt-6 rounded-xl bg-[#F5F8FF] p-4">
              <p className="text-xs text-slate-500">
                Daily Rental Rate
              </p>

              <p className="mt-1 text-[24px] font-bold text-[#0B1C4D]">
                {formatPrice(car.pricePerDay)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Final availability, pricing, and
                rental terms are confirmed by our team.
              </p>
            </div>

            {/* Specifications */}
            {(car.seats !== null || car.transmission || car.fuel || car.location) && (<div className="mt-6">
              <h2 className="text-base font-bold text-[#0B1C4D]">
                Vehicle Specifications
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                {car.seats !== null && (<Spec
                  icon={Users}
                  label="Seats"
                  value={`${car.seats} passengers`}
                />)}
                {car.transmission && (<Spec
                  icon={Gauge}
                  label="Transmission"
                  value={car.transmission}
                />)}
                {car.fuel && (<Spec
                  icon={Fuel}
                  label="Fuel Type"
                  value={car.fuel}
                />)}
                {car.location && (<Spec
                  icon={MapPin}
                  label="Location"
                  value={car.location}
                />)}
              </div>
            </div>)}

            {/* Booking action */}
            <div className="mt-6">
              {canInquire ? (
                <Link
                  href={`/workspace?car=${car.id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-5 py-2.5 text-[13px] font-medium text-white hover:bg-[#E86D00]"
                >
                  <CalendarCheck size={16} />
                  Request This Car
                  <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  href="/cars"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-[13px] font-medium text-[#0B1C4D]"
                >
                  Explore Other Cars
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-3">
      <Icon
        size={18}
        className="text-[#FF7A00]"
        aria-hidden="true"
      />

      <p className="mt-2 text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-[13px] font-bold text-[#0B1C4D]">
        {value}
      </p>
    </div>
  );
}
