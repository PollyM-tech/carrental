
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarCheck,
  Phone,
} from "lucide-react";

export default function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      className="bg-[#F5F8FF] px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
    >
      <div className="mx-auto max-w-[1120px]">
        <div className="relative overflow-hidden rounded-2xl bg-[#06142A]">

          {/* Original Mercedes background */}
          <Image
            src="/mercedes.jpg"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 1120px"
            className="object-cover object-center opacity-35"
          />

          {/* Original dark gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/90 to-[#06142A]/40" />

          {/* CTA content */}
          <div className="relative z-10 flex min-h-[270px] items-center px-5 py-9 text-white sm:min-h-[280px] sm:px-8 sm:py-10 lg:min-h-[290px] lg:px-10">

            <div className="max-w-xl">

              {/* Small label */}
              <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-orange-300">
                Ready to hit the road?
              </span>

              {/* Heading */}
              <h2
                id="cta-heading"
                className="mt-3 text-[26px] font-bold leading-tight tracking-[-0.025em] text-white sm:text-[30px] lg:text-[34px]"
              >
                Ready to Start Your Journey?
              </h2>

              {/* Description */}
              <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
                Find the right car for your next trip
                with Movara Car Hire. Simple inquiries,
                comfortable journeys, and helpful service.
              </p>

              {/* Smaller CTA buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-2.5">

                <Link
                  href="/contact"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <CalendarCheck
                    size={16}
                    aria-hidden="true"
                  />
                  Book Now
                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                  />
                </Link>

                <a
                  href="tel:+254716741039"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <Phone
                    size={16}
                    aria-hidden="true"
                  />
                  Call Us Now
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
