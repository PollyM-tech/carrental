"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useMutation } from "convex/react";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Eye,
  MapPin,
  Phone,
  User,
  XCircle,
} from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type BookingWithCar = Doc<"bookings"> & {
  carImageUrl?: string | null;
};

type BookingsTableProps = {
  bookings: BookingWithCar[];
};

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

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function statusClass(status: string) {
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "confirmed") return "bg-blue-100 text-blue-700";
  if (status === "active") return "bg-green-100 text-green-700";
  if (status === "completed") return "bg-slate-100 text-slate-700";
  return "bg-red-100 text-red-700";
}

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const adminToken = useSyncExternalStore(
    subscribeToAdminToken,
    getAdminTokenSnapshot,
    getAdminTokenServerSnapshot,
  );

  const confirmBooking = useMutation(api.bookings.confirm);
  const activateBooking = useMutation(api.bookings.activate);
  const completeBooking = useMutation(api.bookings.complete);
  const cancelBooking = useMutation(api.bookings.cancel);

  const [updatingId, setUpdatingId] = useState<Id<"bookings"> | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<Id<"bookings"> | null>(
    null,
  );
  const [cancelReason, setCancelReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function runAction(
    bookingId: Id<"bookings">,
    action: "confirm" | "activate" | "complete",
  ) {
    if (typeof adminToken !== "string") {
      setErrorMessage("Admin session missing. Please log in again.");
      return;
    }

    setUpdatingId(bookingId);
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
          : "Could not update booking status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleCancel(bookingId: Id<"bookings">) {
    if (typeof adminToken !== "string") {
      setErrorMessage("Admin session missing. Please log in again.");
      return;
    }

    setUpdatingId(bookingId);
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

      setCancelBookingId(null);
      setCancelReason("");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Could not cancel booking.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-xl bg-slate-50 p-10 text-center">
        <p className="text-sm font-black text-slate-500">No bookings found.</p>
      </div>
    );
  }

  return (
    <div>
      {errorMessage && (
        <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
          {errorMessage}
        </div>
      )}

      <div className="space-y-4 lg:hidden">
        {bookings.map((booking) => (
          <article
            key={booking._id}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-4">
              <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {booking.carImageUrl ? (
                  <Image
                    src={booking.carImageUrl}
                    alt={booking.carName || "Booked car"}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Car size={22} className="text-slate-300" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="truncate text-base font-black text-[#06142A]">
                      {booking.customerName}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {booking.carName || "Car not selected"}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-black ${statusClass(
                      booking.status,
                    )}`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </div>

                <div className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone size={15} className="text-[#1E6FD9]" />
                    {booking.customerPhone || "Phone not provided"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CalendarDays size={15} className="text-[#1E6FD9]" />
                    {formatDate(booking.pickupDate)} →{" "}
                    {formatDate(booking.returnDate)}
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-[#1E6FD9]" />
                    {booking.pickupLocation || "Pickup not set"}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={`/dashboard/bookings/${booking._id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06142A] px-4 py-2.5 text-xs font-black text-white transition hover:bg-[#FF6B00]"
                  >
                    <Eye size={15} />
                    View Details
                  </Link>

                  <BookingActions
                    booking={booking}
                    updatingId={updatingId}
                    onConfirm={() => runAction(booking._id, "confirm")}
                    onActivate={() => runAction(booking._id, "activate")}
                    onComplete={() => runAction(booking._id, "complete")}
                    onShowCancel={() => setCancelBookingId(booking._id)}
                  />
                </div>

                {cancelBookingId === booking._id && (
                  <CancelBox
                    cancelReason={cancelReason}
                    setCancelReason={setCancelReason}
                    onCancel={() => {
                      setCancelBookingId(null);
                      setCancelReason("");
                    }}
                    onConfirm={() => handleCancel(booking._id)}
                    isUpdating={updatingId === booking._id}
                  />
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] text-left">
          <thead>
            <tr className="border-b border-slate-200 text-sm text-slate-500">
              <th className="pb-4 font-black">Customer</th>
              <th className="pb-4 font-black">Car</th>
              <th className="pb-4 font-black">Trip Dates</th>
              <th className="pb-4 font-black">Location</th>
              <th className="pb-4 font-black">Amount</th>
              <th className="pb-4 font-black">Status</th>
              <th className="pb-4 text-right font-black">Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((booking) => (
              <tr
                key={booking._id}
                className="border-b border-slate-100 last:border-none"
              >
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-[#1E6FD9]">
                      {booking.customerName
                        .split(" ")
                        .map((name) => name[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#06142A]">
                        {booking.customerName}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {booking.customerPhone || "Phone not provided"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-slate-100">
                      {booking.carImageUrl ? (
                        <Image
                          src={booking.carImageUrl}
                          alt={booking.carName || "Booked car"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Car size={18} className="text-slate-300" />
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-black text-[#06142A]">
                        {booking.carName || "Car not selected"}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {booking.totalDays
                          ? `${booking.totalDays} day${
                              booking.totalDays > 1 ? "s" : ""
                            }`
                          : "Days not calculated"}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-5">
                  <p className="text-sm font-bold text-[#06142A]">
                    {formatDate(booking.pickupDate)}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Return: {formatDate(booking.returnDate)}
                  </p>
                </td>

                <td className="py-5">
                  <p className="text-sm font-bold text-[#06142A]">
                    {booking.pickupLocation || "Pickup not set"}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    Return: {booking.returnLocation || "Return not set"}
                  </p>
                </td>

                <td className="py-5">
                  <p className="text-sm font-black text-[#06142A]">
                    {formatMoney(booking.totalAmount)}
                  </p>
                </td>

                <td className="py-5">
                  <span
                    className={`rounded-lg px-3 py-2 text-xs font-black ${statusClass(
                      booking.status,
                    )}`}
                  >
                    {formatStatus(booking.status)}
                  </span>
                </td>

                <td className="py-5">
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/bookings/${booking._id}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#06142A] px-4 text-xs font-black text-white transition hover:bg-[#FF6B00]"
                    >
                      <Eye size={15} />
                      Details
                    </Link>

                    <BookingActions
                      booking={booking}
                      updatingId={updatingId}
                      onConfirm={() => runAction(booking._id, "confirm")}
                      onActivate={() => runAction(booking._id, "activate")}
                      onComplete={() => runAction(booking._id, "complete")}
                      onShowCancel={() => setCancelBookingId(booking._id)}
                    />
                  </div>

                  {cancelBookingId === booking._id && (
                    <div className="mt-3 w-[280px] rounded-xl border border-red-100 bg-red-50 p-3">
                      <CancelBox
                        cancelReason={cancelReason}
                        setCancelReason={setCancelReason}
                        onCancel={() => {
                          setCancelBookingId(null);
                          setCancelReason("");
                        }}
                        onConfirm={() => handleCancel(booking._id)}
                        isUpdating={updatingId === booking._id}
                      />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BookingActions({
  booking,
  updatingId,
  onConfirm,
  onActivate,
  onComplete,
  onShowCancel,
}: {
  booking: BookingWithCar;
  updatingId: Id<"bookings"> | null;
  onConfirm: () => void;
  onActivate: () => void;
  onComplete: () => void;
  onShowCancel: () => void;
}) {
  const isUpdating = updatingId === booking._id;

  return (
    <>
      {booking.status === "pending" && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={onConfirm}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1E6FD9] px-4 text-xs font-black text-white transition hover:bg-blue-700 disabled:bg-slate-300"
        >
          <CheckCircle2 size={15} />
          Confirm
        </button>
      )}

      {booking.status === "confirmed" && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={onActivate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 text-xs font-black text-white transition hover:bg-green-700 disabled:bg-slate-300"
        >
          <Car size={15} />
          Activate
        </button>
      )}

      {(booking.status === "confirmed" || booking.status === "active") && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={onComplete}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-black text-[#06142A] transition hover:bg-slate-50 disabled:bg-slate-100"
        >
          <CheckCircle2 size={15} />
          Complete
        </button>
      )}

      {(booking.status === "pending" ||
        booking.status === "confirmed" ||
        booking.status === "active") && (
        <button
          type="button"
          disabled={isUpdating}
          onClick={onShowCancel}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-xs font-black text-red-700 transition hover:bg-red-100 disabled:bg-slate-100"
        >
          <XCircle size={15} />
          Cancel
        </button>
      )}
    </>
  );
}

function CancelBox({
  cancelReason,
  setCancelReason,
  onCancel,
  onConfirm,
  isUpdating,
}: {
  cancelReason: string;
  setCancelReason: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
  isUpdating: boolean;
}) {
  return (
    <div className="mt-3">
      <textarea
        value={cancelReason}
        onChange={(event) => setCancelReason(event.target.value)}
        rows={3}
        placeholder="Cancellation reason..."
        className="w-full resize-none rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-slate-950 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-100"
      />

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700"
        >
          Close
        </button>

        <button
          type="button"
          disabled={isUpdating}
          onClick={onConfirm}
          className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300"
        >
          {isUpdating ? "Saving..." : "Cancel"}
        </button>
      </div>
    </div>
  );
}
