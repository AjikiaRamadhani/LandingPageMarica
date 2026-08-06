import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import StatsBar from "./components/StatsBar";
import WhatsAppButton from "./components/WhatsAppButton";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <Hero />
      <StatsBar />
      <WhatsAppButton />
    </main>
  );
}
