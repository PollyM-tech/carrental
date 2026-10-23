"use client";
import { useEffect, useState } from "react";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Message } from "@/components/shared/FormFields";
type Event = { id: string; actor__email: string | null; action: string; entity: string; entity_id: string; reason: string; created_at: string };
export default function Audit() {
  const [events, setEvents] = useState<Event[]>([]); const [message, setMessage] = useState("");
  useEffect(() => { void workflow<Event[]>("workflow/audit/", { staff: true }).then(setEvents).catch(e => setMessage(e.message)); }, []);
  return <Workspace title="Audit history"><Message message={message} /><p>Latest 200 events. Records cannot be edited or deleted.</p><div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead><tr>{["Time (Nairobi)", "Who", "Action", "Record", "Reason"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{events.map(e => <tr key={e.id} className="border-t"><td className="p-3">{new Date(e.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}</td><td className="p-3">{e.actor__email ?? "System"}</td><td className="p-3">{e.action}</td><td className="max-w-xs break-all p-3">{e.entity}: {e.entity_id}</td><td className="p-3">{e.reason}</td></tr>)}</tbody></table></div></Workspace>;
}
