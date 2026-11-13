import Link from "next/link";
export default function RentalSummary() {
  const items = [
    ["Driver requirements", "Drivers must be 22+ with a driving licence held for at least two years. Bring your original ID or passport and licence."],
    ["Before handover", "Guarantor and next-of-kin details are required. Complete in-person checks and sign the rental contract before vehicle release."],
    ["Rates and deposit", "Daily or agreed rates, deposit amount and refund terms are confirmed for your vehicle before you commit. Payment follows clearance."],
    ["Plan your journey", "Our fleet is based in Nairobi. Confirm insurance, excess, mileage, fuel and cancellation terms before travel."],
  ];
  return <section aria-labelledby="rental-summary" className="bg-orange-50 px-4 py-12"><div className="mx-auto max-w-7xl"><h2 id="rental-summary" className="text-2xl font-bold text-[#0B1C4D]">Before you book</h2><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{items.map(([title, text]) => <article key={title} className="rounded-xl border border-orange-100 bg-white p-5"><h3 className="font-bold text-[#0B1C4D]">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div><Link href="/rental-terms" className="mt-5 inline-block font-semibold text-orange-800 underline">Read rental requirements and terms</Link></div></section>;
}
