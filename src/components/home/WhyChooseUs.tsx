import Image from "next/image";
import {
  Car,
  CheckCircle2,
  Clock,
  Headphones,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Star,
  ThumbsUp,
} from "lucide-react";

const reasons = [
  {
    title: "Best Price Guarantee",
    description:
      "We offer competitive daily rates with clear pricing and no hidden fees.",
    icon: ShieldCheck,
  },
  {
    title: "Wide Range of Vehicles",
    description:
      "Choose from economy cars, SUVs, luxury cars, vans, and family vehicles.",
    icon: Car,
  },
  {
    title: "Flexible & Convenient",
    description:
      "Easy booking, flexible pickup options, and quick WhatsApp confirmation.",
    icon: RefreshCcw,
  },
  {
    title: "24/7 Customer Support",
    description:
      "Our team is available to help before, during, and after your rental.",
    icon: Headphones,
  },
  {
    title: "Safe & Reliable",
    description:
      "Clean, well-maintained vehicles prepared for comfort and dependable travel.",
    icon: CheckCircle2,
  },
  {
    title: "Trusted by Customers",
    description:
      "Customers choose MoBri for smooth booking and friendly support.",
    icon: ThumbsUp,
  },
];

const stats = [
  {
    value: "10K+",
    label: "Happy Customers",
    icon: Star,
  },
  {
    value: "50+",
    label: "Vehicles Managed",
    icon: Car,
  },
  {
    value: "25+",
    label: "Pickup Locations",
    icon: MapPin,
  },
  {
    value: "5+",
    label: "Years Experience",
    icon: ShieldCheck,
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-[#f4f7fb] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
            Why Choose Us
          </p>

          <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-[#FF6B00]" />

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[#06142A] sm:text-5xl lg:text-6xl">
            More Than a Ride, It’s a Better Experience
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-8 text-slate-600 sm:text-lg">
            We go the extra mile to deliver reliable car hire services you can
            trust every time you travel.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article
                key={reason.title}
                className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10"
              >
                <div className="flex items-start gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-orange-50 text-[#FF6B00]">
                    <Icon size={34} />
                  </div>

                  <div>
                    <h3 className="text-xl font-black tracking-[-0.03em] text-[#06142A]">
                      {reason.title}
                    </h3>

                    <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl bg-[#06142A] shadow-xl shadow-slate-900/10">
          <div className="grid gap-0 lg:grid-cols-[1fr_1fr]">
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="p-6 text-center text-white sm:p-8"
                  >
                    <Icon className="mx-auto text-[#FF6B00]" size={34} />

                    <p className="mt-4 text-4xl font-black tracking-[-0.04em]">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white/70">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative hidden min-h-[280px] lg:block">
              <Image
                src="/mercedes.jpg"
                alt="MoBri Car Hire vehicle"
                fill
                sizes="50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/40 to-transparent" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <MiniBenefit
              icon={ShieldCheck}
              title="Best Price"
              text="Clear daily rates"
            />
            <MiniBenefit icon={Car} title="Many Cars" text="Choose what fits" />
            <MiniBenefit
              icon={Clock}
              title="Fast Booking"
              text="Quick response"
            />
            <MiniBenefit
              icon={Headphones}
              title="Support"
              text="Always available"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#FF6B00]">
        <Icon size={28} />
      </div>

      <div>
        <p className="text-base font-black text-[#06142A]">{title}</p>
        <p className="mt-1 text-sm font-medium text-slate-500">{text}</p>
      </div>
    </div>
  );
}
