"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Smartphone,
} from "lucide-react";

import { api } from "../../../../convex/_generated/api";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

function subscribeToAdminToken(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAdminTokenSnapshot() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return localStorage.getItem("mobri_admin_token");
}

function getAdminTokenServerSnapshot() {
  return undefined;
}

export default function DashboardSettingsPage() {
  const router = useRouter();

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const settings = useQuery(api.settings.getSettings);
  const updateSettings = useMutation(api.settings.updateSettings);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    businessName: "MoBri Car Hire",
    whatsappNumber: "254716741039",
    phoneNumber: "0716 741 039",
    email: "info@mobricarhire.co.ke",
    location: "Nairobi, Kenya",
  });

  useEffect(() => {
    if (adminToken === null) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  useEffect(() => {
    if (!settings) return;

    setForm({
      businessName: settings.businessName ?? "MoBri Car Hire",
      whatsappNumber: settings.whatsappNumber ?? "254716741039",
      phoneNumber: settings.phoneNumber ?? "0716 741 039",
      email: settings.email ?? "info@mobricarhire.co.ke",
      location: settings.location ?? "Nairobi, Kenya",
    });
  }, [settings]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (typeof adminToken !== "string") {
      setErrorMessage("Admin session missing. Please log in again.");
      return;
    }

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      if (!form.businessName.trim()) {
        throw new Error("Business name is required.");
      }

      if (!form.whatsappNumber.trim()) {
        throw new Error("WhatsApp number is required.");
      }

      await updateSettings({
        adminToken,
        businessName: form.businessName.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        email: form.email.trim() || undefined,
        location: form.location.trim() || undefined,
      });

      setSuccessMessage("Business settings saved successfully.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save settings. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (adminToken === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Checking admin session...
          </p>
        </div>
      </main>
    );
  }

  if (adminToken === null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fb] px-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Redirecting to admin login...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#06142A] lg:flex">
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <AdminHeader
          title="Settings"
          subtitle="Manage business contact details and public website settings."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1200px]">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FF6B00]">
                  Business Settings
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Website & Contact Settings
                </h1>

                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-slate-600">
                  Update the business details used across the website, WhatsApp
                  booking flow, contact sections, and public customer pages.
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#1E6FD9]">
                <Settings size={28} />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-black text-[#06142A]">
                    Business Information
                  </h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">
                    These details will be used on the public website and booking
                    messages.
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
                    <Input
                      label="Business Name"
                      icon={Building2}
                      value={form.businessName}
                      placeholder="MoBri Car Hire"
                      onChange={(value) =>
                        setForm({ ...form, businessName: value })
                      }
                    />

                    <Input
                      label="WhatsApp Number"
                      icon={Smartphone}
                      value={form.whatsappNumber}
                      placeholder="254716741039"
                      onChange={(value) =>
                        setForm({ ...form, whatsappNumber: value })
                      }
                    />

                    <Input
                      label="Phone Number"
                      icon={Phone}
                      value={form.phoneNumber}
                      placeholder="0716 741 039"
                      onChange={(value) =>
                        setForm({ ...form, phoneNumber: value })
                      }
                    />

                    <Input
                      label="Email Address"
                      icon={Mail}
                      value={form.email}
                      placeholder="info@mobricarhire.co.ke"
                      onChange={(value) => setForm({ ...form, email: value })}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Business Location"
                        icon={MapPin}
                        value={form.location}
                        placeholder="Nairobi, Kenya"
                        onChange={(value) =>
                          setForm({ ...form, location: value })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          businessName: "MoBri Car Hire",
                          whatsappNumber: "254716741039",
                          phoneNumber: "0716 741 039",
                          email: "info@mobricarhire.co.ke",
                          location: "Nairobi, Kenya",
                        })
                      }
                      className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                    >
                      Reset Defaults
                    </button>

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      <Save size={18} />
                      {isSaving ? "Saving..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </section>

              <aside className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-lg font-black text-[#06142A]">
                    Current Preview
                  </h2>

                  <p className="mt-1 text-sm font-medium text-slate-500">
                    This is how the business information will appear.
                  </p>

                  <div className="mt-5 space-y-4">
                    <PreviewItem
                      label="Business"
                      value={form.businessName || "Not set"}
                    />

                    <PreviewItem
                      label="WhatsApp"
                      value={form.whatsappNumber || "Not set"}
                    />

                    <PreviewItem
                      label="Phone"
                      value={form.phoneNumber || "Not set"}
                    />

                    <PreviewItem
                      label="Email"
                      value={form.email || "Not set"}
                    />

                    <PreviewItem
                      label="Location"
                      value={form.location || "Not set"}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-[#06142A] p-5 text-white shadow-sm sm:p-6">
                  <h2 className="text-lg font-black">Where this is used</h2>

                  <div className="mt-4 space-y-3 text-sm font-semibold text-white/70">
                    <p>• Floating WhatsApp button</p>
                    <p>• Booking WhatsApp message</p>
                    <p>• Footer contact details</p>
                    <p>• Contact page information</p>
                    <p>• Business display name</p>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
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
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-slate-950 outline-none placeholder:text-slate-400"
        />
      </div>
    </label>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-black text-[#06142A]">
        {value}
      </p>
    </div>
  );
}
