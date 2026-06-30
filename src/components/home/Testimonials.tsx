import Image from "next/image";
import { Quote, Star, ThumbsUp, Users } from "lucide-react";

const testimonials = [
  {
    name: "James Mwangi",
    role: "Business Customer",
    quote:
      "Excellent service, clean cars, and friendly staff. The booking process was simple and the team responded quickly.",
    image: "/lexus.jpeg",
  },
  {
    name: "Amina Otieno",
    role: "Family Trip Customer",
    quote:
      "We booked a car for a family weekend trip and everything went smoothly. The car was comfortable and well maintained.",
    image: "/familycar.jpg",
  },
  {
    name: "Brian Kariuki",
    role: "Airport Transfer Customer",
    quote:
      "The team helped with airport pickup and the communication was very clear. I would use MoBri again.",
    image: "/mercedes.jpg",
  },
];

const trustStats = [
  {
    value: "10K+",
    label: "Happy customer journeys",
    icon: Users,
  },
  {
    value: "4.8",
    label: "Average service rating",
    icon: Star,
  },
  {
    value: "Trusted",
    label: "By families and businesses",
    icon: ThumbsUp,
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            Testimonials
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Trusted by Customers Across Kenya
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Customers choose MoBri Car Hire for reliable cars, quick
            communication, and a smoother booking experience.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Quote size={18} />
                </div>
              </div>

              <div className="mt-5 flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={15} className="fill-yellow-400" />
                ))}
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                “{item.quote}”
              </p>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <p className="text-sm font-black text-[#0A1628]">{item.name}</p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trustStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon
                        size={18}
                        className={
                          stat.value === "4.8" ? "fill-orange-600" : ""
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xl font-black leading-none tracking-[-0.04em] text-[#0A1628]">
                        {stat.value}
                      </p>

                      <p className="mt-2 text-xs font-black uppercase tracking-[0.06em] text-slate-600">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
