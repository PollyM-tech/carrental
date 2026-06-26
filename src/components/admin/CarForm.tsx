"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { X } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type CarStatus = "available" | "booked" | "maintenance" | "unavailable";

type CarFormProps = {
  car?: Doc<"cars"> | null;
  onClose: () => void;
};

const statusOptions: { label: string; value: CarStatus }[] = [
  { label: "Available", value: "available" },
  { label: "Booked", value: "booked" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Unavailable", value: "unavailable" },
];

export default function CarForm({ car, onClose }: CarFormProps) {
  const addCar = useMutation(api.cars.addCar);
  const updateCar = useMutation(api.cars.updateCar);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    name: car?.name ?? "",
    brand: car?.brand ?? "",
    model: car?.model ?? "",
    year: car?.year ? String(car.year) : "",
    plateNumber: car?.plateNumber ?? "",
    location: car?.location ?? "Nairobi",
    category: car?.category ?? "SUV",
    pricePerDay: car?.pricePerDay ? String(car.pricePerDay) : "",
    imageUrl: car?.imageUrl ?? "",
    seats: car?.seats ? String(car.seats) : "5",
    transmission: car?.transmission ?? "Automatic",
    fuel: car?.fuel ?? "Petrol",
    status: (car?.status ?? "available") as CarStatus,
    description: car?.description ?? "",
    isFeatured: car?.isFeatured ?? false,
    rating: car?.rating ? String(car.rating) : "",
    reviewCount: car?.reviewCount ? String(car.reviewCount) : "",
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        model: form.model.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        plateNumber: form.plateNumber.trim() || undefined,
        location: form.location.trim() || undefined,
        category: form.category.trim(),
        pricePerDay: Number(form.pricePerDay),
        imageUrl: form.imageUrl.trim() || undefined,
        seats: Number(form.seats),
        transmission: form.transmission.trim(),
        fuel: form.fuel.trim(),
        status: form.status,
        description: form.description.trim(),
        isFeatured: form.isFeatured,
        rating: form.rating ? Number(form.rating) : undefined,
        reviewCount: form.reviewCount ? Number(form.reviewCount) : undefined,
      };

      if (!payload.name || !payload.category || !payload.description) {
        throw new Error("Name, category, and description are required.");
      }

      if (!payload.pricePerDay || payload.pricePerDay <= 0) {
        throw new Error("Price per day must be greater than 0.");
      }

      if (!payload.seats || payload.seats <= 0) {
        throw new Error("Seats must be greater than 0.");
      }

      if (car) {
        await updateCar({
          id: car._id as Id<"cars">,
          ...payload,
        });
      } else {
        await addCar(payload);
      }

      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while saving the car.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-black text-slate-950">
              {car ? "Edit Car" : "Add New Car"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Manage vehicle details, status, and featured visibility.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
              {errorMessage}
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="Car Name"
              value={form.name}
              placeholder="e.g. Mercedes GLC"
              onChange={(value) => setForm({ ...form, name: value })}
            />

            <Input
              label="Category"
              value={form.category}
              placeholder="e.g. SUV, Van, Executive"
              onChange={(value) => setForm({ ...form, category: value })}
            />

            <Input
              label="Brand Optional"
              value={form.brand}
              placeholder="e.g. Mercedes"
              onChange={(value) => setForm({ ...form, brand: value })}
            />

            <Input
              label="Model Optional"
              value={form.model}
              placeholder="e.g. GLC"
              onChange={(value) => setForm({ ...form, model: value })}
            />

            <Input
              label="Year Optional"
              type="number"
              value={form.year}
              placeholder="e.g. 2020"
              onChange={(value) => setForm({ ...form, year: value })}
            />

            <Input
              label="Plate Number Optional"
              value={form.plateNumber}
              placeholder="e.g. KDA 123A"
              onChange={(value) => setForm({ ...form, plateNumber: value })}
            />

            <Input
              label="Location Optional"
              value={form.location}
              placeholder="e.g. Nairobi"
              onChange={(value) => setForm({ ...form, location: value })}
            />

            <Input
              label="Price Per Day"
              type="number"
              value={form.pricePerDay}
              placeholder="e.g. 8000"
              onChange={(value) => setForm({ ...form, pricePerDay: value })}
            />

            <Input
              label="Image URL"
              value={form.imageUrl}
              placeholder="e.g. /lexus.jpeg"
              onChange={(value) => setForm({ ...form, imageUrl: value })}
            />

            <Input
              label="Seats"
              type="number"
              value={form.seats}
              placeholder="e.g. 5"
              onChange={(value) => setForm({ ...form, seats: value })}
            />

            <Input
              label="Transmission"
              value={form.transmission}
              placeholder="e.g. Automatic"
              onChange={(value) => setForm({ ...form, transmission: value })}
            />

            <Input
              label="Fuel"
              value={form.fuel}
              placeholder="e.g. Petrol"
              onChange={(value) => setForm({ ...form, fuel: value })}
            />

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
                Status
              </span>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm({
                    ...form,
                    status: event.target.value as CarStatus,
                  })
                }
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                {statusOptions.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Rating Optional"
              type="number"
              value={form.rating}
              placeholder="e.g. 4.8"
              onChange={(value) => setForm({ ...form, rating: value })}
            />

            <Input
              label="Review Count Optional"
              type="number"
              value={form.reviewCount}
              placeholder="e.g. 23"
              onChange={(value) => setForm({ ...form, reviewCount: value })}
            />
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
              Description
            </span>
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm({ ...form, description: event.target.value })
              }
              rows={4}
              placeholder="Describe the vehicle, comfort, use case, and rental benefits."
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
            />
          </label>

          <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(event) =>
                setForm({ ...form, isFeatured: event.target.checked })
              }
              className="h-4 w-4 accent-orange-600"
            />
            Feature this car on homepage
          </label>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-orange-200 bg-orange-50 px-6 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-orange-600 px-6 py-3 text-sm font-black text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSubmitting ? "Saving..." : car ? "Update Car" : "Add Car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
      />
    </label>
  );
}
