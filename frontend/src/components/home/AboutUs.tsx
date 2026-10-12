
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Wallet,
  CalendarDays,
  Headphones,
  Check,
} from "lucide-react";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Reliable Vehicles",
    description:
      "Clean, well-maintained cars prepared for comfortable journeys.",
  },
  {
    icon: Wallet,
    title: "Clear Rental Terms",
    description:
      "Straightforward pricing and rental information to help you plan.",
  },
  {
    icon: CalendarDays,
    title: "Flexible Car Hire",
    description:
      "Self-drive rental options for short trips and longer journeys.",
  },
  {
    icon: Headphones,
    title: "Helpful Customer Support",
    description:
      "Friendly assistance with inquiries, bookings, and rental arrangements.",
  },
];

export default function AboutUs() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-24 bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E86D00]">
            ABOUT MOVARA CAR HIRE
          </span>

          <h2
            id="about-heading"
            className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[30px] lg:text-[34px]"
          >
            Your Trusted Partner{" "}
            <span className="text-[#FF7A00]">
              on Every Journey.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Discover convenient self-drive car hire for
            business, family trips, leisure travel, and
            everyday journeys across Kenya.
          </p>
        </div>

        {/* Main content */}
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Vehicle image */}
          <div className="relative h-[280px] overflow-hidden rounded-2xl bg-slate-200 sm:h-[340px] lg:h-[390px]">
            <Image
              src="/mercedes.jpg"
              alt="Movara Car Hire rental vehicle"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/65 via-transparent to-transparent" />

            <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
              <div className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-3 py-2 text-[13px] font-medium text-white backdrop-blur-md">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF7A00]">
                  <Check size={14} aria-hidden="true" />
                </span>
                Comfort in every journey
              </div>
            </div>
          </div>

          {/* About content */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              WHO WE ARE
            </span>

            <h3 className="mt-2 text-[22px] font-bold leading-snug tracking-tight text-[#0B1C4D] sm:text-[26px]">
              Car Hire Made Simple,
              Comfortable & Reliable.
            </h3>

            <p className="mt-3 text-[14px] leading-7 text-slate-600">
              At Movara Car Hire, we believe finding the
              right vehicle should be straightforward.
              Whether you are planning a business trip,
              family outing, weekend getaway, or
              long-distance journey, we aim to make
              renting a car simple and convenient.
            </p>

            <p className="mt-3 text-[14px] leading-7 text-slate-600">
              We focus on dependable self-drive vehicles,
              clear communication, and helpful service,
              giving you greater flexibility to travel
              at your own pace.
            </p>

            {/* Benefits */}
            <div className="mt-6 grid gap-x-5 gap-y-5 sm:grid-cols-2">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;

                return (
                  <div
                    key={benefit.title}
                    className="flex items-start gap-3"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A00]">
                      <Icon
                        size={18}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <h4 className="text-[14px] font-bold text-[#0B1C4D]">
                        {benefit.title}
                      </h4>

                      <p className="mt-1 text-[13px] leading-5 text-slate-600">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Call to action */}
            <Link
              href="/cars"
              className="mt-6 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
            >
              Explore Our Cars
              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Mission and vision */}
        <div className="mt-10 grid gap-4 border-t border-slate-200 pt-8 md:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              OUR MISSION
            </span>

            <h3 className="mt-2 text-[17px] font-bold text-[#0B1C4D]">
              Making Travel Easier
            </h3>

            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              To provide convenient, comfortable, and
              dependable self-drive car hire services
              that help customers travel with confidence.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              OUR VISION
            </span>

            <h3 className="mt-2 text-[17px] font-bold text-[#0B1C4D]">
              A Trusted Car Hire Brand
            </h3>

            <p className="mt-2 text-[14px] leading-6 text-slate-600">
              To become a preferred self-drive car hire
              brand in Kenya, recognized for reliable
              vehicles, customer care, and convenient
              rental experiences.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
