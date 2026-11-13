import type { Metadata } from "next";
export const siteUrl = "https://www.movaracarhire.com";
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, alternates: { canonical: path }, openGraph: { type: "website", siteName: "Movara Car Hire", title, description, url: `${siteUrl}${path}`, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Movara Car Hire — self-drive rentals in Kenya" }] }, twitter: { card: "summary_large_image", title, description, images: ["/opengraph-image"] } };
}
