"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

export default function VehiclePhotoViewer({ images, name, initialIndex = 0, children }: { images: string[]; name: string; initialIndex?: number; children: ReactNode }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touchStart = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const photos = images.length ? images : ["/logo.png"];
  const index = Math.min(selected, photos.length - 1);
  function move(direction: number) { setSelected(current => (current + direction + photos.length) % photos.length); }
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [open]);
  return <>
    <button type="button" aria-label={`Open ${name} photo gallery, ${photos.length} ${photos.length === 1 ? "photo" : "photos"}`} className="absolute inset-0 h-full w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-orange-500" onClick={() => { setSelected(Math.min(initialIndex, photos.length - 1)); dialog.current?.showModal(); setOpen(true); }}>
      {children}
      {photos.length > 1 && <span className="absolute bottom-3 right-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-semibold text-white">View {photos.length} photos</span>}
    </button>
    <dialog ref={dialog} aria-label={`${name} photos`} onClose={() => setOpen(false)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }} onKeyDown={event => {
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
    }} className="fixed inset-0 m-auto max-h-[95dvh] w-[min(96vw,1100px)] max-w-none overflow-y-auto rounded-2xl border-0 bg-slate-950 p-0 text-white shadow-2xl backdrop:bg-black/85">
      {open && <div className="p-3 sm:p-5"><div className="mb-3 flex items-center justify-between gap-3"><h2 className="font-semibold">{name}</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold">Close ✕</button></div>
        <div className="relative h-[55dvh] sm:h-[65dvh]" onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }} onTouchEnd={event => { const end = event.changedTouches[0]?.clientX; if (touchStart.current !== null && end !== undefined && Math.abs(end - touchStart.current) > 50) move(end < touchStart.current ? 1 : -1); touchStart.current = null; }}>
          <Image src={photos[index]} alt={`${name}, photo ${index + 1} of ${photos.length}`} fill sizes="(max-width: 1100px) 96vw, 1100px" className="object-contain" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3"><button type="button" disabled={photos.length < 2} aria-label="Previous photo" onClick={() => move(-1)} className="rounded-lg border border-white/40 px-4 py-2 disabled:opacity-30">← Previous</button><p aria-live="polite" className="text-sm">{index + 1} / {photos.length}</p><button type="button" disabled={photos.length < 2} aria-label="Next photo" onClick={() => move(1)} className="rounded-lg border border-white/40 px-4 py-2 disabled:opacity-30">Next →</button></div>
        {photos.length > 1 && <div className="mt-4 flex gap-2 overflow-x-auto pb-2">{photos.map((src, number) => <button type="button" key={`${src}-${number}`} aria-label={`Show photo ${number + 1}`} aria-pressed={index === number} onClick={() => setSelected(number)} className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-lg border-2 ${index === number ? "border-orange-500" : "border-transparent"}`}><Image src={src} alt="" fill sizes="80px" className="object-contain" /></button>)}</div>}
      </div>}
    </dialog>
  </>;
}
