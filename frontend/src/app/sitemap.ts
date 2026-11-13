import { services } from "@/data/services";
import { initialCatalogue } from "@/lib/server-catalogue";
import type { MetadataRoute } from "next";

export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://www.movaracarhire.com";
  const pages = ["", "/cars", "/services", "/contact", "/privacy", "/rental-terms", "/travel/car-hire-nairobi", "/travel/airport-car-hire-kenya", "/travel/safari-car-hire-kenya", "/travel/mombasa-car-hire", "/travel/kenya-road-trip-car-hire"];
  const cars = await initialCatalogue();
  pages.push(...services.map(service => `/services/${service.slug}`), ...(cars ?? []).map(car => `/cars/${encodeURIComponent(car.id)}`));
  return pages.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" || path === "/cars" ? "daily" : "monthly", priority: path === "" ? 1 : path === "/cars" ? 0.9 : 0.6 }));
}
