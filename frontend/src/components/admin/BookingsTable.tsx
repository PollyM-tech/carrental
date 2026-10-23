"use client";
import Link from "next/link";
import type { Doc } from "@/lib/types";
export default function BookingsTable({ bookings }: { bookings: (Doc<"bookings"> & { carImageUrl?: string | null })[] }) {
  return <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead><tr>{["Customer", "Vehicle", "Dates", "Status", "Amount", "Details"].map(h => <th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{bookings.map(b => <tr key={b._id} className="border-t"><td className="p-4"><strong>{b.customerName}</strong><p>{b.customerPhone}</p></td><td className="p-4">{b.carName}</td><td className="p-4">{b.pickupDate} → {b.returnDate}</td><td className="p-4">{b.status.replaceAll("_", " ")}</td><td className="p-4">{b.totalAmount === undefined ? "Pending" : `KSh ${b.totalAmount.toLocaleString()}`}</td><td className="p-4"><Link className="font-bold text-orange-700 underline" href={`/dashboard/bookings/${b._id}`}>View</Link></td></tr>)}</tbody></table>{!bookings.length && <p className="p-6 text-center">No matching bookings.</p>}</div>;
}
