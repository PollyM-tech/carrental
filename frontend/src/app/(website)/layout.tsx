
import FloatingContact from "@/components/layout/FloatingContact";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {children}
      </div>

      <Footer />
      <FloatingContact />
    </div>
  );
}
