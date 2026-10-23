
import Image from "next/image";
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
import { workflow, PublicCar } from "@/lib/workflow";
import { catalogueCar } from "@/lib/catalogue";

export const dynamic = "force-dynamic";

export const dynamicParams = true;

type PageProps = {
  params: Promise<{ carId: string }>;
};

export default async function CarDetailsPage({
  params,
}: PageProps) {
  const { carId } = await params;
  let car;
  try {
    car = catalogueCar(await workflow<PublicCar>(`workflow/public/cars/${carId}/`, { public: true }));
  } catch { car = null; }

  if (!car) {
    return (
      <main className="bg-[#F5F8FF] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-[#0B1C4D]">
            Vehicle Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            This vehicle could not be found.
            Please browse our current fleet.
          </p>

          <Link
            href="/cars"
            className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white"
          >
            <ArrowLeft size={16} />
            Back to Cars
          </Link>
        </div>
      </main>
    );
  }

  const canInquire = car.status === "available";

  return (
    <main className="bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
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
          <div className="relative h-[280px] overflow-hidden rounded-2xl bg-slate-200 sm:h-[380px] lg:h-[450px]">
            <Image
              src={car.image}
              alt={car.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>

          {/* Vehicle information */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <span className="text-xs font-bold uppercase tracking-wide text-[#E86D00]">
              MOVARA CAR HIRE
            </span>

            <Link href={`/account?car=${car.id}`} className="mb-4 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Choose dates and book</Link>
            <h1 className="mt-2 text-[26px] font-bold leading-tight text-[#0B1C4D] sm:text-[32px]">
              {car.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs text-[#E86D00]">
                {car.category}
              </span>

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
            <div className="mt-6">
              <h2 className="text-base font-bold text-[#0B1C4D]">
                Vehicle Specifications
              </h2>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Spec
                  icon={Users}
                  label="Seats"
                  value={`${car.seats} passengers`}
                />
                <Spec
                  icon={Gauge}
                  label="Transmission"
                  value={car.transmission}
                />
                <Spec
                  icon={Fuel}
                  label="Fuel Type"
                  value={car.fuel}
                />
                <Spec
                  icon={MapPin}
                  label="Location"
                  value={car.location}
                />
              </div>
            </div>

            {/* Booking action */}
            <div className="mt-6">
              {canInquire ? (
                <Link
                  href={`/contact?car=${encodeURIComponent(car.name)}`}
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
