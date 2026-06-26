import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import BookingForm from "@/components/home/BookingForm";
import WhatsAppButton from "@/components/shared/WhatsAppButton";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        <Hero />
        <AboutUs />
        <BookingForm />
      </main>

      <Footer />
      <WhatsAppButton />
    </>
  );
}
