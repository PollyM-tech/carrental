import { siteConfig } from "@/config/site";
import ContactForm from "./ContactForm";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Contact & Booking Enquiries", "Call Movara on +254 716 741 039 or send your car hire dates and pickup details. Request a Nairobi self-drive rental or airport vehicle handover.", "/contact");
export default async function ContactPage({ searchParams }: { searchParams: Promise<{ car?: string | string[]; service?: string }> }) {
  const params = await searchParams;
  const car = typeof params.car === "string" ? params.car : "";
  return <><section aria-labelledby="visit-movara" className="bg-orange-50 px-5 py-7"><div className="mx-auto max-w-7xl"><h2 id="visit-movara" className="text-xl font-bold text-[#0B1C4D]">Visit Movara in Kasarani, Nairobi</h2><p className="mt-2 text-slate-700">{siteConfig.location}. All our vehicles are based in Nairobi. Contact us to arrange your visit or handover.</p><div className="mt-3 flex flex-wrap gap-5 text-sm font-semibold"><a href={siteConfig.mapUrl} target="_blank" rel="noopener noreferrer" className="text-orange-800 underline">Find us on Google Maps</a><a href="tel:+254716741039" className="underline">Call +254 716 741 039</a><a href={`mailto:${siteConfig.email}`} className="underline">Email Movara</a></div></div></section><ContactForm key={`${car}-${params.service ?? ""}`} selectedCar={car} selectedService={typeof params.service === "string" ? params.service : ""} /></>;

}
