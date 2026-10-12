
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";

import { services } from "@/data/services";

const BUSINESS_NAME = "Movara Car Hire";
const PHONE_NUMBER = "+254 716 741 039";
const WHATSAPP_NUMBER = "254716741039";
const LOCATION = "Nairobi, Kenya";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/#about" },
  { label: "Our Cars", href: "/cars" },
  { label: "Our Services", href: "/services" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

const whatsappLink =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent(
    `Hello ${BUSINESS_NAME}, I would like to inquire about car hire services.`
  );

export default function Footer() {
  return (
    <footer className="bg-[#0B1C4D] text-white">
      <div className="mx-auto max-w-7xl px-5 pb-6 pt-12 sm:px-8 sm:pt-14">

        {/* Main footer columns */}
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_1fr_1fr] lg:gap-10">

          {/* Brand */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Movara Car Hire homepage"
            >
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image
                  src="/logo.png"
                  alt="Movara Car Hire logo"
                  fill
                  sizes="48px"
                  className="object-contain p-1"
                />
              </div>

              <div className="leading-tight">
                <p className="text-[19px] font-bold tracking-tight text-white">
                  Movara
                </p>

                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.15em] text-orange-300">
                  Car Hire
                </p>
              </div>
            </Link>

            <p className="mt-4 max-w-sm text-[13px] leading-6 text-slate-300">
              Movara Car Hire offers self-drive vehicle
              rental options for personal travel,
              business trips, family journeys,
              and road trips across Kenya.
            </p>

            {/* WhatsApp shortcut */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Movara Car Hire on WhatsApp"
              className="mt-5 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-[#FF7A00]"
            >
              <MessageCircle
                size={17}
                aria-hidden="true"
              />
            </a>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="text-[13px] font-bold text-white">
              Quick Links
            </h2>

            <nav
              aria-label="Footer navigation"
              className="mt-4 flex flex-col items-start gap-2.5"
            >
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[13px] leading-6 text-slate-300 transition-colors hover:text-orange-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-[13px] font-bold text-white">
              Our Services
            </h2>

            <div className="mt-4 flex flex-col items-start gap-2.5">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  href={`/services#${service.slug}`}
                  className="text-[13px] leading-6 text-slate-300 transition-colors hover:text-orange-300"
                >
                  {service.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-[13px] font-bold text-white">
              Contact Us
            </h2>

            <div className="mt-4 space-y-4">
              <a
                href="tel:+254716741039"
                className="flex items-start gap-3 text-[13px] text-slate-300 transition-colors hover:text-orange-300"
              >
                <Phone
                  size={17}
                  className="mt-0.5 shrink-0 text-[#FF7A00]"
                  aria-hidden="true"
                />

                <span>{PHONE_NUMBER}</span>
              </a>

              <div className="flex items-start gap-3 text-[13px] text-slate-300">
                <MapPin
                  size={17}
                  className="mt-0.5 shrink-0 text-[#FF7A00]"
                  aria-hidden="true"
                />

                <span>{LOCATION}</span>
              </div>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-[13px] text-slate-300 transition-colors hover:text-orange-300"
              >
                <MessageCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-[#FF7A00]"
                  aria-hidden="true"
                />

                <span>WhatsApp Support</span>
              </a>
            </div>

            <Link
              href="/contact"
              className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
            >
              Get in Touch
              <ArrowUpRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="mt-10 flex flex-col gap-3 border-t border-white/15 pt-5 text-[12px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {BUSINESS_NAME}.
            All rights reserved.
          </p>

          <p>
            Self-drive car hire in Kenya.
          </p>
        </div>
      </div>
    </footer>
  );
}
