import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://movaracarhire.com";
  const pages = ["", "/cars", "/services", "/contact", "/privacy", "/travel/car-hire-nairobi", "/travel/airport-car-hire-kenya", "/travel/safari-car-hire-kenya", "/travel/mombasa-car-hire", "/travel/kenya-road-trip-car-hire"];
  return pages.map(path => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" || path === "/cars" ? "daily" : "monthly", priority: path === "" ? 1 : path === "/cars" ? 0.9 : 0.6 }));
}
