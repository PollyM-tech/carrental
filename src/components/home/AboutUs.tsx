"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  DollarSign,
  Clipboard,
  Headphones,
  Users,
  Car,
  MapPin,
  Award,
  Star,
  ArrowRight,
} from "lucide-react";

const BUSINESS_NAME = "MoBri Car Hire";
const WHATSAPP_NUMBER = "254716741039";

const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  `Hello ${BUSINESS_NAME}, I'd like to know more about your services.`,
)}`;

const features = [
  {
    icon: Shield,
    title: "Quality & Reliability",
    text: "Well-maintained vehicles and safety you can trust.",
  },
  {
    icon: DollarSign,
    title: "Affordable Prices",
    text: "Transparent pricing with clear rental terms.",
  },
  {
    icon: Clipboard,
    title: "Flexible Rentals",
    text: "Choose your vehicle and rental period with ease.",
  },
  {
    icon: Headphones,
    title: "Easy Booking",
    text: "Fast booking support through website and WhatsApp.",
  },
];

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Happy Customers",
    desc: "Served across Kenya.",
  },
  {
    icon: Car,
    value: "50+",
    label: "Fleet Options",
    desc: "Cars for different trips.",
  },
  {
    icon: MapPin,
    value: "10+",
    label: "Pickup Areas",
    desc: "Convenient locations.",
  },
  {
    icon: Award,
    value: "5+",
    label: "Years Experience",
    desc: "Trusted car hire service.",
  },
  {
    icon: Star,
    value: "4.8",
    label: "Customer Rating",
    desc: "Rated by customers.",
  },
];

export default function AboutUs() {
  return (
    <section className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            About Us
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Your Trusted Car Hire Partner
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Reliable, affordable, and comfortable car hire services for business
            trips, family travel, airport transfers, events, and daily movement.
          </p>
        </motion.div>

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <motion.div
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-8"
          >
            <div className="h-[3px] w-12 rounded-full bg-orange-600" />

            <h3 className="mt-5 text-xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-2xl">
              Built Around Comfort, Trust, and Convenience
            </h3>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {BUSINESS_NAME} provides dependable vehicles for customers who
              need a smooth rental experience. From city errands to
              long-distance trips, we focus on clean cars, simple communication,
              and clear booking support.
            </p>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Whether you are traveling for business, leisure, airport pickup,
              safari plans, or an important event, our goal is to make the
              process simple from inquiry to drop-off.
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.06 }}
                    viewport={{ once: true }}
                    className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Icon size={20} />
                    </div>

                    <h4 className="mt-4 text-sm font-black tracking-[-0.02em] text-[#0A1628]">
                      {feature.title}
                    </h4>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.text}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <Link
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700 sm:w-fit"
            >
              Learn More About Us
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative min-h-[340px] overflow-hidden rounded-3xl bg-slate-200 shadow-[0_28px_80px_rgba(10,22,40,0.12)] sm:min-h-[420px]">
              <Image
                src="/mercedes.jpg"
                alt="MoBri premium car hire vehicle"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0A1628]/85" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
                <div className="max-w-md rounded-2xl border border-white/10 bg-white/10 p-5 text-white backdrop-blur-md">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-300">
                    Premium Experience
                  </p>

                  <h3 className="mt-3 text-xl font-black tracking-[-0.04em] sm:text-2xl">
                    Travel with Confidence
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Clean vehicles, simple booking, and customer support when
                    you need it.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mx-auto -mt-8 grid w-[92%] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:grid-cols-2">
              <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                  Our Mission
                </p>

                <h3 className="mt-3 text-lg font-black tracking-[-0.03em] text-[#0A1628]">
                  Better Car Hire
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  To deliver car hire services that combine quality,
                  convenience, and value for every customer journey.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
                  Our Vision
                </p>

                <h3 className="mt-3 text-lg font-black tracking-[-0.03em] text-[#0A1628]">
                  Trusted in Kenya
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  To become a trusted car hire brand known for reliability,
                  simple booking, and customer satisfaction.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <StatsSection />
      </div>
    </section>
  );
}

function StatsSection() {
  return (
    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Icon size={18} />
                </div>

                <div className="min-w-0">
                  <p className="text-xl font-black leading-none tracking-[-0.04em] text-[#0A1628]">
                    {stat.value}
                  </p>

                  <h3 className="mt-2 text-xs font-black uppercase tracking-[0.06em] text-[#0A1628]">
                    {stat.label}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {stat.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
