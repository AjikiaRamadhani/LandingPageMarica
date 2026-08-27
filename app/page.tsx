import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/Problemsection";
import TestimonialSection from "./components/TestimonialSection";
import BenefitsSection from "./components/BenefitsSection";
import WhatsAppButton from "./components/WhatsAppButton";
import HowItWorksSection from "./components/HowItWorksSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
import { Analytics } from "@vercel/analytics/next"
export default function Home() {
  return (
    <main className="hero-gradient-bg flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <ProblemSection />
      <BenefitsSection />
      <TestimonialSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <WhatsAppButton />
      <Analytics />
    </main>
  );
}