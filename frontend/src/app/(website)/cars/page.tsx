import CarsCatalogue from "./CarsCatalogue";
import { initialCatalogue } from "@/lib/server-catalogue";
import { pageMetadata } from "@/lib/seo";
export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Self-Drive Cars for Hire in Nairobi", "Browse Movara’s real fleet, compare daily rates and request a self-drive rental in Nairobi. Availability and final terms are confirmed by our team.", "/cars");
export default async function CarsPage() { return <CarsCatalogue initialCars={await initialCatalogue()} />; }
