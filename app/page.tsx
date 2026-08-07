import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatsAppButton from "./components/WhatsAppButton";
import ProblemSection from "./components/Problemsection";
import WhyChooseSection from "./components/WhyChooseSection";
import ProgramSection from "./components/SubjectSection";
import BenefitsSection from "./components/BenefitsSection";
import SubjectSection from "./components/SubjectSection";

export default function Home() {
  return (
    <main className="hero-gradient-bg flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <ProblemSection />
      <WhyChooseSection />
      <SubjectSection />
      <BenefitsSection />
      <WhatsAppButton />
    </main>
  );
}
