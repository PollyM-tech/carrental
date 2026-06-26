"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, Phone, MessageCircle } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Cars", href: "/cars" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const phoneNumber = "0716 741 039";
const whatsappNumber = "254716741039";

const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
  "Hello MoBri Car Hire, I would like to inquire about hiring a car.",
)}`;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-[1420px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src="/logo.png"
              alt="MoBri Car Hire logo"
              fill
              sizes="48px"
              className="object-contain p-1"
              priority
            />
          </div>

          <div className="leading-tight">
            <p className="text-lg font-black tracking-[-0.04em] text-slate-950">
              MoBri
            </p>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-600">
              Car Hire
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold text-slate-700 transition hover:text-orange-600"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href={`tel:${phoneNumber.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
          >
            <Phone size={17} />
            Call Us
          </Link>

          <Link
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:-translate-y-0.5 hover:bg-orange-700"
          >
            <MessageCircle size={17} />
            WhatsApp
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white px-4 py-5 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-[1420px] flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-orange-50 hover:text-orange-600"
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Link
                href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-orange-700"
              >
                <Phone size={17} />
                Call Us
              </Link>

              <Link
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-black text-white"
              >
                <MessageCircle size={17} />
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
