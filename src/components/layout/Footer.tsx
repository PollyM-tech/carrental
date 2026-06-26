import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const whatsappNumber = "254716741039";

const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Hello MoBri Car Hire, I would like to inquire about car hire services.",
)}`;

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

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-white">
      <div className="mx-auto max-w-[1420px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.8fr_0.9fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-2xl bg-white">
                <Image
                  src="/logo.png"
                  alt="MoBri Car Hire logo"
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </div>

              <div>
                <p className="text-2xl font-black tracking-[-0.04em]">
                  MoBri Car Hire
                </p>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-400">
                  Nairobi, Kenya
                </p>
              </div>
            </Link>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              MoBri Car Hire provides reliable, clean, and comfortable vehicles
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
                href="tel:0716741039"
                className="flex items-start gap-3 text-sm font-semibold text-slate-300 transition hover:text-orange-400"
              >
                <Phone size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>0716 741 039</span>
              </Link>

              <Link
                href="mailto:info@mobricarhire.co.ke"
                className="flex items-start gap-3 text-sm font-semibold text-slate-300 transition hover:text-orange-400"
              >
                <Mail size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>info@mobricarhire.co.ke</span>
              </Link>

              <p className="flex items-start gap-3 text-sm font-semibold text-slate-300">
                <MapPin size={18} className="mt-0.5 shrink-0 text-orange-400" />
                <span>Nairobi, Kenya</span>
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
            © {new Date().getFullYear()} MoBri Car Hire. All rights reserved.
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
