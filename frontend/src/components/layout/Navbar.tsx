
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  type MouseEvent,
} from "react";
import {
  Menu,
  X,
  Phone,
  MessageCircle,
} from "lucide-react";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#about" },
  { label: "Cars", href: "/cars" },
  { label: "Services", href: "/services" },
  { label: "Testimonials", href: "/#testimonials" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
];

const phoneNumber = "0716741039";
const whatsappNumber = "254716741039";

const whatsappLink =
  `https://wa.me/${whatsappNumber}?text=` +
  encodeURIComponent(
    "Hello Movara Car Hire, I would like to inquire about hiring a car."
  );

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  function closeMenu() {
    setIsOpen(false);
  }

  function handleNavClick(
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) {
    closeMenu();

    // Allow modified clicks to work normally.
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }

    // Next.js handles ordinary page navigation.
    if (!href.startsWith("/#")) {
      return;
    }

    // From other pages, navigate to the homepage first.
    if (window.location.pathname !== "/") {
      return;
    }

    const sectionId = href.slice(2);
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    // Handle homepage sections, including repeated clicks.
    event.preventDefault();

    window.history.replaceState(
      null,
      "",
      `/#${encodeURIComponent(sectionId)}`
    );

    section.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8"
      >
        {/* Brand */}
        <Link
          href="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="Movara Car Hire homepage"
        >
          <div className="relative h-11 w-11 overflow-hidden rounded-xl bg-slate-50 ring-1 ring-slate-100">
            <Image
              src="/logo.png"
              alt="Movara Car Hire logo"
              fill
              sizes="44px"
              priority
              className="object-contain p-1"
            />
          </div>

          <div className="leading-tight">
            <p className="text-[19px] font-bold tracking-[-0.035em] text-[#0B1C4D]">
              Movara
            </p>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#E86D00]">
              Car Hire
            </p>
          </div>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-4 xl:flex 2xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(event) =>
                handleNavClick(event, link.href)
              }
              className="whitespace-nowrap py-2 text-[13px] font-medium text-[#334155] transition-colors hover:text-[#E86D00] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#FF7A00]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop contact actions */}
        <div className="hidden shrink-0 items-center gap-2.5 xl:flex">
          <a
            href={`tel:${phoneNumber}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-[13px] font-medium text-[#B84300] transition-colors hover:bg-orange-100"
          >
            <Phone
              size={16}
              aria-hidden="true"
            />
            Call Us
          </a>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00]"
          >
            <MessageCircle
              size={16}
              aria-hidden="true"
            />
            WhatsApp
          </a>
        </div>

        {/* Mobile and tablet menu button */}
        <button
          type="button"
          onClick={() =>
            setIsOpen((current) => !current)
          }
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-[#0B1C4D] transition-colors hover:bg-orange-50 xl:hidden"
          aria-label={
            isOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
        >
          {isOpen ? (
            <X size={21} aria-hidden="true" />
          ) : (
            <Menu size={21} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile and tablet navigation */}
      <div
        id="mobile-navigation"
        hidden={!isOpen}
        className="absolute left-0 right-0 top-full max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-slate-200 bg-white shadow-[0_15px_35px_rgba(11,28,77,0.1)] xl:hidden"
      >
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          {/* Navigation links */}
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={(event) =>
                  handleNavClick(event, link.href)
                }
                className="rounded-lg px-4 py-3 text-sm font-medium text-[#334155] transition-colors hover:bg-orange-50 hover:text-[#E86D00]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Contact buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
            <a
              href={`tel:${phoneNumber}`}
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm font-medium text-[#B84300]"
            >
              <Phone
                size={16}
                aria-hidden="true"
              />
              Call Us
            </a>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-3 py-2.5 text-sm font-medium text-white"
            >
              <MessageCircle
                size={16}
                aria-hidden="true"
              />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
