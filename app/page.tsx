import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import WhatsAppButton from "./components/WhatsAppButton";

export default function Home() {
  return (
    <main className="hero-gradient-bg flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <WhatsAppButton />
    </main>
  );
}
