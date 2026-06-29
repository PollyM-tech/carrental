"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  CircleX,
  Fuel,
  Mail,
  MessageCircle,
  Phone,
  Plane,
  Plus,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const faqs = [
  {
    question: "What documents do I need to rent a car?",
    answer:
      "You will need a valid driving license, national ID or passport, and your contact details. Extra requirements may apply depending on the vehicle type and rental period.",
    icon: BadgeCheck,
  },
  {
    question: "Do you offer chauffeur services?",
    answer:
      "Yes. Customers can request chauffeur services for business travel, airport transfers, events, and long-distance trips.",
    icon: UserCheck,
  },
  {
    question: "What is the fuel policy?",
    answer:
      "Fuel arrangements are confirmed during booking. In most cases, the car is returned with the agreed fuel level or according to the rental agreement.",
    icon: Fuel,
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can request cancellation. Please contact our team as early as possible so we can update your booking status and advise on next steps.",
    icon: CircleX,
  },
  {
    question: "Do you have insurance included?",
    answer:
      "Our vehicles are prepared with rental safety in mind. Specific insurance details depend on the car and rental arrangement, and our team will confirm before booking.",
    icon: ShieldCheck,
  },
  {
    question: "Do you offer airport pick-up?",
    answer:
      "Yes. We support airport pickup and drop-off for JKIA, Wilson Airport, hotels, offices, and other agreed locations.",
    icon: Plane,
  },
];

export default function FAQPreview() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
            FAQs
          </p>

          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#06142A] sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            Find answers to common questions about our car hire services,
            bookings, and customer support.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <div className="relative h-64 bg-slate-200">
              <Image
                src="/lexus.jpeg"
                alt="MoBri Car Hire support"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div className="bg-[#06142A] p-6 text-white sm:p-8">
              <h3 className="text-2xl font-black tracking-[-0.04em]">
                Still have questions?
              </h3>

              <div className="mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

              <p className="mt-5 text-sm font-medium leading-7 text-white/70">
                Our team is ready to help with car availability, booking
                requests, pickup locations, and rental support.
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

              <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-[#FF6B00] px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  Contact Us
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
                >
                  View All FAQs
                  <ArrowRight size={18} />
                </Link>
              </div>
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

            <div className="pt-3">
              <Link
                href="/faq"
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#06142A] px-6 py-4 text-sm font-black text-white transition hover:bg-[#FF6B00] sm:w-fit"
              >
                View Full FAQ Page
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
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
