"use client";

import { useCallback, useEffect, useState } from "react";
import type { Booking, BusinessSettings, Car } from "./types";

const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
type Args = Record<string, unknown>;
type Endpoint<T> = { path: string; result?: T };
const endpoint = <T,>(path: string): Endpoint<T> => ({ path });
export const api = {
  admin: { login: endpoint<{ challenge: string; enrollment_required: boolean; secret?: string; uri?: string }>("staff-login"), verify: endpoint<{ token: string }>("staff-verify") },
  cars: {
    listCars: endpoint<Car[]>("cars"), addCar: endpoint<string>("cars/create"),
    updateCar: endpoint<string>("cars/update"), updateCarStatus: endpoint<string>("cars/update"),
    toggleFeatured: endpoint<string>("cars/update"), deleteCar: endpoint<string>("cars/delete"),
  },
  bookings: {
    listAll: endpoint<Booking[]>("bookings"), getById: endpoint<Booking>("bookings/detail"),
    getStats: endpoint<Record<string, number>>("stats"),
    confirm: endpoint<string>("bookings/confirm"), activate: endpoint<string>("bookings/activate"),
    complete: endpoint<string>("bookings/complete"), cancel: endpoint<string>("bookings/cancel"),
  },
  settings: {
    getSettings: endpoint<BusinessSettings | null>("settings"),
    updateSettings: endpoint<string>("settings/update"),
  },
};
async function request<T>(target: Endpoint<T>, args: Args = {}, method = "GET"): Promise<T> {
  const { adminToken, ...data } = args;
  const url = new URL(`${baseUrl}/rentals/${target.path}/`);
  if (method === "GET") {
    Object.entries(data).forEach(([key, value]) => { if (value !== undefined) url.searchParams.set(key, String(value)); });
  }
  const response = await fetch(url, {
    method, headers: { "Content-Type": "application/json", ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}) },
    ...(method === "GET" ? {} : { body: JSON.stringify(data) }),
  });
  const result = await response.json();
  if (!response.ok) {
    if (response.status === 401 && adminToken) {
      localStorage.removeItem("movara_admin_token");
      window.location.assign("/admin-login");
    }
    throw new Error(typeof result.detail === "string" ? result.detail : JSON.stringify(result));
  }
  return result as T;
}
export function useQuery<T>(target: Endpoint<T>, args: Args | "skip" = {}) {
  const key = JSON.stringify(args);
  const [state, setState] = useState<{ key: string; value?: T; error?: Error }>({ key: "" });
  useEffect(() => {
    if (key === '"skip"') return;
    let active = true;
    const load = () => request(target, JSON.parse(key)).then(
      value => { if (active) setState({ key, value }); },
      error => { if (active) setState({ key, error }); },
    );
    void load();
    window.addEventListener("movara-data-changed", load);
    return () => { active = false; window.removeEventListener("movara-data-changed", load); };
  }, [target, key]);
  if (state.key === key && state.error) throw state.error;
  return state.key === key ? state.value : undefined;
}
export function useMutation<T>(target: Endpoint<T>) {
  return useCallback(async (args: Args) => {
    const result = await request(target, args, "POST");
    window.dispatchEvent(new Event("movara-data-changed"));
    return result;
  }, [target]);
}
export async function uploadCarImage(file: File, token: string): Promise<string> {
  const data = new FormData(); data.append("image", file);
  const response = await fetch(`${baseUrl}/rentals/images/`, {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: data,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail ?? "Image upload failed.");
  return result.storageId;
}
