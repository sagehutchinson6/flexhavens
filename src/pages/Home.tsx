import Navbar from "@/components/Navbar";
import WhatsAppChat from "@/components/WhatsAppChat";
import HeroSection from "@/sections/HeroSection";
import StatsBar from "@/sections/StatsBar";
import TrustBanner from "@/sections/TrustBanner";
import FeaturesSection from "@/sections/FeaturesSection";
import CatalogSection from "@/sections/CatalogSection";
import TestimonialsSection from "@/sections/TestimonialsSection";
import DeliverySection from "@/sections/DeliverySection";
import ContactSection from "@/sections/ContactSection";
import TeamSection from "@/sections/TeamSection";
import Footer from "@/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <HeroSection />
        <StatsBar />
        <TrustBanner />
        <FeaturesSection />
        <CatalogSection />
        <TestimonialsSection />
        <TeamSection />
        <DeliverySection />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppChat />
    </div>
  );
}
