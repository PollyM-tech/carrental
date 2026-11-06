"use client";
import VehiclePhotoViewer from "./VehiclePhotoViewer";
import Image from "next/image";
import { useState } from "react";

export default function VehicleGallery({ images, name }: { images: string[]; name: string }) {
  const [selected, setSelected] = useState(0);
  const index = Math.min(selected, Math.max(0, images.length - 1));
  const src = images[index] ?? "/logo.png";
  return <section aria-label={`${name} photo gallery`} className="space-y-3">
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100"><VehiclePhotoViewer images={images} name={name} initialIndex={index}><Image src={src} alt={`${name}, photo ${index + 1}`} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain" /></VehiclePhotoViewer>{images.length > 1 && <div className="absolute inset-x-3 bottom-3 flex items-center justify-between"><button type="button" onClick={() => setSelected((index - 1 + images.length) % images.length)} aria-label="Previous vehicle photo" className="rounded-full bg-white px-4 py-2 font-bold shadow">←</button><span aria-live="polite" className="rounded-full bg-white px-3 py-1 text-sm shadow">{index + 1} / {images.length}</span><button type="button" onClick={() => setSelected((index + 1) % images.length)} aria-label="Next vehicle photo" className="rounded-full bg-white px-4 py-2 font-bold shadow">→</button></div>}</div>
    {images.length > 1 && <div className="flex gap-2 overflow-x-auto pb-2">{images.map((image, number) => <button type="button" key={`${image}-${number}`} onClick={() => setSelected(number)} aria-label={`View ${name} photo ${number + 1}`} aria-pressed={number === index} className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border-2 bg-white ${number === index ? "border-orange-600" : "border-transparent"}`}><Image src={image} alt="" fill sizes="96px" className="object-contain" /></button>)}</div>}
  </section>;
}
