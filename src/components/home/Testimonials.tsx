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

export default function Testimonials() {
  return (
    <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
            Testimonials
          </p>

          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#06142A] sm:text-5xl lg:text-6xl">
            Trusted by Customers Across Kenya
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            Customers choose MoBri Car Hire for reliable cars, quick
            communication, and a smoother booking experience.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                  <Quote size={24} />
                </div>
              </div>

              <div className="mt-5 flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={18} className="fill-yellow-400" />
                ))}
              </div>

              <p className="mt-5 text-sm font-medium leading-7 text-slate-600">
                “{item.quote}”
              </p>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-base font-black text-[#06142A]">
                  {item.name}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {item.role}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1fr] lg:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                <Users size={30} />
              </div>

              <div>
                <p className="text-2xl font-black text-[#06142A]">10K+</p>
                <p className="text-sm font-semibold text-slate-500">
                  Happy customer journeys
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-slate-200 lg:border-l lg:pl-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                <Star size={30} className="fill-[#FF6B00]" />
              </div>

              <div>
                <p className="text-2xl font-black text-[#06142A]">4.8/5</p>
                <p className="text-sm font-semibold text-slate-500">
                  Average service rating
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border-slate-200 lg:border-l lg:pl-8">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                <ThumbsUp size={30} />
              </div>

              <div>
                <p className="text-2xl font-black text-[#06142A]">Trusted</p>
                <p className="text-sm font-semibold text-slate-500">
                  By families and businesses
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
