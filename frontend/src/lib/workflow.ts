export const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1").replace(/\/$/, "");
export async function workflow<T>(path: string, options: { method?: string; data?: unknown; staff?: boolean; public?: boolean } = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(options.staff ? "movara_admin_token" : "movara_customer_token") : null;
  const form = options.data instanceof FormData;
  let response: Response;
  try {
    response = await fetch(`${apiBase}/${path}`, {
      method: options.method ?? "GET", cache: "no-store",
      headers: { ...(!form ? { "Content-Type": "application/json" } : {}), ...(!options.public && token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(options.data ? { body: form ? options.data as FormData : JSON.stringify(options.data) } : {}),
    });
  } catch {
    throw new Error("Unable to reach Movara. Check your connection and try again.");
  }
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : JSON.stringify(result));
  return result as T;
}
export type PublicCar = { _id: string; name: string; category: string; pricePerDay: number; displayImageUrl: string | null; seats: number; transmission: string; fuel: string; brand: string; model: string; location: string; description: string; isFeatured: boolean };
