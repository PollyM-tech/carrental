"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { X, ImagePlus } from "lucide-react";

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

function getAdminToken() {
  const token = localStorage.getItem("mobri_admin_token");

  if (!token) {
    throw new Error("Admin session missing. Please log in again.");
  }

  return token;
}

export default function CarForm({ car, onClose }: CarFormProps) {
  const addCar = useMutation(api.cars.addCar);
  const updateCar = useMutation(api.cars.updateCar);
  const generateUploadUrl = useMutation(api.cars.generateUploadUrl);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

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

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be smaller than 5MB.");
      return;
    }

    setSelectedImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setErrorMessage("");
  }

  async function uploadSelectedImage(adminToken: string) {
    if (!selectedImageFile) {
      return car?.imageStorageId ?? undefined;
    }

    const uploadUrl = await generateUploadUrl({ adminToken });

    const uploadResult = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": selectedImageFile.type,
      },
      body: selectedImageFile,
    });

    if (!uploadResult.ok) {
      throw new Error("Image upload failed. Please try again.");
    }

    const { storageId } = (await uploadResult.json()) as {
      storageId: Id<"_storage">;
    };

    return storageId;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const adminToken = getAdminToken();
      const imageStorageId = await uploadSelectedImage(adminToken);

      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        model: form.model.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        plateNumber: form.plateNumber.trim() || undefined,
        location: form.location.trim() || undefined,
        category: form.category.trim(),
        pricePerDay: Number(form.pricePerDay),
        imageStorageId,
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

      if (payload.year && payload.year < 1980) {
        throw new Error("Please enter a valid vehicle year.");
      }

      if (payload.rating && (payload.rating < 0 || payload.rating > 5)) {
        throw new Error("Rating must be between 0 and 5.");
      }

      if (car) {
        await updateCar({
          adminToken,
          id: car._id,
          ...payload,
        });
      } else {
        await addCar({
          adminToken,
          ...payload,
        });
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

  const existingImagePreview = imagePreviewUrl || form.imageUrl || null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-8">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div>
            <h2 className="text-lg font-black text-slate-950 sm:text-xl">
              {car ? "Edit Car" : "Add New Car"}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload a car photo and manage vehicle details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition hover:bg-orange-100"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(100vh-130px)] overflow-y-auto p-4 sm:p-6"
        >
          {errorMessage && (
            <div className="mb-5 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
              {errorMessage}
            </div>
          )}

          <div className="mb-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-700">
              Car Image
            </p>

            <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-center">
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
                {existingImagePreview ? (
                  <img
                    src={existingImagePreview}
                    alt="Selected car preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <ImagePlus className="mx-auto mb-2" size={34} />
                    <p className="text-sm font-bold">No image selected</p>
                  </div>
                )}
              </div>

              <div>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-black text-white transition hover:bg-orange-700">
                  <ImagePlus size={18} />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Upload a clear car photo from the computer. JPG, PNG, or WebP
                  is okay. Maximum size is 5MB.
                </p>

                {selectedImageFile && (
                  <p className="mt-2 text-sm font-bold text-orange-600">
                    Selected: {selectedImageFile.name}
                  </p>
                )}

                <div className="mt-4">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.08em] text-slate-500">
                      Optional Image URL
                    </span>

                    <input
                      type="text"
                      value={form.imageUrl}
                      placeholder="Optional fallback, e.g. /lexus.jpeg"
                      onChange={(event) =>
                        setForm({ ...form, imageUrl: event.target.value })
                      }
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

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

          <label className="mt-5 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700 sm:w-fit">
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

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
              {isSubmitting
                ? selectedImageFile
                  ? "Uploading..."
                  : "Saving..."
                : car
                  ? "Update Car"
                  : "Add Car"}
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
