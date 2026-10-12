import Hero from "@/components/home/Hero";
import FeaturedCars from "@/components/home/FeaturedCars";
import AboutUs from "@/components/home/AboutUs";
import ServicesPreview from "@/components/home/ServicesPreview";
import FAQPreview from "@/components/home/FAQPreview";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCars />
      <AboutUs />
      <ServicesPreview />
      <Testimonials />
      <FAQPreview />
      <CTASection />
    </>
  );
}