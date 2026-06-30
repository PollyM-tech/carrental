import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Car,
  Headphones,
  MapPin,
  Plane,
  RefreshCcw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const services = [
  {
    title: "Airport Transfers",
    description:
      "Reliable pickups and drop-offs for JKIA, Wilson Airport, hotels, and offices.",
    image: "/lexus.jpeg",
    icon: Plane,
  },
  {
    title: "Self Drive Car Hire",
    description:
      "Choose a clean vehicle and enjoy the freedom to drive around Kenya.",
    image: "/familycar.jpg",
    icon: Car,
  },
  {
    title: "Chauffeur Services",
    description:
      "Relax while a professional driver handles your trip, event, or business travel.",
    image: "/mercedes.jpg",
    icon: UserCheck,
  },
  {
    title: "Business Hire",
    description:
      "Car hire solutions for executives, teams, consultants, and corporate visitors.",
    image: "/lexus.jpeg",
    icon: BriefcaseBusiness,
  },
  {
    title: "Long-term Rentals",
    description:
      "Flexible rental plans for customers who need a car for weeks or months.",
    image: "/familycar.jpg",
    icon: CalendarDays,
  },
  {
    title: "Insurance Options",
    description:
      "Rental support designed to make your journey safer and more comfortable.",
    image: "/mercedes.jpg",
    icon: ShieldCheck,
  },
  {
    title: "Travel Solutions",
    description:
      "Car hire support for road trips, family travel, events, and out-of-town journeys.",
    image: "/familycar.jpg",
    icon: MapPin,
  },
  {
    title: "24/7 Customer Support",
    description:
      "We help with booking questions, changes, availability, and confirmations.",
    image: "/lexus.jpeg",
    icon: Headphones,
  },
];

const benefits = [
  {
    title: "Best Price Guarantee",
    description: "Clear daily rates with no hidden fees.",
    icon: ShieldCheck,
  },
  {
    title: "Wide Range of Cars",
    description: "Economy, SUV, luxury, and family cars.",
    icon: Car,
  },
  {
    title: "24/7 Customer Support",
    description: "Our team is ready to assist you.",
    icon: Headphones,
  },
  {
    title: "Flexible Booking",
    description: "Request changes and confirmations easily.",
    icon: RefreshCcw,
  },
];

export default function ServicesPreview() {
  return (
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            Our Services
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Premium Services, Every Step of the Way
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            From airport transfers to long-term rentals, we offer car hire
            services that make your journey smooth, comfortable, and simple.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
              >
                <div className="relative h-40 overflow-hidden rounded-2xl bg-slate-200">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/55 via-transparent to-transparent" />

                  <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/90 text-orange-600 shadow-sm backdrop-blur">
                    <Icon size={18} />
                  </div>
                </div>

                <div className="px-3 pb-4 pt-4">
                  <h3 className="text-sm font-black text-[#0A1628]">
                    {service.title}
                  </h3>

                  <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    href="/services"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-black text-orange-600 transition hover:text-orange-700"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl bg-[#06142A] p-5 text-white shadow-[0_28px_80px_rgba(10,22,40,0.12)] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-4 text-sm font-black">{benefit.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/services"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700 sm:w-fit"
          >
            View All Services
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
