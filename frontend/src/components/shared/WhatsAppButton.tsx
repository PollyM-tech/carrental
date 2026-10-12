import Link from "next/link";
import { MessageCircle } from "lucide-react";

import { siteConfig } from "@/config/site";

export default function WhatsAppButton() {
  const businessName = siteConfig.businessName;
  const whatsappNumber = siteConfig.whatsapp;

  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello ${businessName}, I would like to inquire about car hire services.`,
  )}`;

  return (
    <Link
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${businessName} on WhatsApp`}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl shadow-green-600/30 transition hover:-translate-y-1 hover:bg-green-700"
    >
      <MessageCircle size={26} />
    </Link>
  );
}