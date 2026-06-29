import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Car,
  Headphones,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Star,
  Users,
} from "lucide-react";

const benefits = [
  {
    title: "Best Price Guarantee",
    description: "Clear rates with no hidden fees.",
    icon: ShieldCheck,
  },
  {
    title: "Wide Range of Cars",
    description: "Choose a car that fits your needs.",
    icon: Car,
  },
  {
    title: "24/7 Customer Support",
    description: "We are here when you need help.",
    icon: Headphones,
  },
  {
    title: "Flexible Booking",
    description: "Easy request and confirmation flow.",
    icon: RefreshCcw,
  },
];

export default function CTASection() {
  return (
    <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-3xl bg-[#06142A] shadow-2xl shadow-slate-900/10">
          <Image
            src="/mercedes.jpg"
            alt="MoBri Car Hire vehicle"
            fill
            sizes="100vw"
            className="object-cover opacity-45"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/90 to-[#06142A]/30" />

          <div className="relative px-6 py-14 text-white sm:px-10 lg:px-14 lg:py-20">
            <p className="flex items-center gap-3 text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
              <span className="h-0.5 w-10 rounded-full bg-[#FF6B00]" />
              Ready to hit the road?
            </p>

            <h2 className="mt-6 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Ready to Start Your Journey?
            </h2>

            <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/75 sm:text-lg">
              Book your perfect car today and enjoy the road ahead with comfort,
              reliability, and peace of mind.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#FF6B00] px-7 py-4 text-base font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
              >
                <CalendarCheck size={20} />
                Book Now
                <ArrowRight size={20} />
              </Link>

              <Link
                href="tel:+254716741039"
                className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-7 py-4 text-base font-black text-white transition hover:bg-white/15"
              >
                <Phone size={20} />
                Call Us Now
              </Link>
            </div>

            <div className="mt-9 flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex -space-x-3">
                <Avatar label="JM" />
                <Avatar label="AO" />
                <Avatar label="BK" />
                <Avatar label="WN" />
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-[#FF6B00] text-xs font-black text-white">
                  10K+
                </div>
              </div>

              <div className="hidden h-12 w-px bg-white/15 sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={20} className="fill-yellow-400" />
                  ))}
                </div>

                <p className="text-sm font-bold text-white">
                  4.8{" "}
                  <span className="font-medium text-white/55">
                    (2.3k reviews)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`flex items-center gap-4 ${
                    index !== benefits.length - 1
                      ? "xl:border-r xl:border-slate-200"
                      : ""
                  }`}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B00]">
                    <Icon size={30} />
                  </div>

                  <div>
                    <p className="text-base font-black text-[#06142A]">
                      {benefit.title}
                    </p>

                    <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ label }: { label: string }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-black text-[#06142A]">
      {label}
    </div>
  );
}
