import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import BookingForm from "@/components/home/BookingForm";
import ServicesPreview from "@/components/home/ServicesPreview";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import FeaturedCars from "@/components/home/FeaturedCars";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <AboutUs />
        <ServicesPreview />
        <FeaturedCars />
        <BookingForm />
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
