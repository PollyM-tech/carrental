"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Upload } from "lucide-react";

export default function VehiclePhotoPicker({ src, hasPhoto, disabled, onChoose, onRemove }: {
  src: string | null; hasPhoto: boolean; disabled: boolean;
  onChoose: (file: File) => Promise<boolean>; onRemove: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [filename, setFilename] = useState("");
  async function choose(file?: File) {
    if (!file || disabled) return;
    const accepted = await onChoose(file);
    // Clear the native input so selecting the same file again also works.
    if (input.current) input.current.value = "";
    if (accepted) setFilename(file.name);
  }
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,280px)_1fr]">
    <div className="overflow-hidden rounded-xl border bg-slate-50"><div className="relative aspect-[4/3]">{src ? <Image src={src} alt="Selected vehicle cover photo" fill unoptimized={src.startsWith("blob:")} sizes="280px" className="object-contain" /> : <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400"><ImagePlus size={36} /><span className="text-sm">Vehicle cover preview</span></div>}</div><p className="border-t bg-white px-3 py-2 text-xs text-slate-500">Displayed in a consistent 4:3 gallery frame</p></div>
    <div className="space-y-3"><div className={`rounded-xl border-2 border-dashed p-5 ${dragging ? "border-orange-500 bg-orange-50" : "border-slate-300 bg-slate-50"}`} onDragOver={event => { event.preventDefault(); if (!disabled) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={event => { event.preventDefault(); setDragging(false); void choose(event.dataTransfer.files[0]); }}>
      <Upload size={24} className="mb-3 text-orange-600" /><h3 className="font-semibold">Upload a car photo</h3><p className="mt-1 text-sm text-slate-600">Choose a photo from your device’s Gallery, Photos or Documents, or drop an image here.</p>
      <input ref={input} aria-label="Choose vehicle cover photo" type="file" accept="image/jpeg,image/png,image/webp" disabled={disabled} className="sr-only" onChange={event => void choose(event.target.files?.[0])} />
      <button type="button" disabled={disabled} onClick={() => input.current?.click()} className="mt-4 rounded-lg bg-[#0B1C4D] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{disabled ? "Please wait…" : "Choose from device"}</button>
      {filename && hasPhoto && <p className="mt-2 break-all text-xs text-slate-600">Selected: {filename}</p>}
    </div><p className="text-xs leading-5 text-slate-500">Accepted formats: JPG/JPEG, PNG and WebP, up to 5MB. A landscape photo works best. Images are resized and compressed automatically. Upload a vehicle photo only; keep ID, licence and insurance documents out of the public gallery.</p>
    {hasPhoto && <button type="button" disabled={disabled} className="text-sm font-semibold text-red-700 underline" onClick={() => { onRemove(); setFilename(""); }}>Remove cover photo</button>}</div>
  </div>;
}
