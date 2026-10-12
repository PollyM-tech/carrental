
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";

const faqs = [
  {
    id: "booking",
    question: "How do I book a car?",
    answer:
      "Browse our available vehicles and choose one that suits your trip. Contact Movara Car Hire with your preferred dates, pickup location, and travel details. Our team will confirm availability and explain the next steps.",
  },
  {
    id: "documents",
    question: "What documents do I need to rent a car?",
    answer:
      "For self-drive rentals, you will generally need a valid driving licence and a national ID or passport. Additional requirements may apply depending on the selected vehicle and rental arrangement.",
  },
  {
    id: "chauffeur",
    question: "Do you offer chauffeur services?",
    answer:
      "No. Movara Car Hire currently focuses on self-drive vehicle rentals and does not offer chauffeur services. You can contact our team to discuss the available self-drive options for your journey.",
  },
  {
    id: "airport",
    question: "Can I collect or return a car at the airport?",
    answer:
      "You can request vehicle collection or return arrangements at JKIA, Wilson Airport, or another agreed location. Availability and any applicable delivery or collection charges will be confirmed during booking. This is a vehicle handover service, not a chauffeur-driven airport transfer.",
  },
  {
    id: "payment",
    question: "How can I pay for my rental?",
    answer:
      "Our team will provide the available payment methods and payment instructions when confirming your rental. Please verify the payment details before sending any money.",
  },
  {
    id: "deposit",
    question: "Is a security deposit required?",
    answer:
      "Security deposit requirements may vary depending on the selected vehicle and rental terms. Any applicable deposit, refund conditions, and deductions will be explained before booking confirmation.",
  },
  {
    id: "fuel",
    question: "What is your fuel policy?",
    answer:
      "Fuel arrangements are confirmed before the rental begins. The agreed return fuel level and any applicable charges will be outlined in your rental agreement.",
  },
  {
    id: "insurance",
    question: "Is insurance included in the rental?",
    answer:
      "Insurance terms depend on the vehicle and rental agreement. Our team can explain the applicable cover, exclusions, excess amounts, and customer responsibilities before you confirm your rental.",
  },
  {
    id: "cancellation",
    question: "Can I change or cancel my booking?",
    answer:
      "Please contact our team as early as possible if your plans change. Booking changes and cancellations are subject to the agreed rental terms and vehicle availability.",
  },
  {
    id: "long-term",
    question: "Can I rent a car for several days or weeks?",
    answer:
      "Yes. You can inquire about daily, weekly, and longer-term self-drive rentals. Our team will help you explore suitable vehicles and confirm availability and rates for your preferred period.",
  },
];

export default function FAQPreview() {
  const [openId, setOpenId] = useState<string | null>(
    "booking"
  );

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-24 bg-[#F5F8FF] px-4 py-12 sm:px-6 sm:py-14 lg:py-12"
    >
      <div className="mx-auto max-w-7xl">

        {/* Section heading */}
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold tracking-wide text-[#E86D00]">
            FREQUENTLY ASKED QUESTIONS
          </span>

          <h2
            id="faq-heading"
            className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[30px] lg:text-[34px]"
          >
            Have Questions?{" "}
            <span className="text-[#FF7A00]">
              We Have Answers.
            </span>
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Find helpful answers about bookings,
            rental requirements, payments, and
            self-drive journeys with Movara Car Hire.
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="mx-auto max-w-3xl space-y-2.5">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            const answerId = `faq-answer-${faq.id}`;

            return (
              <article
                key={faq.id}
                className={`overflow-hidden rounded-xl border bg-white transition-colors ${
                  isOpen
                    ? "border-orange-200"
                    : "border-slate-200 hover:border-orange-200"
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={answerId}
                    onClick={() =>
                      setOpenId(isOpen ? null : faq.id)
                    }
                    className="flex min-h-14 w-full items-center justify-between gap-4 px-4 py-3 text-left sm:px-5"
                  >
                    <span className="text-[14px] font-bold leading-6 text-[#0B1C4D]">
                      {faq.question}
                    </span>

                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        isOpen
                          ? "bg-orange-50 text-[#FF7A00]"
                          : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      <ChevronDown
                        size={17}
                        aria-hidden="true"
                        className={`transition-transform duration-200 motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>

                {isOpen && (
                  <div
                    id={answerId}
                    className="border-t border-slate-100 px-4 pb-4 pt-3 sm:px-5"
                  >
                    <p className="text-[14px] leading-6 text-slate-600">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Compact contact link */}
        <div className="mx-auto mt-7 flex flex-col items-center justify-center gap-2 text-center sm:flex-row sm:gap-3">
          <p className="text-[14px] text-slate-600">
            Still have questions? We are happy to help.
          </p>

          <Link
            href="/contact"
            className="inline-flex min-h-10 items-center gap-1.5 text-[13px] font-semibold text-[#E86D00] transition-colors hover:text-[#0B1C4D]"
          >
            Contact Our Team
            <ArrowRight
              size={15}
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
