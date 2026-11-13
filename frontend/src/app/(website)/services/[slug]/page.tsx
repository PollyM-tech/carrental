import Link from "next/link";
import { notFound } from "next/navigation";
import { services } from "@/data/services";
import { serviceDetails } from "@/data/service-details";
import { pageMetadata } from "@/lib/seo";
import RentalSummary from "@/components/shared/RentalSummary";
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return services.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const service = services.find(item => item.slug === slug);
  return service ? pageMetadata(`${service.title} in Kenya`, service.description, `/services/${slug}`) : {};
}
export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = services.find(item => item.slug === slug), detail = serviceDetails[slug];
  if (!service || !detail) notFound();
  return <main><section className="bg-[#F5F8FF] px-5 py-14"><div className="mx-auto max-w-4xl"><Link href="/services" className="font-semibold text-orange-800 underline">All car hire services</Link><h1 className="mt-5 text-4xl font-bold text-[#0B1C4D]">{service.title} in Kenya</h1><p className="mt-5 text-lg leading-8 text-slate-600">{detail.intro}</p><div className="mt-7 flex flex-wrap gap-4"><Link href="/cars" className="rounded-xl bg-orange-600 px-5 py-3 font-bold text-white">Compare vehicles and daily rates</Link><Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="rounded-xl border border-slate-300 px-5 py-3 font-semibold">Request a quote</Link></div></div></section><section className="mx-auto max-w-4xl space-y-8 px-5 py-12"><div><h2 className="text-2xl font-bold">Arrange your rental from Nairobi</h2><p className="mt-3 text-slate-600">All vehicles are based in Nairobi. Visit us at Jade Plaza, Lumumba Drive, Kasarani, or agree a handover location with the team.</p><ol className="mt-4 list-decimal space-y-3 pl-5 text-slate-600">{detail.steps.map(step => <li key={step}>{step}</li>)}</ol></div><div><h2 className="text-2xl font-bold">Rates and availability</h2><p className="mt-3 leading-7 text-slate-600">See published daily prices in our fleet. Final rates, deposit and any delivery charges depend on your vehicle and agreed arrangement. Submitting a request requires no online payment and does not reserve a car.</p></div><div><h2 className="text-2xl font-bold">Common questions</h2>{detail.questions.map(([question, answer]) => <details key={question} className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-semibold">{question}</summary><p className="mt-3 leading-7 text-slate-600">{answer}</p></details>)}</div></section><RentalSummary /></main>;
}
