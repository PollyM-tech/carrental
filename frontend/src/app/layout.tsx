
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Movara Car Hire",
    template: "%s | Movara Car Hire",
  },
  description:
    "Convenient self-drive car hire for business, family trips, and everyday travel across Kenya.",
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
