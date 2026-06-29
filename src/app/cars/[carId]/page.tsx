"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  CalendarCheck,
  Car,
  CheckCircle2,
  Fuel,
  Gauge,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: string) {
  if (status === "available") return "bg-green-100 text-green-700";
  if (status === "booked") return "bg-blue-100 text-blue-700";
  if (status === "maintenance") return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

export default function CarDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const carId = params.carId as Id<"cars">;

  const car = useQuery(api.cars.getPublicCarById, carId ? { carId } : "skip");

  if (car === undefined) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 pt-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              Loading car details...
            </p>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  if (!car) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4 pt-24">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-black text-[#06142A]">
              Car not found
            </h1>

            <p className="mt-2 text-sm font-medium text-slate-500">
              This vehicle may no longer be available.
            </p>

            <Link
              href="/cars"
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#FF6B00] px-5 py-3 text-sm font-black text-white"
            >
              Back to Cars
            </Link>
          </div>
        </main>
        <Footer />
        <WhatsAppButton />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#f4f7fb]">
        <section className="px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <button
              type="button"
              onClick={() => router.back()}
              className="mb-6 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9]"
            >
              <ArrowLeft size={17} />
              Back
            </button>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="relative h-[330px] bg-slate-200 sm:h-[430px] lg:h-[560px]">
                  {car.displayImageUrl ? (
                    <Image
                      src={car.displayImageUrl}
                      alt={car.name}
                      fill
                      priority
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                      No image available
                    </div>
                  )}

                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    <span
                      className={`rounded-xl px-4 py-2 text-xs font-black ${statusClass(
                        car.status,
                      )}`}
                    >
                      {formatStatus(car.status)}
                    </span>

                    {car.isFeatured && (
                      <span className="rounded-xl bg-orange-100 px-4 py-2 text-xs font-black text-orange-700">
                        Featured
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-5">
                <section className="rounded-3xl bg-[#06142A] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
                  <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                    Vehicle Details
                  </p>

                  <h1 className="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                    {car.name}
                  </h1>

                  <div className="mt-4 flex items-center gap-2 text-sm">
                    <Star size={18} className="fill-[#FF6B00] text-[#FF6B00]" />
                    <span className="font-black">{car.rating ?? 4.8}</span>
                    <span className="font-medium text-white/60">
                      ({car.reviewCount ?? 0} reviews)
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium leading-7 text-white/70">
                    {car.description ||
                      "A clean and reliable vehicle suitable for personal travel, business movement, family trips, airport transfers, and flexible car hire needs."}
                  </p>

                  <div className="mt-7 rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/50">
                      Daily Rate
                    </p>

                    <p className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">
                      KSh {car.pricePerDay.toLocaleString()}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white/55">
                      per day
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Link
                      href={`/contact?carId=${car._id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                    >
                      <CalendarCheck size={18} />
                      Book Now
                    </Link>

                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15"
                    >
                      <MessageCircle size={18} />
                      Ask Question
                    </Link>
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[#06142A]">
                    Quick Specs
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <SpecCard
                      icon={Car}
                      label="Category"
                      value={car.category}
                    />
                    <SpecCard
                      icon={Users}
                      label="Seats"
                      value={`${car.seats} seats`}
                    />
                    <SpecCard
                      icon={Gauge}
                      label="Transmission"
                      value={car.transmission}
                    />
                    <SpecCard icon={Fuel} label="Fuel" value={car.fuel} />
                    <SpecCard
                      icon={MapPin}
                      label="Location"
                      value={car.location || "Nairobi"}
                    />
                    <SpecCard
                      icon={ShieldCheck}
                      label="Status"
                      value={formatStatus(car.status)}
                    />
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black tracking-[-0.04em] text-[#06142A]">
                  Why Choose This Car?
                </h2>

                <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                  This vehicle is suitable for customers who want a dependable,
                  comfortable, and convenient car hire experience. You can send
                  a booking request online and our team will confirm
                  availability.
                </p>

                <div className="mt-6 grid gap-3">
                  <Benefit text="Clean and well-maintained vehicle" />
                  <Benefit text="Suitable for personal, family, or business use" />
                  <Benefit text="Easy booking request and WhatsApp confirmation" />
                  <Benefit text="Flexible pickup and return arrangement" />
                </div>
              </section>

              <section className="rounded-3xl bg-[#06142A] p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Ready to Book?
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Reserve {car.name} Today
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-white/70">
                  Click Book Now to send your request. Your booking will be
                  saved to the admin dashboard and our team will follow up.
                </p>

                <Link
                  href={`/contact?carId=${car._id}`}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  Book This Car
                  <CalendarCheck size={18} />
                </Link>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}

function SpecCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1E6FD9]">
          <Icon size={19} />
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-sm font-black text-[#06142A]">{value}</p>
        </div>
      </div>
    </div>
  );
}

function Benefit({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#1E6FD9]" />

      <p className="text-sm font-bold leading-6 text-slate-700">{text}</p>
    </div>
  );
}
