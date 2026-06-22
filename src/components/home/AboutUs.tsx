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
    icon: <Shield size={24} />,
    title: "Quality & Reliability",
    text: "Well-maintained vehicles and safety you can trust.",
  },
  {
    icon: <DollarSign size={24} />,
    title: "Affordable Prices",
    text: "Transparent pricing with no hidden fees.",
  },
  {
    icon: <Clipboard size={24} />,
    title: "Flexible Rentals",
    text: "Choose your car and rental duration with ease.",
  },
  {
    icon: <Headphones size={24} />,
    title: "Easy Booking",
    text: "Simple, fast, and convenient booking process.",
  },
];

const stats = [
  {
    icon: <Users size={30} />,
    value: "10,000+",
    label: "Happy Customers",
    desc: "We've served thousands of satisfied clients.",
  },
  {
    icon: <Car size={30} />,
    value: "1,000+",
    label: "Vehicles",
    desc: "Wide range of cars to suit every need.",
  },
  {
    icon: <MapPin size={30} />,
    value: "10+",
    label: "Locations",
    desc: "Convenient locations across Kenya.",
  },
  {
    icon: <Award size={30} />,
    value: "5+",
    label: "Years Experience",
    desc: "Years of excellence in car hire services.",
  },
  {
    icon: <Star size={30} />,
    value: "4.8/5",
    label: "Customer Rating",
    desc: "Rated excellent by our valued customers.",
  },
];

export default function AboutUs() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-slate-50 to-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1420px]">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          viewport={{ once: true }}
          className="mb-4 flex justify-center"
        >
          <div className="text-center">
            <p className="text-sm font-black uppercase tracking-[0.22em] text-orange-600">
              About Us
            </p>
            <div className="mx-auto mt-3 h-[2px] w-12 bg-orange-600" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          viewport={{ once: true }}
          className="mb-14 text-center text-4xl font-black leading-tight tracking-[-0.04em] text-[#071426] sm:text-5xl lg:text-6xl"
        >
          Your Trusted Car Hire Partner
        </motion.h2>

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            viewport={{ once: true }}
          >
            <div className="mb-6 h-[3px] w-12 rounded-full bg-blue-600" />

            <p className="max-w-xl text-lg font-medium leading-8 text-slate-700">
              {BUSINESS_NAME} is a premium car rental service dedicated to
              providing reliable, affordable, and high-quality vehicles for
              every journey.
            </p>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
              Whether you&apos;re traveling for business, leisure, airport
              transfers, safari trips, or an important event, we ensure a smooth
              and enjoyable experience from booking to drop-off.
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 + index * 0.06 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-orange-600 shadow-sm">
                    {feature.icon}
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-slate-950">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {feature.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link
              href={whatsappLink}
              target="_blank"
              className="mt-9 inline-flex items-center gap-4 rounded-xl bg-orange-600 px-7 py-4 text-sm font-black text-white shadow-[0_18px_35px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
            >
              Learn More About Us
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-orange-600">
                <ArrowRight size={18} strokeWidth={3} />
              </span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative min-h-[420px] overflow-hidden rounded-2xl bg-slate-200 shadow-2xl shadow-slate-900/15">
              <Image
                src="/mercedes.jpg"
                alt="MoBri premium car hire vehicle"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#071426]/85" />
            </div>

            <div className="relative z-10 mx-auto -mt-28 grid w-[92%] overflow-hidden rounded-2xl bg-[#071426] shadow-2xl shadow-slate-900/20 sm:grid-cols-2">
              <div className="border-b border-white/10 p-7 sm:border-b-0 sm:border-r">
                <h3 className="text-2xl font-black text-white">Our Mission</h3>
                <div className="mt-3 h-[2px] w-12 bg-blue-500" />
                <p className="mt-5 text-sm leading-7 text-white/85">
                  To deliver exceptional car hire services that combine quality,
                  convenience, and value, making every journey memorable.
                </p>
              </div>

              <div className="p-7">
                <h3 className="text-2xl font-black text-white">Our Vision</h3>
                <div className="mt-3 h-[2px] w-12 bg-blue-500" />
                <p className="mt-5 text-sm leading-7 text-white/85">
                  To be the leading car hire company in Kenya and beyond, known
                  for trust, innovation, and customer satisfaction.
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
    <div className="mt-20 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: index * 0.08 }}
            viewport={{ once: true }}
            className="flex gap-4 border-slate-200 lg:border-r lg:pr-5 lg:last:border-r-0"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
              {stat.icon}
            </div>

            <div>
              <p className="text-3xl font-black text-blue-600">{stat.value}</p>
              <h3 className="mt-3 text-sm font-black text-slate-950">
                {stat.label}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {stat.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
