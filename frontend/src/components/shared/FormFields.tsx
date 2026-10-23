"use client";
export const inputStyle = "mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900";
export const buttonStyle = "rounded-xl bg-orange-600 px-5 py-2.5 font-bold text-white disabled:opacity-50";
export function Field({ label, value, onChange, type = "text", required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; required?: boolean }) {
  return <label className="block text-sm font-semibold">{label}<input className={inputStyle} value={value} type={type} required={required} onChange={event => onChange(event.target.value)} /></label>;
}
export function Message({ message }: { message: string }) { return message ? <p role="status" className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-slate-900">{message}</p> : null; }
