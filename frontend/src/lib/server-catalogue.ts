import "server-only";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import { catalogueCar } from "./catalogue";
export async function initialCatalogue() {
  try { return (await fetchQuery(api.vehicles.publicList, {})).map(catalogueCar); }
  catch { return undefined; }
}
