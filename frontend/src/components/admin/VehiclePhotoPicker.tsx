"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload } from "lucide-react";

type Photo = { key: string; src: string; name: string };
export default function VehiclePhotoPicker({ photos, disabled, onChoose, onRemove, onCover }: {
  photos: Photo[]; disabled: boolean;
  onChoose: (files: File[]) => Promise<void>; onRemove: (key: string) => void; onCover: (key: string) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  async function choose(files: File[]) {
    if (!files.length || disabled) return;
    await onChoose(files);
    if (input.current) input.current.value = "";
  }
  return <div className="space-y-4">
    <div className={`rounded-xl border-2 border-dashed p-5 ${dragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50"}`} onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void choose(Array.from(event.dataTransfer.files)); }}>
      <Upload size={24} className="mb-3 text-orange-600" /><h3 className="font-semibold">Upload vehicle photos</h3><p className="mt-1 text-sm text-slate-600">Choose multiple photos from Gallery, Photos or Documents, or drop them here. Add up to 12 photos per vehicle.</p>
      <input ref={input} aria-label="Choose vehicle gallery photos" type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={disabled} className="sr-only" onChange={event => void choose(Array.from(event.target.files ?? []))} />
      <button type="button" disabled={disabled || photos.length >= 12} onClick={() => input.current?.click()} className="mt-4 rounded-lg bg-[#0B1C4D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{disabled ? "Please wait…" : "Choose photos from device"}</button>
    </div>
    <p className="text-xs leading-5 text-slate-500">JPG/JPEG, PNG and WebP, up to 5MB each. Photos are resized and compressed automatically in a 4:3 gallery frame. Upload vehicle photos only; keep identity, licence and insurance documents out of the public gallery. Changes are applied when you save the vehicle.</p>
    <p className="text-sm font-semibold">{photos.length} / 12 photos · The first photo is the cover.</p>
    {photos.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{photos.map((photo, index) => <div key={photo.key} className="overflow-hidden rounded-xl border bg-white"><div className="relative aspect-[4/3] bg-slate-50"><Image src={photo.src} alt={`Vehicle ${index === 0 ? "cover" : `photo ${index + 1}`}`} fill unoptimized={photo.src.startsWith("blob:")} sizes="280px" className="object-contain" /></div><div className="space-y-2 p-3"><p className="truncate text-xs text-slate-600" title={photo.name}>{photo.name}</p>{index === 0 ? <p className="text-sm font-bold text-orange-700">Cover photo</p> : <button type="button" disabled={disabled} onClick={() => onCover(photo.key)} className="text-sm font-semibold underline">Make cover</button>}<button type="button" disabled={disabled} onClick={() => onRemove(photo.key)} className="block text-sm font-semibold text-red-700 underline">Remove photo</button></div></div>)}</div> : <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-5 text-slate-500"><ImagePlus />No vehicle photos added yet.</div>}
  </div>;
}
