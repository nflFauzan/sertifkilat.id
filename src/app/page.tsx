import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoStrip from "@/components/landing/LogoStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import LiveSimulator from "@/components/landing/LiveSimulator";
import Testimonials from "@/components/landing/Testimonials";
import PricingSection from "@/components/landing/PricingSection";
import CtaBand from "@/components/landing/CtaBand";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <LogoStrip />
      <HowItWorks />
      <Features />
      <LiveSimulator />
      <Testimonials />
      <PricingSection />
      <CtaBand />
      <Footer />
    </main>
  );
}
