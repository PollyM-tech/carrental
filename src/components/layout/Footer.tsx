"use client";

import Image from "next/image";
import Link from "next/link";
import { useQuery } from "convex/react";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { api } from "../../../convex/_generated/api";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const services = [
  "Self-drive car hire",
  "Chauffeur services",
  "Airport transfers",
  "Corporate car hire",
  "Safari and travel vehicles",
  "Long-term rentals",
];

function cleanPhoneForTel(phoneNumber: string) {
  return phoneNumber.replace(/\s/g, "").replace(/-/g, "");
}

export default function Footer() {
  const settings = useQuery(api.settings.getSettings);

  const businessName = settings?.businessName ?? "MoBri Car Hire";
  const whatsappNumber = settings?.whatsappNumber ?? "254716741039";
  const phoneNumber = settings?.phoneNumber ?? "0716 741 039";
  const email = settings?.email ?? "info@mobricarhire.co.ke";
  const location = settings?.location ?? "Nairobi, Kenya";

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello ${businessName}, I would like to inquire about car hire services.`,
  )}`;

  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="mx-auto max-w-[1420px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/logo.png"
                  alt={`${businessName} logo`}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              <div>
                <p className="text-2xl font-black tracking-[-0.04em]">
                  {businessName}
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">
                  {location}
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              {businessName} provides reliable, clean, and comfortable vehicles
              for personal travel, business movement, airport transfers, and
              long-distance trips across Kenya.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <Link
                href="#"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white transition hover:bg-orange-600"
              >
                f
              </Link>

              <Link
                href="#"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-sm font-black text-white transition hover:bg-orange-600"
              >
                IG
              </Link>

              <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700"
              >
                <MessageCircle size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
              Quick Links
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-slate-300 transition hover:text-orange-400"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
              Services
            </h3>

            <div className="mt-5 flex flex-col gap-3">
              {services.map((service) => (
                <p
                  key={service}
                  className="text-sm font-semibold text-slate-300"
                >
                  {service}
                </p>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.16em] text-orange-400">
              Contact
            </h3>

            <div className="mt-5 space-y-4">
              <Link
                href={`tel:${cleanPhoneForTel(phoneNumber)}`}
                className="flex items-start gap-3 text-sm font-semibold text-slate-300 transition hover:text-orange-400"
              >
                <Phone size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>{phoneNumber}</span>
              </Link>

              <Link
                href={`mailto:${email}`}
                className="flex items-start gap-3 text-sm font-semibold text-slate-300 transition hover:text-orange-400"
              >
                <Mail size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>{email}</span>
              </Link>

              <p className="flex items-start gap-3 text-sm font-semibold text-slate-300">
                <MapPin size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>{location}</span>
              </p>

              <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700"
              >
                <MessageCircle size={17} />
                Chat on WhatsApp
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} {businessName}. All rights reserved.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition hover:text-orange-400">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition hover:text-orange-400">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
