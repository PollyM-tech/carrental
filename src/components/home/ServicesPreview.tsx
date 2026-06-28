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
      "Reliable pickups and drop-offs for JKIA, Wilson Airport, and hotel transfers.",
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
      "We are available to help with booking questions, changes, and confirmations.",
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
    description: "Choose from economy, SUV, luxury, and family cars.",
    icon: Car,
  },
  {
    title: "24/7 Customer Support",
    description: "Our team is always ready to assist you.",
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
    <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
            Our Services
          </p>

          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#06142A] sm:text-5xl lg:text-6xl">
            Premium Services, Every Step of the Way
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            From airport transfers to long-term rentals, we offer a wide range
            of car hire services to make your journey smooth, comfortable, and
            worry-free.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;

            return (
              <article
                key={service.title}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="relative h-44 overflow-hidden bg-slate-200">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="relative px-5 pb-6 pt-9">
                  <div className="absolute -top-8 left-5 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-orange-50 text-[#FF6B00] shadow-sm">
                    <Icon size={26} />
                  </div>

                  <h3 className="text-xl font-black tracking-[-0.03em] text-[#06142A]">
                    {service.title}
                  </h3>

                  <p className="mt-2 min-h-[56px] text-sm font-medium leading-7 text-slate-600">
                    {service.description}
                  </p>

                  <Link
                    href="/services"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[#FF6B00]"
                  >
                    Learn more
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl bg-[#06142A] px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-7">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className={`flex items-center gap-4 ${
                    index !== benefits.length - 1
                      ? "xl:border-r xl:border-white/10"
                      : ""
                  }`}
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[#FF6B00]">
                    <Icon size={28} />
                  </div>

                  <div>
                    <h3 className="text-base font-black">{benefit.title}</h3>
                    <p className="mt-1 text-sm font-medium leading-6 text-white/70">
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
