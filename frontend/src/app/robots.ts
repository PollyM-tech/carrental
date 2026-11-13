import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard/", "/workspace", "/sign-in", "/movara-access", "/api/"] }], sitemap: "https://www.movaracarhire.com/sitemap.xml" };
}
