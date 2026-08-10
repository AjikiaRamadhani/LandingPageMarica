import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ProblemSection from "./components/Problemsection";
import WhyChooseSection from "./components/WhyChooseSection";
import TestimonialSection from "./components/TestimonialSection";
import BenefitsSection from "./components/BenefitsSection";
import WhatsAppButton from "./components/WhatsAppButton";
import TrustSection from "./components/TrustSection";
import SubjectSection from "./components/SubjectSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import Footer from "./components/Footer";
export default function Home() {
  return (
    <main className="hero-gradient-bg flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <ProblemSection />
      <WhyChooseSection />
      <SubjectSection />
      <BenefitsSection />
      <TestimonialSection />
      <TrustSection />
      <HowItWorksSection />
      <FaqSection />
      <CtaSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
}