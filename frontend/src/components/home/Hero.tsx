
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Star } from "lucide-react";

const heroImages = [
  "/lexus.jpeg",
  "/familycar.jpg",
  "/mercedes.jpg",
];

const SLIDE_INTERVAL = 6000;

export default function Hero() {
  const [activeHero, setActiveHero] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveHero((current) => (current + 1) % heroImages.length);
    }, SLIDE_INTERVAL);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section
      id="home"
      aria-label="MoBri Car Hire introduction"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setIsPaused(false);
        }
      }}
      className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-[#0B1C4D] sm:min-h-[570px] lg:min-h-[620px]"
    >
      {/* Background slideshow */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          aria-hidden="true"
          className={`absolute inset-0 transition-opacity duration-1000 motion-reduce:transition-none ${
            activeHero === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image}
            alt=""
            fill
            priority={index === 0}
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Readable overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#071426]/90 via-[#071426]/65 to-[#071426]/25" />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071426]/45 via-transparent to-transparent" />

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl items-center px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
        <div className="max-w-[580px]">
          {/* Eyebrow */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white backdrop-blur-sm sm:text-sm">
            <Star
              size={14}
              className="fill-[#FF7A00] text-[#FF7A00]"
              aria-hidden="true"
            />
            Reliable Car Hire Across Kenya
          </div>

          {/* Headline */}
          <h1 className="max-w-[560px] text-[32px] font-semibold leading-[1.15] tracking-[-0.025em] text-white sm:text-[38px] lg:text-[48px]">
            Drive Your Journey.
            <span className="mt-1 block text-[#FF7A00]">
              We Take Care of the Rest.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-[500px] text-sm leading-7 text-slate-200 sm:text-base">
            Reliable, comfortable, and well-maintained vehicles
            for business trips, airport transfers, family travel,
            safaris, and everyday journeys across Kenya.
          </p>

          {/* Action buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
            <Link
              href="/cars"
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-orange-950/20 transition-colors hover:bg-[#E86D00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Explore Cars
              <ArrowRight size={17} aria-hidden="true" />
            </Link>

            <Link
              href="/contact"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/35 bg-white/10 px-5 py-3 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white hover:text-[#0B1C4D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Talk to Us
            </Link>
          </div>

          {/* Slide controls */}
          <div
            role="group"
            aria-label="Choose hero vehicle image"
            className="mt-9 flex items-center gap-1 sm:mt-11"
          >
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveHero(index)}
                aria-label={`Show vehicle image ${index + 1}`}
                aria-pressed={activeHero === index}
                className="flex h-11 items-center justify-center px-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    activeHero === index
                      ? "w-8 bg-[#FF7A00]"
                      : "w-4 bg-white/45 hover:bg-white/80"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
