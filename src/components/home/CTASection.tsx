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
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="relative overflow-hidden rounded-3xl bg-[#06142A] shadow-[0_28px_80px_rgba(10,22,40,0.12)]">
          <Image
            src="/mercedes.jpg"
            alt="MoBri Car Hire vehicle"
            fill
            sizes="(max-width: 768px) 100vw, 1120px"
            className="object-cover opacity-35"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/90 to-[#06142A]/40" />

          <div className="relative px-6 py-14 text-white sm:px-8 md:px-10 lg:px-12">
            <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
              Ready to hit the road?
            </span>

            <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
              Ready to Start Your Journey?
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75">
              Book your perfect car today and enjoy the road ahead with comfort,
              reliability, and peace of mind.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
              >
                <CalendarCheck size={18} />
                Book Now
                <ArrowRight size={18} />
              </Link>

              <Link
                href="tel:+254716741039"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
              >
                <Phone size={18} />
                Call Us Now
              </Link>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex -space-x-3">
                <Avatar label="JM" />
                <Avatar label="AO" />
                <Avatar label="BK" />
                <Avatar label="WN" />

                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-orange-600 text-[11px] font-black text-white">
                  10K+
                </div>
              </div>

              <div className="hidden h-10 w-px bg-white/15 sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex gap-1 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={16} className="fill-yellow-400" />
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

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon size={18} />
                  </div>

                  <p className="mt-4 text-sm font-black text-[#0A1628]">
                    {benefit.title}
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {benefit.description}
                  </p>
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
    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[11px] font-black text-[#0A1628]">
      {label}
    </div>
  );
}
