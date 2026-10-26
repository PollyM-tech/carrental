import { MessageCircle, Phone, MessageSquare } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function FloatingContact() {
  return <aside aria-label="Contact Movara" className="fixed bottom-5 right-4 z-40 flex items-center gap-2 rounded-full border border-slate-200 bg-white p-2 shadow-lg sm:right-6">
    <a href="tel:+254716741039" aria-label={`Call Movara on ${siteConfig.phone}`} className="rounded-full p-3 text-[#0B1C4D] hover:bg-slate-100 focus-visible:outline-2"><Phone size={20} /></a>
    <a href="sms:+254716741039" aria-label={`Text Movara on ${siteConfig.phone}`} className="rounded-full p-3 text-[#0B1C4D] hover:bg-slate-100 focus-visible:outline-2"><MessageSquare size={20} /></a>
    <a href={`https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent("Hello Movara, I would like help with car hire.")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#128C45] px-4 py-3 font-semibold text-white hover:bg-[#0F7138] focus-visible:outline-2" aria-label={`Chat with Movara on WhatsApp, ${siteConfig.phone}`}><MessageCircle size={22} /><span className="hidden sm:inline">WhatsApp</span></a>
  </aside>;
}
