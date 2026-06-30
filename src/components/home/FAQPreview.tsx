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
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            FAQs
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Frequently Asked Questions
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Find quick answers about our car hire services, booking process,
            customer support, and rental requirements.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
          <aside className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(10,22,40,0.08)]">
            <div className="relative h-64 bg-slate-200">
              <Image
                src="/lexus.jpeg"
                alt="MoBri Car Hire customer support"
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>

            <div className="bg-[#06142A] p-6 text-white sm:p-8">
              <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                Need Help?
              </span>

              <h3 className="mt-4 text-2xl font-black tracking-[-0.04em]">
                Still have questions?
              </h3>

              <p className="mt-3 text-sm leading-6 text-white/75">
                Our team can help with car availability, booking requests,
                pickup locations, and rental support.
              </p>

              <div className="mt-6 space-y-3">
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

              <div className="mt-7 flex flex-col gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
                >
                  Contact Us
                  <ArrowRight size={18} />
                </Link>

                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
                >
                  View All FAQs
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const Icon = faq.icon;
              const isOpen = openIndex === index;

              return (
                <article
                  key={faq.question}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-orange-500 hover:shadow-xl sm:p-5"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-start gap-3 text-left"
                    aria-expanded={isOpen}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-black leading-6 text-[#0A1628]">
                        {faq.question}
                      </h3>

                      {isOpen && (
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {faq.answer}
                        </p>
                      )}
                    </div>

                    <Plus
                      size={18}
                      className={`mt-1 shrink-0 text-[#0A1628] transition ${
                        isOpen ? "rotate-45 text-orange-600" : ""
                      }`}
                    />
                  </button>
                </article>
              );
            })}

            <div className="pt-4">
              <Link
                href="/faq"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06142A] px-6 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-orange-600 sm:w-fit"
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-orange-400">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-black uppercase tracking-[0.08em] text-white/50">
          {label}
        </p>
        <p className="mt-1 truncate text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}
