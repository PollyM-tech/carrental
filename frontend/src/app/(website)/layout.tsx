
import FloatingContact from "@/components/layout/FloatingContact";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "AutoRental", name: siteConfig.businessName,
        url: "https://movaracarhire.com", image: "https://movaracarhire.com/logo.png",
        telephone: "+254716741039", email: siteConfig.email,
        address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
        areaServed: { "@type": "Country", name: "Kenya" },
        priceRange: "KES", sameAs: [`https://wa.me/${siteConfig.whatsapp}`],
      }) }} />
      <Navbar />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
      <FloatingContact />
    </div>
  );
}
