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
      "Our fleet is selected and maintained to give customers dependable cars for city drives, business trips, airport transfers, and family travel.",
    icon: Car,
  },
  {
    title: "Customer First",
    description:
      "We focus on simple booking, clear communication, and quick support before, during, and after every rental.",
    icon: Users,
  },
  {
    title: "Safe & Transparent",
    description:
      "We keep our booking process clear, our pricing straightforward, and our vehicle status updated for better customer confidence.",
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

      <main className="bg-[#f4f7fb]">
        <section className="px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8 lg:p-10">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  About MoBri Car Hire
                </p>

                <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Reliable Car Hire Built Around Your Journey
                </h1>

                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/70">
                  MoBri Car Hire provides convenient, reliable, and customer
                  focused vehicle rental services in Nairobi and across Kenya.
                  Whether you need a car for business, airport transfer, family
                  travel, errands, or a weekend trip, we make the booking
                  process simple and clear.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    View Our Fleet
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    Book a Car
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-200 shadow-sm">
                <Image
                  src="/familycar.jpg"
                  alt="MoBri Car Hire vehicle"
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/80 via-[#06142A]/10 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Star size={18} className="fill-[#FF6B00] text-[#FF6B00]" />
                    <p className="text-sm font-black">
                      Trusted car hire experience
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-6 text-white/75">
                    Built for customers who need clean cars, quick support, and
                    a simple rental process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <p className="text-4xl font-black tracking-[-0.04em] text-[#06142A]">
                    {stat.value}
                  </p>

                  <p className="mt-2 text-sm font-black text-slate-600">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Our Story
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A] sm:text-4xl">
                  A Better Way to Book a Car
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  MoBri Car Hire was created to make vehicle rental easier for
                  customers who want dependable cars without unnecessary stress.
                  Many customers need a car quickly, but they also want clear
                  communication, fair pricing, and confidence that the vehicle
                  they choose is actually available.
                </p>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
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
                      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                        <Icon size={26} />
                      </div>

                      <h3 className="mt-5 text-lg font-black text-[#06142A]">
                        {item.title}
                      </h3>

                      <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Why Choose Us
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Built for Convenience and Trust
                </h2>

                <div className="mt-6 grid gap-3">
                  {reasons.map((reason) => (
                    <div
                      key={reason}
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-[#1E6FD9]"
                      />

                      <p className="text-sm font-bold leading-6 text-slate-700">
                        {reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Ready to Book?
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Find the Right Car for Your Trip Today
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-white/70">
                  Browse our available vehicles, choose your preferred car, and
                  send a booking request. Our team will review it and confirm
                  availability quickly.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Browse Cars
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15"
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
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#FF6B00]">
        <Icon size={20} />
      </div>

      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs font-semibold text-white/55">{text}</p>
    </div>
  );
}
