"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Car,
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
  ShieldCheck,
  UserCheck,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

const faqCategories = [
  {
    title: "Booking",
    description: "Questions about reservations and booking requests.",
    icon: CalendarDays,
  },
  {
    title: "Requirements",
    description: "Documents and customer details needed before rental.",
    icon: BadgeCheck,
  },
  {
    title: "Payments",
    description: "Rates, deposits, fuel, and payment arrangements.",
    icon: CreditCard,
  },
  {
    title: "Support",
    description: "Cancellations, changes, pickup, and customer help.",
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

      <main className="bg-[#f4f7fb]">
        <section className="px-4 pb-12 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                FAQs
              </p>

              <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#06142A] sm:text-5xl lg:text-6xl">
                Frequently Asked Questions
              </h1>

              <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
                Find clear answers about MoBri Car Hire bookings, documents,
                payments, fuel policy, cancellations, airport pickup, and rental
                support.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {faqCategories.map((category) => {
                const Icon = category.icon;

                return (
                  <article
                    key={category.title}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                      <Icon size={30} />
                    </div>

                    <h2 className="mt-5 text-xl font-black text-[#06142A]">
                      {category.title}
                    </h2>

                    <p className="mt-2 text-sm font-medium leading-7 text-slate-600">
                      {category.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="relative h-72 bg-slate-200">
                  <Image
                    src="/lexus.jpeg"
                    alt="MoBri Car Hire support"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>

                <div className="bg-[#06142A] p-6 text-white sm:p-8">
                  <h2 className="text-2xl font-black tracking-[-0.04em]">
                    Still have questions?
                  </h2>

                  <div className="mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

                  <p className="mt-5 text-sm font-medium leading-7 text-white/70">
                    Our team can help with car availability, rental terms,
                    pickup locations, booking changes, and special travel
                    requests.
                  </p>

                  <div className="mt-6 space-y-4">
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
                    className="mt-7 inline-flex items-center justify-center gap-3 rounded-xl bg-[#FF6B00] px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Contact Us
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </aside>

              <div className="space-y-4">
                {faqs.map((faq, index) => {
                  const Icon = faq.icon;
                  const isOpen = openIndex === index;

                  return (
                    <article
                      key={faq.question}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenIndex(isOpen ? -1 : index)}
                        className="flex w-full items-start gap-4 text-left"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                          <Icon size={24} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-black tracking-[-0.03em] text-[#06142A] sm:text-xl">
                            {faq.question}
                          </h3>

                          {isOpen && (
                            <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                              {faq.answer}
                            </p>
                          )}
                        </div>

                        <Plus
                          size={24}
                          className={`mt-3 shrink-0 text-[#06142A] transition ${
                            isOpen ? "rotate-45" : ""
                          }`}
                        />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Booking Help
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Need Help Choosing a Car?
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-slate-600">
                  Browse the available fleet or contact us directly with your
                  travel date, destination, number of passengers, and preferred
                  vehicle type. Our team will recommend a suitable option.
                </p>

                <div className="mt-6 grid gap-3">
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
                    text="Request pickup, chauffeur, long-term rental, or airport service."
                  />
                </div>
              </section>

              <section className="rounded-3xl bg-[#06142A] p-6 text-white shadow-sm sm:p-8">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Ready to Book?
                </p>

                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">
                  Send a Booking Request Today
                </h2>

                <p className="mt-4 text-sm font-medium leading-7 text-white/70">
                  Choose your car, pickup date, return date, and location. Your
                  request will be saved in our system and reviewed by the admin
                  team.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                  >
                    Book Now
                    <CalendarDays size={18} />
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
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#FF6B00]">
        <Icon size={20} />
      </div>

      <div>
        <p className="text-xs font-semibold text-white/55">{label}</p>
        <p className="mt-1 text-sm font-black">{value}</p>
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
    <div className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#FF6B00]">
        <Icon size={21} />
      </div>

      <div>
        <p className="text-sm font-black text-[#06142A]">{title}</p>
        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}
