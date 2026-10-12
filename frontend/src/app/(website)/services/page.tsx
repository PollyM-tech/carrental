
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  MessageCircle,
  Search,
  CarFront,
} from "lucide-react";

import { services } from "@/data/services";

const process = [
  {
    number: "01",
    icon: Search,
    title: "Explore Our Services",
    description:
      "Find a self-drive rental option that suits your journey.",
  },
  {
    number: "02",
    icon: CarFront,
    title: "Choose Your Vehicle",
    description:
      "Browse our fleet and select your preferred vehicle.",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Send an Inquiry",
    description:
      "Share your rental dates, location, and requirements.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Confirm Your Rental",
    description:
      "Our team will confirm availability and rental terms.",
  },
];

export default function ServicesPage() {
  return (
    <main className="bg-white">
      {/* Page hero */}
      <section className="bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Text */}
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E86D00]">
              MOVARA CAR HIRE SERVICES
            </span>

            <h1 className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[34px] lg:text-[38px]">
              Car Hire Solutions{" "}
              <span className="text-[#FF7A00]">
                for Every Journey.
              </span>
            </h1>

            <p className="mt-4 max-w-lg text-[14px] leading-7 text-slate-600">
              Whether you need a self-drive car for
              business, family travel, a weekend getaway,
              or an extended trip, Movara Car Hire helps
              you explore suitable rental options.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/cars"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
              >
                Explore Our Fleet
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>

              <Link
                href="/contact"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-medium text-[#0B1C4D] transition-colors hover:border-orange-200"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Image */}
          <div className="relative h-[220px] overflow-hidden rounded-2xl bg-slate-100 sm:h-[280px] lg:h-[320px]">
            <Image
              src="/lexus.jpeg"
              alt="Vehicle available for inquiry at Movara Car Hire"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </div>
        </div>
      </section>

      {/* Services listing */}
      <section
        aria-labelledby="services-title"
        className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              WHAT WE OFFER
            </span>

            <h2
              id="services-title"
              className="mt-3 text-[26px] font-bold leading-tight text-[#0B1C4D] sm:text-[30px] lg:text-[34px]"
            >
              Explore Our Services
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
              Flexible self-drive vehicle hire options
              for personal, business, and leisure travel.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.slug}
                  id={service.slug}
                  className="scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-orange-200"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A00]">
                    <Icon
                      size={19}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  <h3 className="mt-4 text-[16px] font-bold text-[#0B1C4D]">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-6 text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    href="/contact"
                    className="mt-4 inline-flex min-h-9 items-center gap-1.5 text-[13px] font-medium text-[#E86D00] hover:text-[#0B1C4D]"
                  >
                    Inquire Now
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                    />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Rental process */}
      <section
        aria-labelledby="booking-process-title"
        className="bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              SIMPLE RENTAL PROCESS
            </span>

            <h2
              id="booking-process-title"
              className="mt-3 text-[26px] font-bold text-[#0B1C4D] sm:text-[30px]"
            >
              How to Arrange Your Rental
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
              Four simple steps to help you plan
              your next journey with Movara.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {process.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A00]">
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                        aria-hidden="true"
                      />
                    </div>

                    <span className="text-xs font-medium text-slate-400">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-4 text-[15px] font-bold text-[#0B1C4D]">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-[14px] leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#0B1C4D] px-6 py-8 text-white sm:px-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <span className="text-[11px] font-bold uppercase tracking-wide text-orange-300">
                READY TO GET STARTED?
              </span>

              <h2 className="mt-3 text-[24px] font-bold leading-tight sm:text-[28px]">
                Find the Right Car for Your Next Trip.
              </h2>

              <p className="mt-3 text-[14px] leading-6 text-slate-200">
                Browse our available vehicles or contact
                us to discuss your self-drive rental plans.
              </p>
            </div>

            <Link
              href="/cars"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
            >
              Explore Cars
              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
