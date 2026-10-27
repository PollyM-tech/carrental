"use client";
import { useEffect, useRef, useState } from "react";
import VehiclePhotoPicker from "./VehiclePhotoPicker";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { Field, Message, buttonStyle, inputStyle } from "@/components/shared/FormFields";
import { prepareVehiclePhoto } from "@/lib/vehicle-photo";

type Vehicle = Doc<"movaraVehicles"> & { displayImageUrl?: string | null };
export default function VehicleForm({ vehicle, onClose, onSaved }: { vehicle?: Vehicle; onClose: () => void; onSaved: () => void }) {
  const save = useMutation(api.vehicles.save); const upload = useAction(api.vehicles.uploadPhoto);
  const [form, setForm] = useState({ name: vehicle?.name ?? "", category: vehicle?.category ?? "SUV", brand: vehicle?.brand ?? "", model: vehicle?.model ?? "", year: vehicle?.year ? String(vehicle.year) : "", registration: vehicle?.registration ?? "", pricePerDay: vehicle ? String(vehicle.pricePerDay) : "", seats: String(vehicle?.seats ?? 5), transmission: vehicle?.transmission ?? "Automatic", fuel: vehicle?.fuel ?? "Petrol", mileage: String(vehicle?.mileage ?? 0), location: vehicle?.location ?? "Nairobi", description: vehicle?.description ?? "", status: vehicle?.status ?? "available", published: vehicle?.published ?? false, isFeatured: vehicle?.isFeatured ?? false, insuranceExpiresOn: vehicle?.insuranceExpiresOn ?? "", inspectionExpiresOn: vehicle?.inspectionExpiresOn ?? "" });
  const [photo, setPhoto] = useState<Blob | null>(null); const [preview, setPreview] = useState<string | null>(null); const [removePhoto, setRemovePhoto] = useState(false);
  const uploaded = useRef<Id<"movaraVehiclePhotos"> | undefined>(undefined);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const textFields = [["name", "Vehicle display name", "text"], ["category", "Category", "text"], ["brand", "Brand", "text"], ["model", "Model", "text"], ["registration", "Registration (staff only)", "text"], ["pricePerDay", "Daily rate (whole KES)", "number"], ["seats", "Seats", "number"], ["mileage", "Mileage (km)", "number"], ["location", "Location", "text"]] as const;
  return <form className="space-y-5 rounded-2xl border border-orange-200 bg-white p-6" onSubmit={async event => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (photo && !uploaded.current) uploaded.current = await upload({ bytes: await photo.arrayBuffer(), contentType: photo.type });
      await save({ id: vehicle?._id, ...form, pricePerDay: Number(form.pricePerDay), seats: Number(form.seats), mileage: Number(form.mileage), year: form.year ? Number(form.year) : undefined, insuranceExpiresOn: form.insuranceExpiresOn || undefined, inspectionExpiresOn: form.inspectionExpiresOn || undefined, photoId: uploaded.current ?? (removePhoto ? null : undefined) });
      onSaved();
    } catch(e) { const raw = e instanceof Error ? e.message : "Unable to save this vehicle."; setMessage(raw.match(/Uncaught Error: ([^\n]+)/)?.[1] ?? raw); }
    finally { setBusy(false); }
  }}><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">{vehicle ? "Edit vehicle" : "Add a vehicle"}</h2><button type="button" className="underline" disabled={busy} onClick={onClose}>Close</button></div><p className="text-sm text-slate-600">Complete the vehicle details, add a cover photo from your device, then save as a draft or publish when ready.</p><Message message={message} />
    <fieldset disabled={busy} className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-bold text-[#0B1C4D]">1. Vehicle details and daily rate</legend><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{textFields.map(([key, label, type]) => <Field key={key} required label={label} type={type} value={form[key]} onChange={value => setForm({ ...form, [key]: value })} />)}<Field label="Model year (optional)" type="number" value={form.year} onChange={year => setForm({ ...form, year })} />
      <label className="block text-sm font-semibold">Transmission<select className={inputStyle} value={form.transmission} onChange={e => setForm({ ...form, transmission: e.target.value })}><option>Automatic</option><option>Manual</option></select></label>
      <label className="block text-sm font-semibold">Fuel<select className={inputStyle} value={form.fuel} onChange={e => setForm({ ...form, fuel: e.target.value })}>{["Petrol","Diesel","Hybrid","Electric","Other"].map(value => <option key={value}>{value}</option>)}</select></label>
      <label className="block text-sm font-semibold">General availability<select className={inputStyle} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as typeof form.status })}><option value="available">Available</option><option value="maintenance">Maintenance</option><option value="unavailable">Unavailable</option></select></label>
    </div></fieldset><fieldset disabled={busy} className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-bold text-[#0B1C4D]">2. Compliance dates</legend><div className="grid gap-4 sm:grid-cols-2">
      <Field label="Insurance expires on" type="date" value={form.insuranceExpiresOn} onChange={insuranceExpiresOn => setForm({ ...form, insuranceExpiresOn })} /><Field label="Inspection expires on" type="date" value={form.inspectionExpiresOn} onChange={inspectionExpiresOn => setForm({ ...form, inspectionExpiresOn })} />
    </div></fieldset>
    <label className="block text-sm font-semibold">Description<textarea disabled={busy} rows={3} maxLength={2000} className={inputStyle} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
    <fieldset className="space-y-4 rounded-xl border p-4" disabled={busy}><legend className="px-2 font-bold text-[#0B1C4D]">3. Gallery photo</legend><VehiclePhotoPicker src={preview || (!removePhoto && vehicle?.displayImageUrl) || null} hasPhoto={!!photo || (!!vehicle?.photoId && !removePhoto)} disabled={busy} onChoose={async file => {
      setBusy(true); setMessage("");
      try { const prepared = await prepareVehiclePhoto(file); setPhoto(prepared); setPreview(URL.createObjectURL(prepared)); setRemovePhoto(false); uploaded.current = undefined; return true; }
      catch(error) { setMessage(error instanceof Error ? error.message : "Unable to process this photo."); return false; }
      finally { setBusy(false); }
    }} onRemove={() => { setPhoto(null); setPreview(null); setRemovePhoto(true); uploaded.current = undefined; }} /></fieldset>
    <fieldset disabled={busy} className="space-y-4 rounded-xl border p-4"><legend className="px-2 font-bold text-[#0B1C4D]">4. Publication</legend><div className="flex flex-wrap gap-5"><label className="flex gap-2"><input type="checkbox" checked={form.published} onChange={e => setForm({ ...form, published: e.target.checked })} />Publish in the customer catalogue</label><label className="flex gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />Feature on the homepage</label></div><p className="text-sm text-slate-600">Publishing requires current insurance and inspection dates. Maintenance/unavailable cars stay hidden. Use dated maintenance blocks for temporary restrictions.</p></fieldset><button disabled={busy} className={buttonStyle}>{busy ? "Saving…" : "Save vehicle"}</button>
  </form>;
}
