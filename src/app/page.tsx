import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import LogoStrip from "@/components/landing/LogoStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import TemplatePreview from "@/components/landing/TemplatePreview";
import LiveSimulator from "@/components/landing/LiveSimulator";
import Testimonials from "@/components/landing/Testimonials";
import PricingSection from "@/components/landing/PricingSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaBand from "@/components/landing/CtaBand";
import Footer from "@/components/landing/Footer";
import { prisma } from "@/lib/db";

export const revalidate = 3600; // Revalidate setiap jam

async function getLandingData() {
  try {
    const [totalCertificates, totalUsers, recentEvents] = await Promise.all([
      prisma.certificate.count(),
      prisma.user.count(),
      // Ambil nama event unik yang bisa jadi "org names" di logo strip
      prisma.event.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    // Gunakan nama event sebagai "organisasi" yang tampil di LogoStrip
    const orgs = recentEvents.map((e) => ({ id: e.id, name: e.name }));

    return { totalCertificates, totalUsers, orgs };
  } catch {
    return { totalCertificates: 0, totalUsers: 0, orgs: [] };
  }
}

export default async function HomePage() {
  const data = await getLandingData();

  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <Hero stats={{ totalCertificates: data.totalCertificates, totalUsers: data.totalUsers }} />
      <LogoStrip orgs={data.orgs} />
      <HowItWorks />
      <Features />
      <TemplatePreview />
      <LiveSimulator />
      <Testimonials />
      <PricingSection />
      <FaqSection />
      <CtaBand />
      <Footer />
    </main>
  );
}
