import Hero from "@/components/home/Hero";
import AboutUs from "@/components/home/AboutUs";
import BookingForm from "@/components/home/BookingForm";
import WhatsappButton from "@/components/shared/WhatsAppButton";


export default function Home() {
  return (
    <main>
      <Hero />
      <AboutUs />
      <BookingForm />
      <WhatsappButton />
    </main>
  );
}