
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://movaracarhire.com"),
  title: {
    default: "Car Hire in Kenya | Self-Drive Cars in Nairobi | Movara Car Hire",
    template: "%s | Movara Car Hire",
  },
  description:
    "Reliable car hire in Kenya for tourists, business travellers, airport trips and safari journeys. Browse self-drive vehicles in Nairobi and book with Movara Car Hire.",
  keywords: ["car hire Kenya", "car rental Kenya", "car hire Nairobi", "self-drive car hire Kenya", "airport car hire Nairobi", "Kenya tours and travel", "safari car hire Kenya"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://movaracarhire.com",
    siteName: "Movara Car Hire",
    title: "Car Hire in Kenya | Movara Car Hire",
    description: "Self-drive car hire in Kenya for tourists, business travel, airport transfers and road trips.",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Movara Car Hire Kenya" }],
  },
  twitter: { card: "summary_large_image", title: "Car Hire in Kenya | Movara Car Hire", description: "Self-drive car hire in Kenya for tourists, business travel and road trips.", images: ["/logo.png"] },
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
      </body>
    </html>
  );
}
