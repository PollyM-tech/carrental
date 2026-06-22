"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, MessageCircle } from "lucide-react";

import { api } from "../../../convex/_generated/api";

type BookingStep = 1 | 2 | 3;

const BUSINESS_NAME = "MoBri Car Hire";
const WHATSAPP_NUMBER = "254716741039";

const categories = [
  {
    id: "economy",
    title: "Economy Ride",
    desc: "Affordable cars for daily movement, errands, and city travel.",
    price: "From KSh 3,500/day",
  },
  {
    id: "family",
    title: "Family Comfort",
    desc: "Spacious cars for family trips, weekend plans, and group comfort.",
    price: "From KSh 5,000/day",
  },
  {
    id: "suv",
    title: "SUV Adventure",
    desc: "Strong, reliable SUVs for upcountry trips and rougher routes.",
    price: "From KSh 8,000/day",
  },
  {
    id: "executive",
    title: "Executive Luxury",
    desc: "Premium vehicles for business travel, VIP movement, and events.",
    price: "Custom pricing",
  },
];

export default function BookingForm() {
  const createBooking = useMutation(api.bookings.create);

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    pickupLocation: "",
    returnLocation: "",
    pickupDate: "",
    returnDate: "",
    sameLocation: true,
    message: "",
  });

  const finalReturnLocation = form.sameLocation
    ? form.pickupLocation
    : form.returnLocation;

  const isValid =
    selectedCategory.trim() &&
    form.customerName.trim() &&
    form.customerPhone.trim() &&
    form.pickupLocation.trim() &&
    finalReturnLocation.trim() &&
    form.pickupDate &&
    form.returnDate &&
    form.returnDate > form.pickupDate;

  async function handleSubmitBooking() {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      await createBooking({
        carName: selectedCategory,
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        customerEmail: form.customerEmail.trim() || undefined,
        pickupDate: form.pickupDate,
        returnDate: form.returnDate,
        pickupLocation: form.pickupLocation.trim(),
        returnLocation: finalReturnLocation.trim(),
        message: form.message.trim() || undefined,
      });

      const whatsappMessage = `Hello ${BUSINESS_NAME},

I would like to book a car.

Customer Name: ${form.customerName}
Phone Number: ${form.customerPhone}
Email: ${form.customerEmail || "Not provided"}

Vehicle Category: ${selectedCategory}
Pickup Location: ${form.pickupLocation}
Return Location: ${finalReturnLocation}
Pickup Date/Time: ${form.pickupDate.replace("T", " ")}
Return Date/Time: ${form.returnDate.replace("T", " ")}

Message: ${form.message || "No extra message"}

Kindly confirm availability and pricing.`;

      window.open(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
          whatsappMessage,
        )}`,
        "_blank",
      );

      setStep(1);
      setSelectedCategory("");
      setForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        pickupLocation: "",
        returnLocation: "",
        pickupDate: "",
        returnDate: "",
        sameLocation: true,
        message: "",
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving your booking.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section id="booking" className="bg-[#f6f8fb] px-4 py-20">
      <div className="mx-auto max-w-[1120px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-orange-600">
            MoBri Car Hire Booking
          </span>

          <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#0A1628] sm:text-4xl md:text-5xl">
            Book Your Car in Kenya
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
            Choose your ride, share your trip details, save your booking, and
            continue instantly on WhatsApp.
          </p>
        </motion.div>

        <div className="mx-auto mt-8 flex max-w-[560px] items-center justify-center gap-3">
          <Step number="1" label="Choose Car" active={step >= 1} />
          <Line active={step >= 2} />
          <Step number="2" label="Details" active={step >= 2} />
          <Line active={step >= 3} />
          <Step number="3" label="Confirm" active={step >= 3} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-9 rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_28px_80px_rgba(10,22,40,0.08)] sm:p-8"
        >
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
              {errorMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                className="grid gap-5 md:grid-cols-2"
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category.title);
                      setStep(2);
                    }}
                    className={`rounded-2xl border p-6 text-left transition hover:-translate-y-1 hover:border-orange-500 hover:shadow-xl ${
                      selectedCategory === category.title
                        ? "border-orange-500 bg-orange-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <h3 className="text-lg font-black text-[#0A1628]">
                      {category.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {category.desc}
                    </p>
                    <p className="mt-8 text-sm font-black text-orange-600">
                      {category.price}
                    </p>
                  </button>
                ))}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
              >
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    ← Change car
                  </button>

                  <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-black text-orange-700">
                    {selectedCategory}
                  </span>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Input
                    label="Full Name"
                    placeholder=""
                    value={form.customerName}
                    onChange={(value) =>
                      setForm({ ...form, customerName: value })
                    }
                  />

                  <Input
                    label="Phone Number"
                    placeholder=""
                    value={form.customerPhone}
                    onChange={(value) =>
                      setForm({ ...form, customerPhone: value })
                    }
                  />
                </div>

                <Input
                  label="Email Address Optional"
                  placeholder=""
                  value={form.customerEmail}
                  onChange={(value) =>
                    setForm({ ...form, customerEmail: value })
                  }
                />

                <Input
                  label="Pickup Location"
                  placeholder=""
                  value={form.pickupLocation}
                  onChange={(value) =>
                    setForm({ ...form, pickupLocation: value })
                  }
                />

                <label className="mb-5 flex w-fit cursor-pointer items-center gap-2 text-sm font-bold text-[#0A1628]">
                  <input
                    type="checkbox"
                    checked={form.sameLocation}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        sameLocation: event.target.checked,
                        returnLocation: event.target.checked
                          ? ""
                          : form.returnLocation,
                      })
                    }
                    className="h-4 w-4 accent-orange-600"
                  />
                  Return to the same location
                </label>

                {!form.sameLocation && (
                  <Input
                    label="Return Location"
                    placeholder="e.g. CBD, Kilimani, Thika Road"
                    value={form.returnLocation}
                    onChange={(value) =>
                      setForm({ ...form, returnLocation: value })
                    }
                  />
                )}

                <div className="grid gap-5 md:grid-cols-2">
                  <DateInput
                    label="Pickup Date and Time"
                    value={form.pickupDate}
                    onChange={(value) =>
                      setForm({ ...form, pickupDate: value })
                    }
                  />

                  <DateInput
                    label="Return Date and Time"
                    value={form.returnDate}
                    onChange={(value) =>
                      setForm({ ...form, returnDate: value })
                    }
                  />
                </div>

                <TextArea
                  label="Message Optional"
                  placeholder="Add delivery notes, preferred car, driver request, or special instructions."
                  value={form.message}
                  onChange={(value) => setForm({ ...form, message: value })}
                />

                <button
                  type="button"
                  disabled={!isValid}
                  onClick={() => setStep(3)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isValid
                    ? "Continue to Confirm"
                    : "Complete Details to Continue"}
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="mt-3 w-full rounded-xl border border-orange-200 bg-orange-50 px-6 py-4 text-sm font-black text-orange-700 transition hover:bg-orange-100"
                >
                  ← Return to Car Selection
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
              >
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    ← Edit details
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    Change car
                  </button>
                </div>

                <h3 className="text-center text-2xl font-black text-[#0A1628]">
                  Review Your Booking
                </h3>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <Summary label="Customer Name" value={form.customerName} />
                  <Summary label="Phone Number" value={form.customerPhone} />
                  <Summary
                    label="Email"
                    value={form.customerEmail || "Not provided"}
                  />
                  <Summary label="Vehicle Category" value={selectedCategory} />
                  <Summary
                    label="Pickup Location"
                    value={form.pickupLocation}
                  />
                  <Summary
                    label="Return Location"
                    value={finalReturnLocation}
                  />
                  <Summary
                    label="Pickup Time"
                    value={form.pickupDate.replace("T", " ")}
                  />
                  <Summary
                    label="Return Time"
                    value={form.returnDate.replace("T", " ")}
                  />
                  <Summary
                    label="Message"
                    value={form.message || "No extra message"}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitBooking}
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-6 py-4 text-sm font-black text-white transition hover:-translate-y-1 hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? (
                    "Saving Booking..."
                  ) : (
                    <>
                      <MessageCircle size={18} />
                      Save Booking & Continue on WhatsApp
                    </>
                  )}
                </button>

                <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs font-semibold text-slate-500">
                  <CheckCircle size={14} className="text-orange-600" />
                  Your booking will be saved before WhatsApp opens.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function Step({
  number,
  label,
  active,
}: {
  number: string;
  label: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition ${
        active
          ? "bg-orange-600 text-white shadow-lg"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
          active ? "bg-white text-orange-600" : "bg-white text-slate-600"
        }`}
      >
        {number}
      </span>
      {label}
    </div>
  );
}

function Line({ active }: { active: boolean }) {
  return (
    <div
      className={`hidden h-[2px] w-10 rounded-full sm:block ${
        active ? "bg-orange-600" : "bg-slate-300"
      }`}
    />
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#0A1628]">
        {label}
      </span>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold text-[#0A1628] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function DateInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#0A1628]">
        {label}
      </span>
      <input
        type="datetime-local"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold text-[#0A1628] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mb-5 block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.08em] text-[#0A1628]">
        {label}
      </span>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-[#0A1628] outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-200 py-3 text-sm last:border-b-0">
      <span className="font-semibold text-slate-500">{label}</span>
      <strong className="text-right font-black text-[#0A1628]">{value}</strong>
    </div>
  );
}
