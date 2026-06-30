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
      "Clean, well-maintained vehicles prepared for comfortable travel.",
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
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <div className="text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            Why Choose Us
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            More Than a Ride, It’s a Better Experience
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            We go the extra mile to deliver reliable car hire services you can
            trust every time you travel.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason) => {
            const Icon = reason.icon;

            return (
              <article
                key={reason.title}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Icon size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-[#0A1628]">
                      {reason.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-[#06142A] shadow-[0_28px_80px_rgba(10,22,40,0.12)]">
          <div className="grid lg:grid-cols-[1fr_0.85fr]">
            <div className="grid grid-cols-2 divide-x divide-y divide-white/10 sm:grid-cols-4 sm:divide-y-0">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className="p-5 text-center text-white sm:p-6"
                  >
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-orange-400">
                      <Icon size={18} />
                    </div>

                    <p className="mt-4 text-xl font-black leading-none tracking-[-0.04em]">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-xs font-black uppercase tracking-[0.06em] text-white/60">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="relative hidden min-h-[240px] lg:block">
              <Image
                src="/mercedes.jpg"
                alt="MoBri Car Hire vehicle"
                fill
                sizes="420px"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#06142A] via-[#06142A]/40 to-transparent" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-black text-[#0A1628]">{title}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
        </div>
      </div>
    </div>
  );
}
