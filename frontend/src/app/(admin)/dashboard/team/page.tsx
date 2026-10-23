"use client";
import { useEffect, useState } from "react";
import Workspace from "@/components/admin/Workspace";
import { workflow } from "@/lib/workflow";
import { Field, Message, buttonStyle } from "@/components/shared/FormFields";
type Staff = { id: string; email: string; roles: string[]; owner: boolean; active: boolean };
const roles = ["kyc_reviewer", "front_desk", "finance", "fleet_manager", "admin"];
export default function Team() {
  const [staff, setStaff] = useState<Staff[]>([]); const [userId, setUserId] = useState(""); const [selected, setSelected] = useState<string[]>([]); const [message, setMessage] = useState("");
  async function load() { setStaff(await workflow<Staff[]>("workflow/staff/", { staff: true })); }
  useEffect(() => { void workflow<Staff[]>("workflow/staff/", { staff: true }).then(setStaff).catch(e => setMessage(e.message)); }, []);
  return <Workspace title="Staff access"><Message message={message} /><p>Create an account first, then assign roles here. Every staff member enrolls an authenticator at first sign-in.</p><section className="space-y-4 rounded-2xl border bg-white p-6"><Field label="Account email or UUID" value={userId} onChange={setUserId} /><div className="flex flex-wrap gap-4">{roles.map(role => <label className="flex gap-2" key={role}><input type="checkbox" checked={selected.includes(role)} onChange={e => setSelected(e.target.checked ? [...selected, role] : selected.filter(r => r !== role))} />{role.replaceAll("_", " ")}</label>)}</div><button className={buttonStyle} onClick={() => { void workflow("workflow/staff/", { staff: true, method: "POST", data: { ...(userId.includes("@") ? { email: userId } : { user_id: userId }), roles: selected } }).then(async () => { await load(); setMessage("Roles saved."); }).catch(e => setMessage(e.message)); }}>Save roles</button></section>{staff.map(u => <button key={u.id} className="block w-full rounded-xl border bg-white p-4 text-left" onClick={() => { setUserId(u.id); setSelected(u.roles); }}><strong>{u.email}</strong><p className="text-sm">{u.owner ? "Owner" : u.roles.join(", ")} · {u.active ? "Active" : "Inactive"}</p><p className="break-all text-xs">{u.id}</p></button>)}</Workspace>;
}
