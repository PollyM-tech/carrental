"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

const BUSINESS_NAME = "MoBri Car Hire";
const WHATSAPP_NUMBER = "254716741039";

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Hello ${BUSINESS_NAME}, I would like to inquire about car hire services.`,
)}`;

export default function WhatsAppButton() {
  return (
    <Link
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with MoBri Car Hire on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl shadow-green-600/30 transition hover:-translate-y-1 hover:bg-green-700"
    >
      <MessageCircle size={26} />
    </Link>
  );
}
