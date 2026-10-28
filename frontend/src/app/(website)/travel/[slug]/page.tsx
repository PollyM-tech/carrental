import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const pages = {
  "car-hire-nairobi": { title: "Car Hire in Nairobi", heading: "Reliable Car Hire in Nairobi", intro: "Explore Nairobi and its surrounding destinations with a convenient self-drive rental from Movara Car Hire.", points: ["Flexible pickup arrangements in Nairobi", "Cars for business, family travel and city trips", "Clear daily rates and booking support"] },
  "airport-car-hire-kenya": { title: "Airport Car Hire in Kenya", heading: "Airport Car Hire in Kenya", intro: "Start your Kenya trip smoothly with a rental car arranged for airport pickup and onward travel.", points: ["Convenient Nairobi airport and agreed-location handover", "Vehicles suited to city travel and longer journeys", "Support before and during your rental"] },
  "safari-car-hire-kenya": { title: "Safari Car Hire in Kenya", heading: "Car Hire for Kenya Safari Travel", intro: "Plan a Kenya road trip or safari journey with a practical rental vehicle and local booking support.", points: ["Choose a vehicle for your itinerary and group size", "Plan routes from Nairobi to Kenya destinations", "Confirm vehicle suitability and rental terms with our team"] },
  "mombasa-car-hire": { title: "Car Hire in Mombasa", heading: "Car Hire for Mombasa and the Coast", intro: "Travel the Kenyan coast with a self-drive vehicle for beach holidays, family trips and business travel.", points: ["Useful for coastal trips and local movement", "Options for couples, families and groups", "Request dates and pickup details online"] },
  "kenya-road-trip-car-hire": { title: "Kenya Road Trip Car Hire", heading: "Kenya Road Trip Car Hire", intro: "Build your Kenya itinerary around the places you want to visit with a rental car selected for your travel plans.", points: ["Suitable options for short and extended trips", "Share your route and dates before confirmation", "Local support for a smoother rental experience"] },
} as const;

export function generateStaticParams() { return Object.keys(pages).map(slug => ({ slug })); }
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = pages[params.slug as keyof typeof pages];
  return page ? { title: page.title, description: page.intro, alternates: { canonical: `/travel/${params.slug}` } } : {};
}
export default function TravelLandingPage({ params }: { params: { slug: string } }) {
  const page = pages[params.slug as keyof typeof pages];
  if (!page) notFound();
  return <main className="bg-white"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "WebPage", name: page.title, description: page.intro, url: `https://movaracarhire.com/travel/${params.slug}`, about: { "@type": "Service", serviceType: "Car rental" } }) }} /><section className="bg-[#F5F8FF] px-4 py-16 sm:px-6 lg:px-8"><div className="mx-auto max-w-4xl"><p className="text-sm font-bold uppercase tracking-wide text-orange-700">Movara Car Hire · Kenya</p><h1 className="mt-4 text-4xl font-bold tracking-tight text-[#0B1C4D]">{page.heading}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{page.intro}</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/cars" className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Browse available cars</Link><Link href="/contact" className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-[#0B1C4D]">Ask about your trip</Link></div></div></section><section className="mx-auto max-w-4xl space-y-5 px-4 py-12 sm:px-6 lg:px-8"><h2 className="text-2xl font-bold text-[#0B1C4D]">Plan your journey with Movara</h2><ul className="grid gap-4 sm:grid-cols-3">{page.points.map(point => <li key={point} className="rounded-2xl border bg-white p-5 text-sm leading-6 text-slate-700 shadow-sm">{point}</li>)}</ul><p className="pt-4 leading-7 text-slate-600">Availability, vehicle suitability and final rental terms are confirmed by our team after you submit your dates and pickup details. Visit our <Link className="font-semibold text-orange-700 underline" href="/services">car hire services</Link> page to learn more.</p></section></main>;
}
