
"use client";
import { trackConversion } from "@/lib/analytics";

import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import { normalisePhone } from "../../../../convex/lib/identity";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";


type InquiryType = "general" | "booking";

type ContactForm = {
  name: string;
  phone: string;
  email: string;
  vehicle: string;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  returnLocation: string;
  sameLocation: boolean;
  message: string;
};

const WHATSAPP_NUMBER = "254716741039";
const PHONE_NUMBER = "+254716741039";

const inputClass =
  "mt-1.5 h-11 w-full rounded-lg border border-slate-200 " +
  "bg-white px-3.5 text-sm text-[#0B1C4D] outline-none " +
  "transition-colors placeholder:text-slate-400 " +
  "focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100";

const labelClass =
  "block text-[13px] font-medium text-slate-700";

export default function ContactFormContent({
  selectedCar,
  selectedService = "",
}: {
  selectedCar: string;
  selectedService?: string;
}) {
  const [inquiryType, setInquiryType] =
    useState<InquiryType>(
      selectedCar ? "booking" : "general"
    );

  const [form, setForm] = useState<ContactForm>({
    name: "",
    phone: "",
    email: "",
    vehicle: selectedCar,
    pickupDate: "",
    returnDate: "",
    pickupLocation: "",
    returnLocation: "",
    sameLocation: true,
    message: selectedService ? `I would like to enquire about ${selectedService}.` : "",
  });

  const [step, setStep] = useState<"details" | "review">(
    "details"
  );

  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState("");
  const pending = useRef(false);
  const requestKey = useRef<string | null>(null);
  const [savedEnquiry, setSavedEnquiry] = useState<{ reference: string; whatsappUrl: string } | null>(null);

  const finalReturnLocation = form.sameLocation
    ? form.pickupLocation
    : form.returnLocation;

  function updateField(
    field: keyof ContactForm,
    value: string | boolean
  ) {
    if (sending) return;
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    if (savedEnquiry) { setSavedEnquiry(null); requestKey.current = null; }
  }

  function changeInquiryType(type: InquiryType) {
    if (sending) return;
    setSavedEnquiry(null); requestKey.current = null;
    setInquiryType(type);
    setStep("details");
    setError("");
  }

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please enter your full name and phone number.");
      return;
    }

    try { normalisePhone(form.phone); } catch { setError("Enter your phone with country code, or a Kenyan 07… / 01… number."); return; }

    if (inquiryType === "general") {
      if (!form.message.trim()) {
        setError("Please enter your message.");
        return;
      }

      setStep("review");
      return;
    }

    if (
      !form.pickupDate ||
      !form.returnDate ||
      !form.pickupLocation.trim() ||
      !finalReturnLocation.trim()
    ) {
      setError(
        "Please complete your rental dates and pickup/return locations."
      );
      return;
    }

    if (form.returnDate <= form.pickupDate) {
      setError(
        "Return date and time must be after pickup date and time."
      );
      return;
    }

    setStep("review");
  }

  async function continueToWhatsApp() {
    if (pending.current) return;
    pending.current = true; setSending(true); setError("");
    try {
      requestKey.current ??= crypto.randomUUID();
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestKey: requestKey.current, kind: inquiryType, ...form, website, returnLocation: finalReturnLocation }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save your enquiry. Please retry.");
      const saved = { reference: String(result.reference), whatsappUrl: String(result.whatsappUrl) };
      trackConversion("enquiry_saved");
      setSavedEnquiry(saved);
      try { window.location.assign(saved.whatsappUrl); } catch { /* Keep the saved reference and retry link visible. */ }
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to save. Please retry."); }
    finally { pending.current = false; setSending(false); }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Page introduction */}
      <section className="bg-[#F5F8FF] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl text-center">
          <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-bold text-[#E86D00]">
            CONTACT MOVARA
          </span>

          <h1 className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-[#0B1C4D] sm:text-[34px] lg:text-[38px]">
            Get in Touch{" "}
            <span className="text-[#FF7A00]">
              With Us.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-slate-600">
            Ask about our self-drive vehicles,
            rental arrangements, or your next journey.
            Our team is ready to assist.
          </p>
        </div>
      </section>

      {/* Main layout */}
      <section className="px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">

          {/* Contact information */}
          <aside>
            <span className="text-[11px] font-bold uppercase tracking-wide text-[#E86D00]">
              HOW TO REACH US
            </span>

            <h2 className="mt-2 text-[23px] font-bold text-[#0B1C4D] sm:text-[26px]">
              We are Here to Help
            </h2>

            <p className="mt-3 max-w-md text-[14px] leading-7 text-slate-600">
              Whether you are planning a business trip,
              collecting a rental vehicle, or arranging
              a family journey, get in touch with Movara.
            </p>

            <div className="mt-6 space-y-3">
              <a
                href={`tel:${PHONE_NUMBER}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-orange-200"
              >
                <ContactIcon icon={Phone} />

                <div>
                  <p className="text-xs text-slate-500">
                    Phone
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0B1C4D]">
                    +254 716 741 039
                  </p>
                </div>
              </a>


              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition-colors hover:border-orange-200"
              >
                <ContactIcon icon={MessageCircle} />

                <div>
                  <p className="text-xs text-slate-500">
                    WhatsApp
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0B1C4D]">
                    Chat with Movara
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <ContactIcon icon={MapPin} />

                <div>
                  <p className="text-xs text-slate-500">
                    Service Location
                  </p>
                  <p className="mt-1 text-[14px] font-bold text-[#0B1C4D]">
                    Jade Plaza, Lumumba Drive, Kasarani, Nairobi
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-[#F5F8FF] p-5">
              <CheckCircle2
                size={19}
                className="text-[#FF7A00]"
                aria-hidden="true"
              />

              <h3 className="mt-3 text-[14px] font-bold text-[#0B1C4D]">
                Looking for a Rental Car?
              </h3>

              <p className="mt-2 text-[13px] leading-6 text-slate-600">
                Browse our fleet or share your requirements.
                We can help you inquire about suitable
                self-drive options.
              </p>

              <Link
                href="/cars"
                className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#E86D00] hover:underline"
              >
                Explore Our Fleet
                <ArrowRight size={15} />
              </Link>
            </div>
          </aside>

          {/* Inquiry form */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
            <h2 className="text-[22px] font-bold text-[#0B1C4D]">
              {step === "review"
                ? "Review Your Inquiry"
                : "Send an Inquiry"}
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-slate-600">
              {step === "review"
                ? "Check your information before saving and opening WhatsApp."
                : "Complete your details. We save your enquiry before opening WhatsApp."}
            </p>

            {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {step === "details" ? (
              <>
                {/* Inquiry type */}
                <div
                  role="group"
                  aria-label="Inquiry type"
                  className="mt-5 grid grid-cols-2 gap-1 rounded-lg bg-[#F5F8FF] p-1"
                >
                  <button
                    type="button"
                    aria-pressed={inquiryType === "general"}
                    onClick={() =>
                      changeInquiryType("general")
                    }
                    className={`min-h-10 rounded-md px-3 py-2 text-[13px] font-medium ${
                      inquiryType === "general"
                        ? "bg-white text-[#0B1C4D] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    General Inquiry
                  </button>

                  <button
                    type="button"
                    aria-pressed={inquiryType === "booking"}
                    onClick={() =>
                      changeInquiryType("booking")
                    }
                    className={`min-h-10 rounded-md px-3 py-2 text-[13px] font-medium ${
                      inquiryType === "booking"
                        ? "bg-white text-[#0B1C4D] shadow-sm"
                        : "text-slate-500"
                    }`}
                  >
                    Car Rental
                  </button>
                </div>

                <form
                  onSubmit={handleReview}
                  className="mt-6"
                >
                  <label className="hidden" aria-hidden="true">Leave empty<input type="text" name="website" autoComplete="off" tabIndex={-1} value={website} onChange={event => setWebsite(event.target.value)} /></label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Full Name *"
                      required
                      value={form.name}
                      onChange={(value) =>
                        updateField("name", value)
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                    />

                    <Field
                      label="Phone Number *"
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(value) =>
                        updateField("phone", value)
                      }
                      placeholder="0712 345 678"
                      autoComplete="tel"
                    />

                    <div className="sm:col-span-2">
                      <Field
                        label="Email (Optional)"
                        type="email"
                        value={form.email}
                        onChange={(value) =>
                          updateField("email", value)
                        }
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Rental details */}
                  {inquiryType === "booking" && (
                    <div className="mt-6">
                      <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                        <CalendarDays
                          size={17}
                          className="text-[#FF7A00]"
                          aria-hidden="true"
                        />
                        <h3 className="text-[14px] font-bold text-[#0B1C4D]">
                          Rental Details
                        </h3>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Field
                            label="Preferred Vehicle"
                            value={form.vehicle}
                            onChange={(value) =>
                              updateField("vehicle", value)
                            }
                            placeholder="e.g. Preferred car or SUV"
                          />
                        </div>

                        <Field
                          label="Pickup Date & Time *"
                          type="datetime-local"
                          required
                          value={form.pickupDate}
                          onChange={(value) =>
                            updateField("pickupDate", value)
                          }
                        />

                        <Field
                          label="Return Date & Time *"
                          type="datetime-local"
                          required
                          min={form.pickupDate || undefined}
                          value={form.returnDate}
                          onChange={(value) =>
                            updateField("returnDate", value)
                          }
                        />

                        <div className="sm:col-span-2">
                          <Field
                            label="Pickup Location *"
                            required
                            value={form.pickupLocation}
                            onChange={(value) =>
                              updateField(
                                "pickupLocation",
                                value
                              )
                            }
                            placeholder="e.g. Nairobi CBD"
                          />
                        </div>
                      </div>

                      {/* Same return location */}
                      <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-[13px] text-slate-700">
                        <input
                          type="checkbox"
                          checked={form.sameLocation}
                          onChange={(event) =>
                            updateField(
                              "sameLocation",
                              event.target.checked
                            )
                          }
                          className="h-4 w-4 accent-[#FF7A00]"
                        />
                        Return to the same location
                      </label>

                      {!form.sameLocation && (
                        <div className="mt-4">
                          <Field
                            label="Return Location *"
                            required
                            value={form.returnLocation}
                            onChange={(value) =>
                              updateField(
                                "returnLocation",
                                value
                              )
                            }
                            placeholder="e.g. JKIA or Westlands"
                          />
                        </div>
                      )}
                    </div>
                  )}
                  {/* Message */}
                  <label className={`${labelClass} mt-5`}>
                    {inquiryType === "general"
                      ? "Your Message *"
                      : "Additional Information (Optional)"}

                    <textarea
                      rows={3}
                      value={form.message}
                      required={inquiryType === "general"}
                      onChange={(event) =>
                        updateField(
                          "message",
                          event.target.value
                        )
                      }
                      placeholder={
                        inquiryType === "general"
                          ? "How can we help?"
                          : "Destination, passengers, luggage, or special arrangements..."
                      }
                      className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3.5 py-3 text-sm leading-6 text-[#0B1C4D] outline-none focus:border-[#FF7A00] focus:ring-2 focus:ring-orange-100"
                    />
                  </label>



                  <button
                    type="submit"
                    className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#E86D00] sm:w-auto"
                  >
                    Review Details
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </button>
                </form>
              </>
            ) : (
              /* Review before WhatsApp */
              <div className="mt-6">
                <div className="rounded-xl bg-[#F5F8FF] p-4 sm:p-5">
                  <ReviewRow
                    label="Inquiry Type"
                    value={
                      inquiryType === "booking"
                        ? "Car Rental"
                        : "General Inquiry"
                    }
                  />

                  <ReviewRow
                    label="Full Name"
                    value={form.name}
                  />

                  <ReviewRow
                    label="Phone"
                    value={form.phone}
                  />

                  {form.email && (
                    <ReviewRow
                      label="Email"
                      value={form.email}
                    />
                  )}

                  {inquiryType === "booking" && (
                    <>
                      <ReviewRow
                        label="Vehicle"
                        value={
                          form.vehicle ||
                          "Open to suggestions"
                        }
                      />

                      <ReviewRow
                        label="Pickup"
                        value={formatDateTime(
                          form.pickupDate
                        )}
                      />

                      <ReviewRow
                        label="Return"
                        value={formatDateTime(
                          form.returnDate
                        )}
                      />

                      <ReviewRow
                        label="Pickup Location"
                        value={form.pickupLocation}
                      />

                      <ReviewRow
                        label="Return Location"
                        value={finalReturnLocation}
                      />
                    </>
                  )}

                  {form.message && (
                    <ReviewRow
                      label="Message"
                      value={form.message}
                    />
                  )}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => setStep("details")}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-[13px] font-medium text-[#0B1C4D]"
                  >
                    <ArrowLeft size={16} />
                    Edit Details
                  </button>

                  {savedEnquiry && <div role="status" className="mb-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm"><p>Your enquiry is saved. Reference: <span className="break-all font-mono">{savedEnquiry.reference}</span></p><a href={savedEnquiry.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-green-800 underline">Open WhatsApp and tap Send</a></div>}
                  <button
                    type="button"
                    disabled={sending}
                    onClick={() => { if (savedEnquiry) window.location.assign(savedEnquiry.whatsappUrl); else void continueToWhatsApp(); }}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#FF7A00] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#E86D00]"
                  >
                    <Send size={16} />
                    {sending ? "Saving…" : savedEnquiry ? "Open WhatsApp" : "Save & continue on WhatsApp"}
                    <ArrowRight size={16} />
                  </button>
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Your details are saved first. WhatsApp will open with your prepared
                  message. Review and send it to Movara.
                  Tap Send to notify us on WhatsApp. Your details are already in our system; a rental is confirmed only after Movara’s approval.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function formatDateTime(value: string) {
  if (!value) return "Not selected";
  return value.replace("T", " at ");
}

function ContactIcon({
  icon: Icon,
}: {
  icon: typeof Phone;
}) {
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#FF7A00]">
      <Icon size={18} aria-hidden="true" />
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  min,
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  min?: string;
  autoComplete?: string;
}) {
  return (
    <label className={labelClass}>
      {label}

      <input
        type={type}
        value={value}
        required={required}
        min={min}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={inputClass}
      />
    </label>
  );
}

function ReviewRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 py-2.5 last:border-0 sm:flex-row sm:justify-between sm:gap-5">
      <span className="text-[12px] text-slate-500">
        {label}
      </span>

      <span className="break-words text-[13px] font-medium text-[#0B1C4D] sm:max-w-[65%] sm:text-right">
        {value}
      </span>
    </div>
  );
}

