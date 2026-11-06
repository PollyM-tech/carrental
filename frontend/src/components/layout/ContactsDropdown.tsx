"use client";
import { useEffect, useRef } from "react";
import { ChevronDown, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function ContactsDropdown({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const details = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent) => { if (event.target instanceof Node && !details.current?.contains(event.target) && details.current) details.current.open = false; };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.current?.open) { event.preventDefault(); event.stopPropagation(); details.current.open = false; details.current.querySelector("summary")?.focus(); }
    };
    document.addEventListener("pointerdown", closeOutside);
    const element = details.current; element?.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", closeOutside); element?.removeEventListener("keydown", escape); };
  }, []);
  return <details ref={details} className="group/contacts relative">
    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-[13px] font-medium text-[#B84300] transition-colors hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-orange-500 [&::-webkit-details-marker]:hidden"><Phone size={16} aria-hidden="true" />Contacts<ChevronDown size={16} aria-hidden="true" className="transition-transform group-open/contacts:rotate-180" /></summary>
    <div className={`${mobile ? "mt-2" : "absolute right-0 top-full z-50 mt-2 w-56"} space-y-1 rounded-xl border border-orange-100 bg-white p-2 shadow-lg`}>
      {[{ label: siteConfig.phone, href: "+254716741039" }, { label: siteConfig.secondaryPhone, href: siteConfig.secondaryPhoneInternational }].map(contact => <a key={contact.href} href={`tel:${contact.href}`} onClick={() => { if (details.current) details.current.open = false; onNavigate?.(); }} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-3 text-sm font-semibold text-[#0B1C4D] hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-orange-500"><Phone size={16} aria-hidden="true" />{contact.label}</a>)}
    </div>
  </details>;
}
