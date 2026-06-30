import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const values = [
  {
    title: "Reliable Vehicles",
    description:
      "Clean and well-maintained cars for city drives, airport transfers, family trips, business travel, and weekend plans.",
    icon: Car,
  },
  {
    title: "Customer First",
    description:
      "Simple booking, clear communication, and responsive support before, during, and after every rental.",
    icon: Users,
  },
  {
    title: "Safe & Transparent",
    description:
      "Straightforward rental terms, clear vehicle status, and honest support to help customers book with confidence.",
    icon: ShieldCheck,
  },
];

const stats = [
  {
    label: "Quality Fleet",
    value: "20+",
  },
  {
    label: "Customer Support",
    value: "24/7",
  },
  {
    label: "Nairobi Based",
    value: "KE",
  },
  {
    label: "Easy Booking",
    value: "Fast",
  },
];

const reasons = [
  "Clean and well-maintained vehicles",
  "Flexible pickup and return locations",
  "Simple online booking request system",
  "WhatsApp support for quick confirmation",
  "Cars for personal, family, and business use",
  "Transparent daily rental pricing",
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f6f8fb]">
        <section className="px-4 pb-12 pt-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-[0_28px_80px_rgba(10,22,40,0.12)] sm:p-8">
                <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                  About MoBri Car Hire
                </span>

                <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
                  Reliable Car Hire Built Around Your Journey
                </h1>

                <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
                  MoBri Car Hire provides convenient, reliable, and
                  customer-focused vehicle rental services in Nairobi and across
                  Kenya. Whether you need a car for business, airport transfer,
                  family travel, errands, or a weekend trip, we make the booking
                  process simple and clear.
                </p>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <HeroPill
                    icon={Car}
                    title="Fleet"
                    text="Cars for every trip"
                  />
                  <HeroPill
                    icon={Clock}
                    title="Fast"
                    text="Quick booking flow"
                  />
                  <HeroPill
                    icon={MapPin}
                    title="Kenya"
                    text="Based in Nairobi"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
                  >
                    View Our Fleet
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    Book a Car
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-slate-200 shadow-[0_28px_80px_rgba(10,22,40,0.10)] sm:min-h-[430px]">
                <Image
                  src="/familycar.jpg"
                  alt="MoBri Car Hire vehicle"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/85 via-[#06142A]/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Star
                      size={18}
                      className="fill-orange-500 text-orange-500"
                    />
                    <p className="text-sm font-black">
                      Trusted car hire experience
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-white/75">
                    Built for customers who need clean cars, quick support, and
                    a simple rental process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="mx-auto max-w-[1120px]">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                  >
                    <p className="text-xl font-black leading-none tracking-[-0.04em] text-[#0A1628]">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-8">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                  Our Story
                </span>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-3xl">
                  A Better Way to Book a Car
                </h2>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  MoBri Car Hire was created to make vehicle rental easier for
                  customers who want dependable cars without unnecessary stress.
                  Many customers need a car quickly, but they also want clear
                  communication, fair pricing, and confidence that the vehicle
                  they choose is actually available.
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  Our system supports both online booking requests and WhatsApp
                  confirmation, giving customers a smooth way to reach us while
                  allowing our admin team to manage cars, bookings, and vehicle
                  availability from one dashboard.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">
                {values.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                        <Icon size={20} />
                      </div>

                      <h3 className="mt-4 text-sm font-black text-[#0A1628]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-8">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                  Why Choose Us
                </span>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-3xl">
                  Built for Convenience and Trust
                </h2>

                <div className="mt-6 grid gap-3">
                  {reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-orange-600"
                      />

                      <p className="text-sm font-semibold leading-6 text-slate-700">
                        {reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-[0_28px_80px_rgba(10,22,40,0.10)] sm:p-8">
                <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                  Ready to Book?
                </span>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                  Find the Right Car for Your Trip Today
                </h2>

                <p className="mt-4 text-sm leading-6 text-white/75">
                  Browse our available vehicles, choose your preferred car, and
                  send a booking request. Our team will review it and confirm
                  availability quickly.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
                  >
                    Browse Cars
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}

function HeroPill({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-400">
        <Icon size={18} />
      </div>

      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs font-semibold leading-5 text-white/55">
        {text}
      </p>
    </div>
  );
}
