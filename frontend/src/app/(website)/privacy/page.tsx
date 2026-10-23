import { workflow } from "@/lib/workflow";
export const dynamic = "force-dynamic";
export default async function Privacy() {
  const policy = await workflow<{ privacy_notice_version: string; privacy_notice_text: string; retention_days: number | null }>("workflow/public/policy/", { public: true });
  return <main className="mx-auto max-w-3xl space-y-5 px-4 py-12"><h1 className="text-3xl font-bold">Privacy notice</h1>{policy.privacy_notice_text ? <><p>Version {policy.privacy_notice_version}</p><div className="whitespace-pre-wrap leading-7">{policy.privacy_notice_text}</div><p>Document retention period: {policy.retention_days} days, subject to the conditions in this notice.</p></> : <p>The privacy notice is awaiting approval. Customer document submission is not yet open.</p>}</main>;
}
