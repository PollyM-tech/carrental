import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/convex-provider";

export const metadata: Metadata = {
  title: "MoBri Car Hire",
  description: "Premium car hire across Kenya.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
