import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const cars = await fetchQuery(api.vehicles.publicList, {});
    return Response.json(cars, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ detail: "The vehicle catalogue is temporarily unavailable. Please retry shortly or contact Movara." }, { status: 503 });
  }
}
