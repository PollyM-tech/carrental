
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { services } from "@/data/services";

export default function ServicesPreview() {
  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className="scroll-mt-24 bg-white px-4 py-12 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E86D00]">
            OUR SERVICES
          </span>

          <h2
            id="services-heading"
            className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[30px] lg:text-[34px]"
          >
            Car Hire Services{" "}
            <span className="text-[#FF7A00]">
              for Every Journey.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Discover self-drive rental options for
            business, family travel, airport vehicle
            collection, and longer journeys with Movara.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.slug}
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-orange-200 hover:shadow-[0_10px_25px_rgba(11,28,77,0.06)]"
              >
                {/* Service image */}
                <div className="relative h-40 overflow-hidden bg-slate-100 sm:h-44">
                  <Image
                    src={service.image}
                    alt={`${service.title} with Movara Car Hire`}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#071426]/30 to-transparent" />

                  <div className="absolute bottom-3 left-4 flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#FF7A00]">
                    <Icon
                      size={18}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Service content */}
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <h3 className="text-[15px] font-bold text-[#0B1C4D]">
                    {service.title}
                  </h3>

                  <p className="mt-2 flex-1 text-[14px] leading-6 text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    href={`/services#${service.slug}`}
                    className="mt-4 inline-flex min-h-9 w-fit items-center gap-1.5 text-[13px] font-medium text-[#E86D00] transition-colors hover:text-[#0B1C4D]"
                  >
                    Learn More
                    <ArrowRight
                      size={15}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* Compact bottom CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
          >
            View All Services
            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
