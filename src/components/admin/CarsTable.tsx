"use client";

import Image from "next/image";
import { useMutation } from "convex/react";
import { Edit, Star, Trash2, Wrench } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc } from "../../../convex/_generated/dataModel";

type CarWithDisplayImage = Doc<"cars"> & {
  displayImageUrl?: string | null;
};

type CarStatus = "available" | "booked" | "maintenance" | "unavailable";

type CarsTableProps = {
  cars: CarWithDisplayImage[];
  onEdit: (car: CarWithDisplayImage) => void;
};

const statusOptions: { label: string; value: CarStatus }[] = [
  { label: "Available", value: "available" },
  { label: "Booked", value: "booked" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Unavailable", value: "unavailable" },
];

const statusClassName: Record<CarStatus, string> = {
  available: "bg-green-50 text-green-700 border-green-200",
  booked: "bg-blue-50 text-blue-700 border-blue-200",
  maintenance: "bg-orange-50 text-orange-700 border-orange-200",
  unavailable: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function CarsTable({ cars, onEdit }: CarsTableProps) {
  const updateCarStatus = useMutation(api.cars.updateCarStatus);
  const toggleFeatured = useMutation(api.cars.toggleFeatured);
  const deleteCar = useMutation(api.cars.deleteCar);

  async function handleDelete(car: CarWithDisplayImage) {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${car.name}? This will hide it from public pages.`,
    );

    if (!confirmed) return;

    await deleteCar({ id: car._id });
  }

  if (cars.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h3 className="text-xl font-black text-slate-950">No cars yet</h3>
        <p className="mt-2 text-sm text-slate-500">
          Add your first car to start building the public fleet.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-5 py-4">Car</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Price</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Featured</th>
              <th className="px-5 py-4">Details</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {cars.map((car) => (
              <tr key={car._id} className="align-middle">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-24 overflow-hidden rounded-xl bg-slate-100">
                      {car.displayImageUrl ? (
                        <Image
                          src={car.displayImageUrl}
                          alt={car.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                          No image
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="font-black text-slate-950">{car.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {car.brand || "Brand not set"} {car.model || ""}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm font-bold text-slate-700">
                  {car.category}
                </td>

                <td className="px-5 py-4 text-sm font-black text-slate-950">
                  KSh {car.pricePerDay.toLocaleString()}/day
                </td>

                <td className="px-5 py-4">
                  <select
                    value={car.status as CarStatus}
                    onChange={(event) =>
                      updateCarStatus({
                        id: car._id,
                        status: event.target.value as CarStatus,
                      })
                    }
                    className={`rounded-xl border px-3 py-2 text-xs font-black outline-none ${statusClassName[car.status as CarStatus]}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() =>
                      toggleFeatured({
                        id: car._id,
                        isFeatured: !car.isFeatured,
                      })
                    }
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                      car.isFeatured
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : "border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                    }`}
                  >
                    <Star
                      size={14}
                      className={car.isFeatured ? "fill-white" : ""}
                    />
                    {car.isFeatured ? "Featured" : "Not Featured"}
                  </button>
                </td>

                <td className="px-5 py-4">
                  <div className="text-xs font-semibold text-slate-500">
                    <p>{car.seats} seats</p>
                    <p>{car.transmission}</p>
                    <p>{car.fuel}</p>
                  </div>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateCarStatus({
                          id: car._id,
                          status: "maintenance",
                        })
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100"
                      title="Mark maintenance"
                    >
                      <Wrench size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onEdit(car)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white transition hover:bg-orange-700"
                      title="Edit car"
                    >
                      <Edit size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(car)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-200 bg-orange-50 text-orange-700 transition hover:bg-orange-100"
                      title="Delete car"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
