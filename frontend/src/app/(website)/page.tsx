import Hero from "@/components/home/Hero";
import FeaturedCars from "@/components/home/FeaturedCars";
import AboutUs from "@/components/home/AboutUs";
import ServicesPreview from "@/components/home/ServicesPreview";
import FAQPreview from "@/components/home/FAQPreview";
import Testimonials from "@/components/home/Testimonials";
import CTASection from "@/components/home/CTASection";

import { initialCatalogue } from "@/lib/server-catalogue";
import RentalSummary from "@/components/shared/RentalSummary";
export const dynamic = "force-dynamic";

export default async function Home() {
  const cars = await initialCatalogue();
  return (
    <>
      <Hero />
      <FeaturedCars initialCars={cars} />
      <RentalSummary />
      <AboutUs />
      <ServicesPreview />
      <Testimonials />
      <FAQPreview />
      <CTASection />
    </>
  );
}