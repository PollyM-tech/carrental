"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  XCircle,
} from "lucide-react";

import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

function subscribeToAdminToken(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  window.addEventListener("storage", callback);

  return () => {
    window.removeEventListener("storage", callback);
  };
}

function getAdminTokenSnapshot() {
  if (typeof window === "undefined") return undefined;
  return localStorage.getItem("mobri_admin_token");
}

function getAdminTokenServerSnapshot() {
  return undefined;
}

function formatDate(date?: string) {
  if (!date) return "Not set";

  try {
    return new Intl.DateTimeFormat("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function formatMoney(amount?: number) {
  if (!amount) return "Not calculated";
  return `KSh ${amount.toLocaleString()}`;
}

function statusClass(status: BookingStatus) {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-slate-100 text-slate-700";
  return "bg-red-100 text-red-700";
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function BookingDetailsPage() {
  const router = useRouter();
  const params = useParams();

  const bookingId = params.bookingId as Id<"bookings">;

  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const booking = useQuery(
    api.bookings.getById,
    typeof adminToken === "string" && bookingId
      ? {
          adminToken,
          bookingId,
        }
      : "skip",
  );

  const confirmBooking = useMutation(api.bookings.confirm);
  const activateBooking = useMutation(api.bookings.activate);
  const completeBooking = useMutation(api.bookings.complete);
  const cancelBooking = useMutation(api.bookings.cancel);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelBox, setShowCancelBox] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (adminToken === null) {
      router.replace("/admin-login");
    }
  }, [adminToken, router]);

  const availableActions = useMemo(() => {
    if (!booking) return null;

    return {
      canConfirm: booking.status === "pending",
      canActivate: booking.status === "confirmed",
      canComplete:
        booking.status === "confirmed" || booking.status === "active",
      canCancel:
        booking.status === "pending" ||
        booking.status === "confirmed" ||
        booking.status === "active",
    };
  }, [booking]);

  async function runAction(action: "confirm" | "activate" | "complete") {
    if (typeof adminToken !== "string") return;

    setIsUpdating(true);
    setErrorMessage("");

    try {
      if (action === "confirm") {
        await confirmBooking({ adminToken, bookingId });
      }

      if (action === "activate") {
        await activateBooking({ adminToken, bookingId });
      }

      if (action === "complete") {
        await completeBooking({ adminToken, bookingId });
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not update this booking.",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleCancel() {
    if (typeof adminToken !== "string") return;

    setIsUpdating(true);
    setErrorMessage("");

    try {
      if (!cancelReason.trim()) {
        throw new Error("Please enter a cancellation reason.");
      }

      await cancelBooking({
        adminToken,
        bookingId,
        cancelReason: cancelReason.trim(),
      });

      setShowCancelBox(false);
      setCancelReason("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not cancel this booking.",
      );
    } finally {
      setIsUpdating(false);
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
          title="Booking Details"
          subtitle="View customer details, car information, and booking status."
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="px-4 py-7 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <Link
                  href="/dashboard/bookings"
                  className="inline-flex items-center gap-2 text-sm font-black text-[#1E6FD9]"
                >
                  <ArrowLeft size={17} />
                  Back to bookings
                </Link>

                <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#06142A]">
                  Booking Details
                </h1>

                <p className="mt-2 text-sm font-medium text-slate-600">
                  Review this customer request and update its booking status.
                </p>
              </div>

              {booking && (
                <span
                  className={`w-fit rounded-xl px-4 py-3 text-sm font-black ${statusClass(
                    booking.status,
                  )}`}
                >
                  {formatStatus(booking.status)}
                </span>
              )}
            </div>

            {errorMessage && (
              <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                {errorMessage}
              </div>
            )}

            {booking === undefined ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Loading booking details...
                </p>
              </div>
            ) : !booking ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <p className="text-sm font-bold text-slate-500">
                  Booking not found.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
                <section className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <User size={20} />
                      <h2 className="text-xl font-black">
                        Customer Information
                      </h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard
                        icon={User}
                        label="Customer Name"
                        value={booking.customerName}
                      />

                      <InfoCard
                        icon={Phone}
                        label="Phone Number"
                        value={booking.customerPhone || "Not provided"}
                        href={
                          booking.customerPhone
                            ? `tel:${booking.customerPhone}`
                            : undefined
                        }
                      />

                      <InfoCard
                        icon={Mail}
                        label="Email Address"
                        value={booking.customerEmail || "Not provided"}
                        href={
                          booking.customerEmail
                            ? `mailto:${booking.customerEmail}`
                            : undefined
                        }
                      />

                      <InfoCard
                        icon={MessageSquare}
                        label="Customer Message"
                        value={booking.message || "No extra message"}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div className="mb-5 flex items-center gap-2">
                      <CalendarDays size={20} />
                      <h2 className="text-xl font-black">Trip Information</h2>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <InfoCard
                        icon={CalendarDays}
                        label="Pickup Date"
                        value={formatDate(booking.pickupDate)}
                      />

                      <InfoCard
                        icon={CalendarDays}
                        label="Return Date"
                        value={formatDate(booking.returnDate)}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="Pickup Location"
                        value={booking.pickupLocation || "Not provided"}
                      />

                      <InfoCard
                        icon={MapPin}
                        label="Return Location"
                        value={booking.returnLocation || "Not provided"}
                      />

                      <InfoCard
                        icon={Clock}
                        label="Total Days"
                        value={
                          booking.totalDays
                            ? `${booking.totalDays} day${
                                booking.totalDays > 1 ? "s" : ""
                              }`
                            : "Not calculated"
                        }
                      />

                      <InfoCard
                        icon={CheckCircle2}
                        label="Total Amount"
                        value={formatMoney(booking.totalAmount)}
                      />
                    </div>
                  </div>
                </section>

                <aside className="space-y-6">
                  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="relative h-56 bg-slate-100">
                      {booking.car?.displayImageUrl ? (
                        <Image
                          src={booking.car.displayImageUrl}
                          alt={booking.carName || "Booked car"}
                          fill
                          sizes="380px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-bold text-slate-400">
                          No car image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-4 flex items-center gap-2">
                        <Car size={20} />
                        <h2 className="text-xl font-black">Booked Car</h2>
                      </div>

                      <p className="text-lg font-black text-[#06142A]">
                        {booking.carName || "Car not selected"}
                      </p>

                      {booking.car && (
                        <div className="mt-4 grid gap-3">
                          <SmallDetail
                            label="Category"
                            value={booking.car.category}
                          />
                          <SmallDetail
                            label="Price Per Day"
                            value={`KSh ${booking.car.pricePerDay.toLocaleString()}`}
                          />
                          <SmallDetail
                            label="Status"
                            value={formatStatus(booking.car.status)}
                          />
                          <SmallDetail
                            label="Location"
                            value={booking.car.location || "Not set"}
                          />
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-black text-[#06142A]">
                      Booking Actions
                    </h2>

                    <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                      Update this booking based on its current status.
                    </p>

                    <div className="mt-5 space-y-3">
                      {availableActions?.canConfirm && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => runAction("confirm")}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E6FD9] px-5 py-3 text-sm font-black text-white transition hover:bg-blue-700 disabled:bg-slate-300"
                        >
                          <CheckCircle2 size={18} />
                          Confirm Booking
                        </button>
                      )}

                      {availableActions?.canActivate && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => runAction("activate")}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-black text-white transition hover:bg-green-700 disabled:bg-slate-300"
                        >
                          <Car size={18} />
                          Mark as Active
                        </button>
                      )}

                      {availableActions?.canComplete && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => runAction("complete")}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06142A] px-5 py-3 text-sm font-black text-white transition hover:bg-[#FF6B00] disabled:bg-slate-300"
                        >
                          <CheckCircle2 size={18} />
                          Complete Booking
                        </button>
                      )}

                      {availableActions?.canCancel && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            setShowCancelBox((current) => !current)
                          }
                          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-700 transition hover:bg-red-100 disabled:bg-slate-100"
                        >
                          <XCircle size={18} />
                          Cancel Booking
                        </button>
                      )}

                      {!availableActions?.canConfirm &&
                        !availableActions?.canActivate &&
                        !availableActions?.canComplete &&
                        !availableActions?.canCancel && (
                          <div className="rounded-xl bg-slate-50 p-4 text-center">
                            <p className="text-sm font-bold text-slate-500">
                              No actions available for this booking.
                            </p>
                          </div>
                        )}
                    </div>

                    {showCancelBox && (
                      <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4">
                        <label className="block">
                          <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-red-700">
                            Cancellation Reason
                          </span>

                          <textarea
                            value={cancelReason}
                            onChange={(event) =>
                              setCancelReason(event.target.value)
                            }
                            rows={3}
                            placeholder="Enter reason for cancellation..."
                            className="w-full resize-none rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
                          />
                        </label>

                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={handleCancel}
                          className="mt-3 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition hover:bg-red-700 disabled:bg-slate-300"
                        >
                          {isUpdating ? "Cancelling..." : "Confirm Cancel"}
                        </button>
                      </div>
                    )}
                  </section>
                </aside>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-[#1E6FD9]">
          <Icon size={19} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-black text-[#06142A]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="block transition hover:-translate-y-0.5">
      {content}
    </Link>
  );
}

function SmallDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="text-sm font-black text-[#06142A]">{value}</p>
    </div>
  );
}
