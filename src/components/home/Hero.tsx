"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Search,
  ShieldCheck,
  Car,
  Headphones,
  RotateCcw,
  Star,
  Users,
  Gauge,
} from "lucide-react";

const heroImages = ["/lexus.jpeg", "/familycar.jpg", "/mercedes.jpg"];

const cars = [
  {
    name: "Lexus",
    image: "/lexus.jpeg",
    price: "KSh 12,000",
    type: "Executive SUV",
  },
  {
    name: "Family Car",
    image: "/familycar.jpg",
    price: "KSh 8,000",
    type: "Family Car",
  },
  {
    name: "Mercedes",
    image: "/mercedes.jpg",
    price: "KSh 15,000",
    type: "Luxury Car",
  },
  {
    name: "Toyota Prado",
    image: "/prado.png",
    price: "KSh 14,000",
    type: "SUV",
  },
];

export default function Hero() {
  const [search, setSearch] = useState("");
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const filteredCars = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return cars;

    return cars.filter(
      (car) =>
        car.name.toLowerCase().includes(value) ||
        car.type.toLowerCase().includes(value),
    );
  }, [search]);

  return (
    <section id="home" className="relative overflow-hidden bg-[#f6f8fb]">
      <div className="relative min-h-[690px] pt-[92px] lg:min-h-[720px]">
        {heroImages.map((image, index) => (
          <motion.div
            key={image}
            initial={false}
            animate={{ opacity: activeHero === index ? 1 : 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
          >
            <Image
              src={image}
              alt="MoBri Car Hire vehicle"
              fill
              priority={index === 0}
              quality={90}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        ))}

        <div className="absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#f6f8fb]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,transparent_0%,rgba(7,20,38,0.18)_46%,rgba(7,20,38,0.75)_100%)]" />

        <div className="relative z-10 mx-auto max-w-[1420px] px-4 pb-36 pt-16 sm:px-8 lg:px-12 lg:pt-24">
          <div className="max-w-[640px]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white shadow-sm backdrop-blur"
            >
              <Star size={15} className="fill-orange-600 text-orange-600" />
              Premium Car Hire in Nairobi
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65 }}
              className="text-[40px] font-black leading-[1.08] tracking-[-0.04em] text-white sm:text-5xl md:text-6xl lg:text-[64px]"
            >
              Drive Your Journey.
              <span className="block text-blue-400">We Take Care</span>
              <span className="block text-blue-400">of the Rest.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-5 max-w-xl text-base leading-7 text-white sm:text-lg"
            >
              Choose from reliable, comfortable, and well-maintained cars for
              city errands, airport transfers, business trips, safari travel,
              and family journeys across Kenya.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
              className="mt-7 flex flex-wrap gap-4"
            >
              <Link
                href="#fleet"
                className="inline-flex items-center gap-3 rounded-lg bg-orange-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(234,88,12,0.28)] transition hover:-translate-y-1 hover:bg-orange-700"
              >
                Explore Cars
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-orange-600">
                  <ArrowRight size={16} />
                </span>
              </Link>

              <Link
                href="#booking"
                className="inline-flex items-center gap-3 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-slate-950 shadow-sm transition hover:-translate-y-1 hover:text-orange-600"
              >
                Book Now
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-20 max-w-[760px] px-4 sm:px-8">
        <div className="flex flex-col gap-3 rounded-2xl bg-[#071426] p-4 shadow-2xl shadow-slate-900/20 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl bg-white px-4 py-3">
            <Search size={18} className="text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search Lexus, Mercedes, Prado..."
              className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
            />
          </div>

        </div>
      </div>

      <div className="mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-8 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        <TrustItem
          icon={<ShieldCheck />}
          title="Best Price Guarantee"
          text="Fair rates with reliable service"
        />
        <TrustItem
          icon={<Car />}
          title="Wide Range of Cars"
          text="SUVs, vans, and family cars"
        />
        <TrustItem
          icon={<Headphones />}
          title="Customer Support"
          text="Friendly help when you need it"
        />
        <TrustItem
          icon={<RotateCcw />}
          title="Flexible Booking"
          text="Simple booking through WhatsApp"
        />
      </div>

      <div id="fleet" className="mx-auto max-w-[1320px] px-4 pb-16 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <h2 className="text-2xl font-black text-slate-950">Popular Cars</h2>
            <div className="mt-3 h-[2px] w-8 bg-orange-600" />
            <p className="mt-5 text-sm leading-6 text-slate-500">
              Search and explore some of our commonly requested vehicles.
            </p>
          </div>

          {filteredCars.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {filteredCars.map((car) => (
                <motion.div
                  key={car.name}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-xl"
                >
                  <div className="relative h-[125px] overflow-hidden rounded-lg bg-slate-50">
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-contain p-2"
                    />
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-black text-slate-950">
                      {car.name}
                    </h3>
                    <p className="text-sm font-black text-slate-950">
                      {car.price}
                    </p>
                  </div>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {car.type}
                  </p>

                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users size={13} /> 5 Seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Gauge size={13} /> Auto
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-orange-100 bg-white p-8 text-center shadow-sm">
              <h3 className="text-lg font-black text-slate-950">
                No such car available
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Results not found. Try searching another vehicle or contact us
                through the booking form.
              </p>

              <Link
                href="#booking"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700"
              >
                Go to Booking
                <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrustItem({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 lg:border-r lg:border-slate-200 lg:last:border-r-0">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-orange-100 bg-orange-50 text-orange-600">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}
