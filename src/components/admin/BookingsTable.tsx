"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Phone,
  PlayCircle,
  RotateCcw,
  XCircle,
} from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type BookingStatus =
  | "pending"
  | "confirmed"
  | "active"
  | "completed"
  | "cancelled";

type BookingWithCar = Doc<"bookings"> & {
  carImageUrl?: string | null;
};

type BookingsTableProps = {
  bookings: BookingWithCar[];
};

const statusClassName: Record<BookingStatus, string> = {
  pending: "bg-orange-50 text-orange-700 border-orange-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  active: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function getAdminToken() {
  const token = localStorage.getItem("mobri_admin_token");

  if (!token) {
    throw new Error("Admin session missing. Please log in again.");
  }

  return token;
}

function formatStatus(status: BookingStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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

export default function BookingsTable({ bookings }: BookingsTableProps) {
  const confirmBooking = useMutation(api.bookings.confirm);
  const activateBooking = useMutation(api.bookings.activate);
  const completeBooking = useMutation(api.bookings.complete);
  const cancelBooking = useMutation(api.bookings.cancel);

  const [actionError, setActionError] = useState("");

  async function handleConfirm(booking: BookingWithCar) {
    setActionError("");

    try {
      await confirmBooking({
        adminToken: getAdminToken(),
        bookingId: booking._id,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not confirm booking.",
      );
    }
  }

  async function handleActivate(booking: BookingWithCar) {
    setActionError("");

    try {
      await activateBooking({
        adminToken: getAdminToken(),
        bookingId: booking._id,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not activate booking.",
      );
    }
  }

  async function handleComplete(booking: BookingWithCar) {
    setActionError("");

    try {
      await completeBooking({
        adminToken: getAdminToken(),
        bookingId: booking._id,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not complete booking.",
      );
    }
  }

  async function handleCancel(booking: BookingWithCar) {
    setActionError("");

    const cancelReason = window.prompt(
      `Why are you cancelling ${booking.customerName}'s booking?`,
      "Cancelled by admin",
    );

    if (!cancelReason) return;

    try {
      await cancelBooking({
        adminToken: getAdminToken(),
        bookingId: booking._id,
        cancelReason,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Could not cancel booking.",
      );
    }
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <CalendarCheck size={26} />
        </div>

        <h3 className="mt-4 text-xl font-black text-slate-950">
          No bookings yet
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Customer bookings will appear here once they submit the booking form.
        </p>
      </div>
    );
  }

  return (
    <div>
      {actionError && (
        <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
          {actionError}
        </div>
      )}

      {/* Mobile/tablet cards */}
      <div className="grid gap-4 xl:hidden">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  {booking.customerName}
                </h3>

                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {booking.carName || "Car not selected"}
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-black ${
                  statusClassName[booking.status as BookingStatus]
                }`}
              >
                {formatStatus(booking.status as BookingStatus)}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <InfoCard
                label="Phone"
                value={booking.customerPhone || "Not set"}
              />
              <InfoCard
                label="Email"
                value={booking.customerEmail || "Not set"}
              />
              <InfoCard
                label="Pickup"
                value={`${formatDate(booking.pickupDate)} · ${
                  booking.pickupLocation || "Location not set"
                }`}
              />
              <InfoCard
                label="Return"
                value={`${formatDate(booking.returnDate)} · ${
                  booking.returnLocation || "Location not set"
                }`}
              />
              <InfoCard
                label="Total Days"
                value={
                  booking.totalDays
                    ? `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""}`
                    : "Not calculated"
                }
              />
              <InfoCard
                label="Total Amount"
                value={
                  booking.totalAmount
                    ? `KSh ${booking.totalAmount.toLocaleString()}`
                    : "Not calculated"
                }
              />
            </div>

            {booking.message && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
                  Message
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {booking.message}
                </p>
              </div>
            )}

            <BookingActions
              booking={booking}
              onConfirm={handleConfirm}
              onActivate={handleActivate}
              onComplete={handleComplete}
              onCancel={handleCancel}
            />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Car</th>
                <th className="px-5 py-4">Dates</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => (
                <tr key={booking._id} className="align-top">
                  <td className="px-5 py-4">
                    <p className="font-black text-slate-950">
                      {booking.customerName}
                    </p>

                    <div className="mt-2 space-y-1 text-xs font-semibold text-slate-500">
                      <p>{booking.customerPhone || "Phone not set"}</p>
                      <p>{booking.customerEmail || "Email not set"}</p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <p className="text-sm font-black text-slate-950">
                      {booking.carName || "Car not selected"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {booking.totalDays
                        ? `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""}`
                        : "Days not calculated"}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-xs font-semibold leading-6 text-slate-600">
                      <p>
                        <span className="font-black text-slate-950">
                          Pickup:
                        </span>{" "}
                        {formatDate(booking.pickupDate)}
                      </p>
                      <p>
                        <span className="font-black text-slate-950">
                          Return:
                        </span>{" "}
                        {formatDate(booking.returnDate)}
                      </p>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-xs font-semibold leading-6 text-slate-600">
                      <p>{booking.pickupLocation || "Pickup not set"}</p>
                      <p>{booking.returnLocation || "Return not set"}</p>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm font-black text-slate-950">
                    {booking.totalAmount
                      ? `KSh ${booking.totalAmount.toLocaleString()}`
                      : "Not calculated"}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        statusClassName[booking.status as BookingStatus]
                      }`}
                    >
                      {formatStatus(booking.status as BookingStatus)}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <BookingActions
                      booking={booking}
                      onConfirm={handleConfirm}
                      onActivate={handleActivate}
                      onComplete={handleComplete}
                      onCancel={handleCancel}
                      desktop
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function BookingActions({
  booking,
  onConfirm,
  onActivate,
  onComplete,
  onCancel,
  desktop = false,
}: {
  booking: BookingWithCar;
  onConfirm: (booking: BookingWithCar) => void;
  onActivate: (booking: BookingWithCar) => void;
  onComplete: (booking: BookingWithCar) => void;
  onCancel: (booking: BookingWithCar) => void;
  desktop?: boolean;
}) {
  const status = booking.status as BookingStatus;

  return (
    <div
      className={`mt-5 grid gap-2 ${
        desktop ? "mt-0 justify-end" : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {status === "pending" && (
        <button
          type="button"
          onClick={() => onConfirm(booking)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-3 py-3 text-xs font-black text-white transition hover:bg-orange-700"
        >
          <CheckCircle size={16} />
          Confirm
        </button>
      )}

      {status === "confirmed" && (
        <button
          type="button"
          onClick={() => onActivate(booking)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-3 py-3 text-xs font-black text-white transition hover:bg-green-700"
        >
          <PlayCircle size={16} />
          Active
        </button>
      )}

      {(status === "confirmed" || status === "active") && (
        <button
          type="button"
          onClick={() => onComplete(booking)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-3 text-xs font-black text-white transition hover:bg-slate-800"
        >
          <Clock size={16} />
          Complete
        </button>
      )}

      {status !== "completed" && status !== "cancelled" && (
        <button
          type="button"
          onClick={() => onCancel(booking)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 py-3 text-xs font-black text-orange-700 transition hover:bg-orange-100"
        >
          <XCircle size={16} />
          Cancel
        </button>
      )}

      {booking.customerPhone && (
        <a
          href={`tel:${booking.customerPhone}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-black text-slate-700 transition hover:bg-slate-100"
        >
          <Phone size={16} />
          Call
        </a>
      )}

      {(status === "completed" || status === "cancelled") && (
        <span className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-3 text-xs font-black text-slate-400">
          <RotateCcw size={16} />
          Closed
        </span>
      )}
    </div>
  );
}
