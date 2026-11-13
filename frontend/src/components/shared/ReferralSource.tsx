import { referralSources } from "../../../convex/lib/referral";
export default function ReferralSource({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <label className="block text-sm font-semibold text-slate-700">Where did you hear about us?<select value={value} onChange={event => onChange(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3"><option value="">Select an option (optional)</option>{referralSources.map(source => <option key={source} value={source}>{source}</option>)}</select></label>;
}
