import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarCheck,
  Car,
  CheckCircle2,
  Clock,
  MapPin,
  Plane,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const services = [
  {
    title: "Self-Drive Car Hire",
    description:
      "Choose a clean and reliable vehicle for your personal errands, business meetings, weekend travel, or daily movement around Nairobi and beyond.",
    icon: Car,
  },
  {
    title: "Chauffeur / Driver Service",
    description:
      "Need a driver? We can support customers who prefer a comfortable ride with a professional driver for business, events, airport transfers, or long trips.",
    icon: Users,
  },
  {
    title: "Airport Pickup & Drop-off",
    description:
      "Book convenient airport transfer services for arrivals and departures. We help make your travel smoother from the airport to your destination.",
    icon: Plane,
  },
  {
    title: "Corporate Car Hire",
    description:
      "Flexible transport solutions for companies, teams, executives, consultants, and business visitors who need dependable mobility.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Family & Weekend Trips",
    description:
      "Rent comfortable cars for family travel, road trips, events, shopping days, school runs, or short getaways outside the city.",
    icon: CalendarCheck,
  },
  {
    title: "Long-Term Rentals",
    description:
      "Need a car for several days, weeks, or longer? We support longer bookings for customers who need flexible rental arrangements.",
    icon: Clock,
  },
];

const benefits = [
  "Clean and well-maintained vehicles",
  "Simple online booking request",
  "WhatsApp support for quick confirmation",
  "Flexible pickup and return options",
  "Cars for business, family, and personal use",
  "Transparent daily rental pricing",
];

const process = [
  {
    step: "01",
    title: "Choose Your Service",
    description:
      "Select the type of car hire service you need, such as self-drive, chauffeur service, airport transfer, or long-term rental.",
  },
  {
    step: "02",
    title: "Send Booking Request",
    description:
      "Use the booking form to choose a car, pickup date, return date, location, and your contact details.",
  },
  {
    step: "03",
    title: "We Confirm Availability",
    description:
      "Our team reviews your request, confirms vehicle availability, and follows up through phone or WhatsApp.",
  },
  {
    step: "04",
    title: "Enjoy Your Trip",
    description:
      "Pick up your car or arrange delivery, then enjoy a reliable rental experience with support when needed.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />

      <main className="bg-[#f4f7fb]">
        <section className="px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8 lg:p-10">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Our Services
                </p>

                <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Car Hire Services Built for Every Trip
                </h1>

                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/70">
                  MoBri Car Hire offers flexible vehicle rental services for
                  personal travel, business movement, airport transfers, family
                  trips, and long-term use. Choose the service that fits your
                  journey and send a booking request in minutes.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <HeroPill icon={Car} title="Self-Drive" text="Move freely" />

                  <HeroPill
                    icon={Plane}
                    title="Airport"
                    text="Easy transfers"
                  />

                  <HeroPill
                    icon={BriefcaseBusiness}
                    title="Business"
                    text="Corporate trips"
                  />
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    View Available Cars
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    Request Booking
                  </Link>
                </div>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-slate-200 shadow-sm">
                <Image
                  src="/lexus.jpeg"
                  alt="MoBri Car Hire service vehicle"
                  fill
                  priority
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/80 via-[#06142A]/15 to-transparent" />

                <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={18}
                      className="fill-[#FF6B00] text-[#FF6B00]"
                    />
                    <p className="text-sm font-black">
                      Flexible rental solutions
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium leading-6 text-white/75">
                    From daily rentals to airport transfers and business trips,
                    our services are designed around convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  What We Offer
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A] sm:text-4xl">
                  Services for Different Customer Needs
                </h2>
              </div>

              <p className="max-w-xl text-sm font-medium leading-7 text-slate-600">
                Whether you need a car for one day, a driver for an important
                trip, or a longer rental arrangement, MoBri Car Hire gives you a
                simple way to request and confirm your booking.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <article
                    key={service.title}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                      <Icon size={30} />
                    </div>

                    <h3 className="mt-6 text-xl font-black text-[#06142A]">
                      {service.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-7 text-slate-500">
                      {service.description}
                    </p>

                    <Link
                      href="/contact"
                      className="mt-6 inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9]"
                    >
                      Request service
                      <ArrowRight size={16} />
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Why Our Services Work
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Simple, Flexible, and Customer Focused
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  We designed our car hire service around practical customer
                  needs. You can browse cars online, send a booking request,
                  continue on WhatsApp, and wait for confirmation from the admin
                  team.
                </p>

                <div className="mt-6 grid gap-3">
                  {benefits.map((benefit) => (
                    <div
                      key={benefit}
                      className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4"
                    >
                      <CheckCircle2
                        size={20}
                        className="mt-0.5 shrink-0 text-[#1E6FD9]"
                      />

                      <p className="text-sm font-bold leading-6 text-slate-700">
                        {benefit}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl bg-[#06142A] p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Booking Process
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  How to Book a Service
                </h2>

                <div className="mt-7 space-y-4">
                  {process.map((item) => (
                    <div
                      key={item.step}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6B00] text-sm font-black text-white">
                          {item.step}
                        </div>

                        <div>
                          <h3 className="text-base font-black">{item.title}</h3>

                          <p className="mt-2 text-sm font-medium leading-6 text-white/65">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-[#1E6FD9]">
                  <ShieldCheck size={32} />
                </div>

                <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Reliable Support for Your Journey
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  Our team helps customers choose the right vehicle and confirms
                  booking requests quickly. Whether you are travelling within
                  Nairobi or planning a longer trip, we aim to make the process
                  straightforward.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <MiniFeature icon={MapPin} text="Flexible locations" />
                  <MiniFeature icon={Clock} text="Fast confirmation" />
                  <MiniFeature icon={Car} text="Multiple car types" />
                  <MiniFeature icon={Users} text="Driver options" />
                </div>
              </section>

              <section className="rounded-3xl bg-[#06142A] p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Ready to Start?
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Choose a Car Hire Service Today
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-white/70">
                  Browse the fleet or send a booking request now. Your request
                  will be saved in the system and reviewed by the admin team.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Book Now
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-4 text-sm font-black text-white transition hover:bg-white/15"
                  >
                    View Cars
                  </Link>
                </div>
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

function MiniFeature({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1E6FD9]">
        <Icon size={20} />
      </div>

      <p className="text-sm font-black text-[#06142A]">{text}</p>
    </div>
  );
}
