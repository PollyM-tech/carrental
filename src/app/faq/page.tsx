"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Car,
  ChevronDown,
  CircleX,
  Clock,
  CreditCard,
  Fuel,
  Headphones,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const faqCategories = [
  {
    title: "Booking",
    description: "Reservations and booking requests.",
    icon: CalendarDays,
  },
  {
    title: "Requirements",
    description: "Documents needed before rental.",
    icon: BadgeCheck,
  },
  {
    title: "Payments",
    description: "Rates, deposits, and fuel terms.",
    icon: CreditCard,
  },
  {
    title: "Support",
    description: "Changes, pickup, and customer help.",
    icon: Headphones,
  },
];

const faqs = [
  {
    question: "What documents do I need to rent a car?",
    answer:
      "You will need a valid driving license, national ID or passport, and active contact details. Depending on the vehicle, rental period, or destination, our team may request additional confirmation before approving the booking.",
    icon: BadgeCheck,
  },
  {
    question: "How do I book a car?",
    answer:
      "You can book through the website by selecting a car and filling in the booking form. Your request is saved in our system, then our team follows up by phone or WhatsApp to confirm availability and next steps.",
    icon: CalendarDays,
  },
  {
    question: "Do you offer chauffeur services?",
    answer:
      "Yes. Chauffeur services can be arranged for airport transfers, corporate travel, events, long-distance trips, and customers who prefer not to drive.",
    icon: UserCheck,
  },
  {
    question: "What is the fuel policy?",
    answer:
      "Fuel arrangements are confirmed during booking. Usually, the vehicle should be returned with the agreed fuel level, or the customer settles the difference based on the rental agreement.",
    icon: Fuel,
  },
  {
    question: "Can I cancel or change my booking?",
    answer:
      "Yes. You can request a cancellation or booking change by contacting our team as early as possible. Changes depend on car availability, booking status, and the agreed rental terms.",
    icon: CircleX,
  },
  {
    question: "Do you have insurance included?",
    answer:
      "Our vehicles are prepared with rental safety in mind. Specific insurance details, excess terms, and customer responsibilities depend on the selected vehicle and rental agreement.",
    icon: ShieldCheck,
  },
  {
    question: "Do you offer airport pick-up?",
    answer:
      "Yes. We support airport pickup and drop-off for JKIA, Wilson Airport, hotels, offices, homes, and other agreed locations in or around Nairobi.",
    icon: Plane,
  },
  {
    question: "Can I rent a car for several days or weeks?",
    answer:
      "Yes. We support daily and longer-term rentals. For weekly or extended bookings, contact us so we can confirm vehicle availability and provide the best arrangement.",
    icon: Clock,
  },
  {
    question: "Can I choose a specific vehicle?",
    answer:
      "Yes. You can request a specific vehicle from the fleet. If that vehicle is unavailable for your selected dates, our team may recommend a similar option.",
    icon: Car,
  },
  {
    question: "Where can I pick up and return the car?",
    answer:
      "Pickup and return locations are agreed during booking. Common options include Nairobi CBD, airport locations, hotels, offices, homes, or other agreed meeting points.",
    icon: MapPin,
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <Navbar />

      <main className="overflow-hidden bg-[#f6f8fb]">
        <section className="px-4 pb-10 pt-24 sm:pt-28">
          <div className="mx-auto max-w-[1120px]">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#06142A] px-5 py-10 text-white shadow-[0_28px_80px_rgba(10,22,40,0.18)] sm:px-8 lg:px-10">
              <Image
                src="/mercedes.jpg"
                alt="MoBri Car Hire vehicle"
                fill
                priority
                sizes="1120px"
                className="object-cover opacity-45"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/92 to-[#06142A]/45" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/70 via-transparent to-transparent" />

              <div className="relative max-w-xl">
                <span className="inline-flex rounded-full border border-orange-400 bg-orange-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                  FAQs
                </span>

                <h1 className="mt-5 text-3xl font-black tracking-[-0.04em] sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h1>

                <p className="mt-4 max-w-lg text-sm leading-6 text-white/80">
                  Find clear answers about bookings, documents, payments, fuel
                  policy, cancellations, airport pickup, and rental support.
                </p>

                <div className="mt-7 flex max-w-md items-center gap-3 rounded-xl bg-white px-4 py-3 text-[#0A1628] shadow-xl shadow-slate-950/20">
                  <Search
                    size={18}
                    className="shrink-0 text-[#06142A]"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-semibold text-slate-600">
                    Browse the questions below or contact us for quick help.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 -mt-4 grid gap-4 px-2 sm:grid-cols-2 lg:grid-cols-4">
              {faqCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <article
                    key={category.title}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(10,22,40,0.08)] transition hover:-translate-y-1 hover:border-orange-300 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[#06142A]">
                        <Icon size={21} />
                      </div>

                      <div>
                        <h2 className="text-sm font-black text-[#0A1628]">
                          {category.title}
                        </h2>

                        <p className="mt-1 text-sm leading-5 text-slate-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-10">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-5 lg:grid-cols-[0.42fr_0.58fr] lg:items-start">
              <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(10,22,40,0.08)] lg:sticky lg:top-28">
                <div className="relative h-56 bg-slate-200">
                  <Image
                    src="/lexus.jpeg"
                    alt="MoBri Car Hire customer support"
                    fill
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#06142A]/80 via-transparent to-transparent" />
                </div>

                <div className="bg-[#06142A] p-5 text-white sm:p-6">
                  <span className="inline-flex rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] font-black text-white">
                    Customer Support
                  </span>

                  <h2 className="mt-4 text-xl font-black tracking-[-0.04em]">
                    Still have questions?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Our team can help with availability, rental terms, pickup
                    locations, booking changes, and travel requests.
                  </p>

                  <div className="mt-5 divide-y divide-white/10">
                    <ContactLine
                      icon={Phone}
                      label="Call Us"
                      value="+254 716 741039"
                    />

                    <ContactLine
                      icon={Mail}
                      label="Email Us"
                      value="info@mobricarhire.co.ke"
                    />

                    <ContactLine
                      icon={MessageCircle}
                      label="WhatsApp"
                      value="+254 716 741039"
                    />
                  </div>

                  <Link
                    href="/contact"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3.5 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.25)] transition hover:-translate-y-1 hover:bg-orange-700"
                  >
                    Contact Us
                    <ArrowRight size={17} />
                  </Link>
                </div>
              </aside>

              <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-5">
                <div className="mb-4 border-b border-slate-100 pb-4">
                  <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-[11px] font-black text-blue-700">
                    Help Center
                  </span>

                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#0A1628]">
                    Common Questions
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Tap a question to view the answer.
                  </p>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  {faqs.map((faq, index) => {
                    const Icon = faq.icon;
                    const isOpen = openIndex === index;

                    return (
                      <article
                        key={faq.question}
                        className={`border-b border-slate-200 last:border-b-0 ${
                          isOpen ? "bg-white" : "bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenIndex(isOpen ? -1 : index)}
                          className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                          aria-expanded={isOpen}
                        >
                          <div
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                              isOpen
                                ? "border-orange-600 bg-orange-600 text-white"
                                : "border-[#06142A]/25 bg-white text-[#06142A]"
                            }`}
                          >
                            {isOpen ? <MinusIcon /> : <Plus size={14} />}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <Icon
                                size={16}
                                className="mt-1 hidden shrink-0 text-orange-600 sm:block"
                              />

                              <h3 className="text-sm font-black leading-6 text-[#0A1628]">
                                {faq.question}
                              </h3>
                            </div>

                            {isOpen && (
                              <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                                {faq.answer}
                              </p>
                            )}
                          </div>

                          <ChevronDown
                            size={16}
                            className={`mt-1 shrink-0 text-[#06142A] transition ${
                              isOpen ? "rotate-180 text-orange-600" : ""
                            }`}
                          />
                        </button>
                      </article>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20">
          <div className="mx-auto max-w-[1120px]">
            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
                <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                  Booking Help
                </span>

                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-3xl">
                  Need Help Choosing a Car?
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                  Browse the available fleet or contact us directly with your
                  travel date, destination, number of passengers, and preferred
                  vehicle type.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <HelpPoint
                    icon={Car}
                    title="Browse Cars"
                    text="Compare vehicles, prices, seats, and features."
                  />

                  <HelpPoint
                    icon={MessageCircle}
                    title="Ask on WhatsApp"
                    text="Get quick help before making a booking request."
                  />

                  <HelpPoint
                    icon={RefreshCcw}
                    title="Flexible Requests"
                    text="Request pickup, chauffeur, or airport service."
                  />
                </div>
              </section>

              <section className="relative overflow-hidden rounded-2xl bg-[#06142A] p-5 text-white shadow-[0_18px_45px_rgba(10,22,40,0.12)] sm:p-6">
                <div className="pointer-events-none absolute -bottom-10 -right-6 h-32 w-32 rounded-full border border-white/10" />
                <div className="pointer-events-none absolute -right-10 top-6 h-24 w-24 rounded-full border border-orange-400/20" />

                <span className="inline-flex rounded-lg bg-orange-600 px-3 py-1.5 text-[11px] font-black text-white">
                  Ready to Book?
                </span>

                <h2 className="mt-4 text-xl font-black tracking-[-0.04em] text-white">
                  Send a Booking Request
                </h2>

                <p className="mt-3 text-sm leading-6 text-white/70">
                  Choose your car and send your trip details. We will confirm
                  availability.
                </p>

                <div className="mt-5 grid gap-2">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-black text-white shadow-[0_14px_28px_rgba(234,88,12,0.22)] transition hover:-translate-y-1 hover:bg-orange-700"
                  >
                    Book Now
                    <CalendarDays size={16} />
                  </Link>

                  <Link
                    href="/cars"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/5 px-4 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
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

function ContactLine({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-white">{label}</p>
        <p className="mt-0.5 truncate text-sm leading-5 text-white/75">
          {value}
        </p>
      </div>
    </div>
  );
}

function HelpPoint({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border-r border-slate-200 p-2 last:border-r-0 sm:block sm:border-r sm:p-0 sm:pr-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        <Icon size={18} />
      </div>

      <div className="min-w-0 sm:mt-3">
        <p className="text-sm font-black text-[#0A1628]">{title}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
      </div>
    </div>
  );
}

function MinusIcon() {
  return <span className="block h-0.5 w-3 rounded-full bg-current" />;
}
