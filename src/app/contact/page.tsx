"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  User,
} from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/shared/WhatsAppButton";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

type BookingFormState = {
  carId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  message: string;
};

const defaultForm: BookingFormState = {
  carId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  pickupDate: "",
  returnDate: "",
  pickupLocation: "Nairobi",
  returnLocation: "Nairobi",
  message: "",
};

export default function ContactPage() {
  const cars = useQuery(api.cars.listPublicCars) as
    | CarWithDisplayImage[]
    | undefined;

  const settings = useQuery(api.settings.getSettings);
  const createBooking = useMutation(api.bookings.create);

  const [form, setForm] = useState<BookingFormState>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCar = useMemo(() => {
    return (cars ?? []).find((car) => car._id === form.carId);
  }, [cars, form.carId]);

  const totalDays = calculateTotalDays(form.pickupDate, form.returnDate);

  const estimatedTotal =
    selectedCar && totalDays ? selectedCar.pricePerDay * totalDays : undefined;

  const businessName = settings?.businessName ?? "MoBri Car Hire";
  const whatsappNumber = settings?.whatsappNumber ?? "254716741039";
  const phoneNumber = settings?.phoneNumber ?? "0716 741 039";
  const email = settings?.email ?? "info@mobricarhire.co.ke";
  const location = settings?.location ?? "Nairobi, Kenya";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!form.customerName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (!form.customerPhone.trim()) {
        throw new Error("Please enter your phone number.");
      }

      if (!form.carId) {
        throw new Error("Please select the car you want to book.");
      }

      if (!form.pickupDate || !form.returnDate) {
        throw new Error("Please select pickup and return dates.");
      }

      if (form.returnDate <= form.pickupDate) {
        throw new Error("Return date must be after pickup date.");
      }

      await createBooking({
        carId: form.carId as Id<"cars">,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail || undefined,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation,
        message: form.message || undefined,
      });

      const whatsappMessage = buildWhatsAppMessage({
        businessName,
        carName: selectedCar?.name ?? "Car not selected",
        pricePerDay: selectedCar?.pricePerDay,
        totalDays,
        estimatedTotal,
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        pickupLocation: form.pickupLocation,
        returnLocation: form.returnLocation,
        message: form.message,
      });

      setSuccessMessage(
        "Your booking request has been sent successfully. We are opening WhatsApp so you can confirm directly.",
      );

      setForm(defaultForm);

      window.open(
        `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
          whatsappMessage,
        )}`,
        "_blank",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not send booking request. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="bg-[#f4f7fb]">
        <section className="px-4 pb-10 pt-28 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
              <div className="rounded-3xl bg-[#06142A] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8 lg:p-10">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Contact & Booking
                </p>

                <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                  Book Your Car With {businessName}
                </h1>

                <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-white/70">
                  Send a booking request, choose your preferred car, pickup
                  date, return date, and location. Your request will be saved in
                  our system and sent to our team for quick confirmation.
                </p>

                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  <InfoPill
                    icon={CheckCircle2}
                    title="Backend Saved"
                    text="Admin can review"
                  />

                  <InfoPill
                    icon={MessageCircle}
                    title="WhatsApp"
                    text="Fast confirmation"
                  />

                  <InfoPill icon={Car} title="Fleet" text="Choose any car" />
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-2xl font-black tracking-[-0.04em] text-[#06142A]">
                  Business Contact
                </h2>

                <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                  Reach us directly using the details below, or submit the
                  booking form.
                </p>

                <div className="mt-6 space-y-4">
                  <ContactItem
                    icon={Phone}
                    title="Phone"
                    value={phoneNumber}
                    href={`tel:${phoneNumber.replace(/\s/g, "")}`}
                  />

                  <ContactItem
                    icon={MessageCircle}
                    title="WhatsApp"
                    value={whatsappNumber}
                    href={`https://wa.me/${whatsappNumber}`}
                  />

                  <ContactItem
                    icon={Mail}
                    title="Email"
                    value={email}
                    href={`mailto:${email}`}
                  />

                  <ContactItem
                    icon={MapPin}
                    title="Location"
                    value={location}
                  />
                </div>

                <Link
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-5 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
                >
                  <MessageCircle size={18} />
                  Chat on WhatsApp
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
              <aside className="space-y-5">
                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-[#06142A]">
                    Booking Summary
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Select a car and travel dates to see the estimated total.
                  </p>

                  <div className="mt-6 space-y-4">
                    <SummaryItem
                      label="Selected Car"
                      value={selectedCar?.name ?? "No car selected"}
                    />

                    <SummaryItem
                      label="Price Per Day"
                      value={
                        selectedCar
                          ? `KSh ${selectedCar.pricePerDay.toLocaleString()}`
                          : "Select a car"
                      }
                    />

                    <SummaryItem
                      label="Total Days"
                      value={
                        totalDays
                          ? `${totalDays} day${totalDays > 1 ? "s" : ""}`
                          : "Select dates"
                      }
                    />

                    <SummaryItem
                      label="Estimated Total"
                      value={
                        estimatedTotal
                          ? `KSh ${estimatedTotal.toLocaleString()}`
                          : "Select car and dates"
                      }
                      highlight
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-200 bg-[#06142A] p-6 text-white shadow-sm">
                  <h2 className="text-xl font-black">What happens next?</h2>

                  <div className="mt-5 space-y-4">
                    <Step number="1" text="Your booking is saved as pending." />
                    <Step
                      number="2"
                      text="Admin reviews the booking request."
                    />
                    <Step number="3" text="Our team confirms availability." />
                    <Step
                      number="4"
                      text="You receive confirmation by phone or WhatsApp."
                    />
                  </div>
                </section>
              </aside>

              <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-2xl font-black tracking-[-0.04em] text-[#06142A]">
                    Send Booking Request
                  </h2>

                  <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                    Fill in your details below. This booking will appear in the
                    admin dashboard immediately.
                  </p>
                </div>

                {successMessage && (
                  <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                    {successMessage}
                  </div>
                )}

                {errorMessage && (
                  <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
                        Select Car
                      </span>

                      <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
                        <Car size={17} className="shrink-0 text-slate-400" />

                        <select
                          value={form.carId}
                          onChange={(event) =>
                            setForm({ ...form, carId: event.target.value })
                          }
                          className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none"
                        >
                          <option value="">
                            {cars === undefined
                              ? "Loading cars..."
                              : "Choose a car"}
                          </option>

                          {(cars ?? []).map((car) => (
                            <option key={car._id} value={car._id}>
                              {car.name} — KSh{" "}
                              {car.pricePerDay.toLocaleString()} / day
                            </option>
                          ))}
                        </select>
                      </div>
                    </label>

                    <Input
                      label="Full Name"
                      icon={User}
                      value={form.customerName}
                      placeholder="Your full name"
                      onChange={(value) =>
                        setForm({ ...form, customerName: value })
                      }
                    />

                    <Input
                      label="Phone Number"
                      icon={Phone}
                      value={form.customerPhone}
                      placeholder="0712 345 678"
                      onChange={(value) =>
                        setForm({ ...form, customerPhone: value })
                      }
                    />

                    <Input
                      label="Email Optional"
                      icon={Mail}
                      value={form.customerEmail}
                      placeholder="your@email.com"
                      onChange={(value) =>
                        setForm({ ...form, customerEmail: value })
                      }
                    />

                    <Input
                      label="Pickup Location"
                      icon={MapPin}
                      value={form.pickupLocation}
                      placeholder="Nairobi"
                      onChange={(value) =>
                        setForm({ ...form, pickupLocation: value })
                      }
                    />

                    <Input
                      label="Pickup Date"
                      icon={CalendarDays}
                      type="date"
                      value={form.pickupDate}
                      onChange={(value) =>
                        setForm({ ...form, pickupDate: value })
                      }
                    />

                    <Input
                      label="Return Date"
                      icon={CalendarDays}
                      type="date"
                      value={form.returnDate}
                      onChange={(value) =>
                        setForm({ ...form, returnDate: value })
                      }
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Return Location"
                        icon={MapPin}
                        value={form.returnLocation}
                        placeholder="Nairobi"
                        onChange={(value) =>
                          setForm({ ...form, returnLocation: value })
                        }
                      />
                    </div>
                  </div>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
                      Extra Message Optional
                    </span>

                    <textarea
                      value={form.message}
                      onChange={(event) =>
                        setForm({ ...form, message: event.target.value })
                      }
                      rows={4}
                      placeholder="Airport pickup, driver request, delivery location, or any special request..."
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-50"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-4 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Send size={18} />
                    {isSubmitting ? "Sending Booking..." : "Submit Booking"}
                  </button>
                </form>
              </section>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "date";
  icon: React.ElementType;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
        {label}
      </span>

      <div className="flex h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 transition focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
        <Icon size={17} className="shrink-0 text-slate-400" />

        <input
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

function ContactItem({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-blue-50">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1E6FD9]">
        <Icon size={21} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
          {title}
        </p>

        <p className="mt-1 break-words text-sm font-black text-[#06142A]">
          {value}
        </p>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} target={href.startsWith("http") ? "_blank" : undefined}>
      {content}
    </Link>
  );
}

function InfoPill({
  icon: Icon,
  title,
  text,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#FF6B00]">
        <Icon size={20} />
      </div>

      <p className="mt-3 text-sm font-black">{title}</p>
      <p className="mt-1 text-xs font-semibold text-white/55">{text}</p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 ${highlight ? "bg-blue-50" : "bg-slate-50"}`}
    >
      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-black ${
          highlight ? "text-[#1E6FD9]" : "text-[#06142A]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Step({ number, text }: { number: string; text: string }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FF6B00] text-xs font-black text-white">
        {number}
      </div>

      <p className="pt-1 text-sm font-semibold leading-6 text-white/75">
        {text}
      </p>
    </div>
  );
}

function calculateTotalDays(pickupDate: string, returnDate: string) {
  if (!pickupDate || !returnDate) return undefined;

  const pickup = new Date(pickupDate);
  const returned = new Date(returnDate);

  if (Number.isNaN(pickup.getTime()) || Number.isNaN(returned.getTime())) {
    return undefined;
  }

  return Math.max(
    1,
    Math.ceil((returned.getTime() - pickup.getTime()) / (1000 * 60 * 60 * 24)),
  );
}

function buildWhatsAppMessage({
  businessName,
  carName,
  pricePerDay,
  totalDays,
  estimatedTotal,
  customerName,
  customerPhone,
  customerEmail,
  pickupDate,
  returnDate,
  pickupLocation,
  returnLocation,
  message,
}: {
  businessName: string;
  carName: string;
  pricePerDay?: number;
  totalDays?: number;
  estimatedTotal?: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  message: string;
}) {
  return `Hello ${businessName}, I would like to book a car.

Car: ${carName}
Price Per Day: ${
    pricePerDay ? `KSh ${pricePerDay.toLocaleString()}` : "Not calculated"
  }
Pickup Date: ${pickupDate}
Return Date: ${returnDate}
Pickup Location: ${pickupLocation}
Return Location: ${returnLocation}
Total Days: ${totalDays ?? "Not calculated"}
Estimated Total: ${
    estimatedTotal ? `KSh ${estimatedTotal.toLocaleString()}` : "Not calculated"
  }

Customer Name: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail || "Not provided"}

Message: ${message || "No extra message"}`;
}
