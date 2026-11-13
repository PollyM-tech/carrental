import Analytics from "@/components/privacy/Analytics";

import CookieConsent from "@/components/privacy/CookieConsent";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.png?v=fe91dd984f", type: "image/png", sizes: "1254x1254" }],
    shortcut: "/favicon.ico?v=fe91dd984f",
    apple: [{ url: "/apple-touch-icon.png?v=fe91dd984f", sizes: "180x180", type: "image/png" }],
  },
  metadataBase: new URL("https://www.movaracarhire.com"),
  title: {
    default: "Car Hire in Kenya | Self-Drive Cars in Nairobi | Movara Car Hire",
    template: "%s | Movara Car Hire",
  },
  description:
    "Reliable car hire in Kenya for tourists, business travellers, airport trips and safari journeys. Browse self-drive vehicles in Nairobi and book with Movara Car Hire.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://www.movaracarhire.com",
    siteName: "Movara Car Hire",
    title: "Car Hire in Kenya | Movara Car Hire",
    description: "Self-drive car hire in Kenya for tourists, business travel, airport transfers and road trips.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Movara Car Hire Kenya" }],
  },
  twitter: { card: "summary_large_image", title: "Car Hire in Kenya | Movara Car Hire", description: "Self-drive car hire in Kenya for tourists, business travel and road trips.", images: ["/opengraph-image"] },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="min-h-screen bg-white text-slate-950"
      >
        {children}
        <CookieConsent />
        <Analytics />
      </body>
    </html>
  );
}
