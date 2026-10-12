
import {
  ArrowRight,
  MessageCircle,
  Quote,
  Star,
} from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  rating?: number;
};

type TestimonialsProps = {
  testimonials?: Testimonial[];
};

// Demo content: replace quotes with genuine customer reviews
// and add ratings only when confirmed.
const sampleTestimonials: Testimonial[] = [
  {
    id: "brian-mwendwa",
    name: "Brian Mwendwa",
    role: "Car Hire Customer",
    location: "Kenya",
    quote:
      "The booking process was straightforward, the car was comfortable, and communication was clear throughout the trip.",
  },
  {
    id: "kamau-gitau",
    name: "Kamau Gitau",
    role: "Business Travel Customer",
    location: "Kenya",
    quote:
      "A convenient rental experience with helpful communication and a vehicle suited to my travel needs.",
  },
  {
    id: "philip-johnson",
    name: "Philip Johnson",
    role: "International Visitor",
    location: "USA",
    quote:
      "Arranging transport for my visit to Kenya was simple, and the rental process was easy to understand.",
  },
  {
    id: "slavi-pattek",
    name: "Slavi Pattek",
    role: "Travel Customer",
    location: "Location not specified",
    quote:
      "The vehicle was comfortable for the journey, and the booking arrangements were convenient.",
  },
];

const whatsappLink = `https://wa.me/254716741039?text=${encodeURIComponent(
  "Hello Movara Car Hire, I would like to share feedback about my rental experience."
)}`;

export default function Testimonials({
  testimonials = sampleTestimonials,
}: TestimonialsProps) {
  return (
    <section
      id="testimonials"
      aria-labelledby="testimonials-heading"
      className="scroll-mt-24 bg-[#F5F8FF] px-5 py-14 sm:px-8 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold tracking-wide text-[#E86D00]">
            TESTIMONIALS
          </span>

          <h2
            id="testimonials-heading"
            className="mt-4 text-[28px] font-bold leading-tight tracking-[-0.025em] text-[#0B1C4D] sm:text-[32px] lg:text-[38px]"
          >
            What Our{" "}
            <span className="text-[#FF7A00]">
              Customers Say
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Customer experiences help us understand what
            matters most when planning a comfortable journey.
          </p>
        </div>

        {/* Testimonial grid */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((item) => {
            const initials = item.name
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join("")
              .toUpperCase();

            return (
              <article
                key={item.id}
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_12px_30px_rgba(11,28,77,0.07)] motion-reduce:transform-none sm:p-6"
              >
                {/* Top icons */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#FF7A00]">
                    <Quote
                      size={20}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </div>

                  {typeof item.rating === "number" &&
                    item.rating >= 1 &&
                    item.rating <= 5 && (
                      <div
                        className="flex items-center gap-1"
                        aria-label={`${item.rating} out of 5 stars`}
                      >
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star
                            key={index}
                            size={14}
                            aria-hidden="true"
                            className={
                              index < Math.round(item.rating!)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        ))}
                      </div>
                    )}
                </div>

                {/* Customer quote */}
                <blockquote className="mt-5 flex-1 text-sm leading-7 text-slate-600">
                  &ldquo;{item.quote}&rdquo;
                </blockquote>

                {/* Customer information */}
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-5">
                  <div
                    aria-hidden="true"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF] text-sm font-bold text-[#0B1C4D]"
                  >
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-[#0B1C4D]">
                      {item.name}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {item.role}
                    </p>

                    <p className="text-xs text-[#E86D00]">
                      {item.location}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Feedback invitation */}
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="max-w-lg text-sm leading-6 text-slate-600">
            Have you travelled with Movara Car Hire?
            We would love to hear about your experience.
          </p>

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#FF7A00] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#E86D00]"
          >
            <MessageCircle
              size={17}
              aria-hidden="true"
            />
            Share Your Experience
            <ArrowRight
              size={16}
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
