import HeroView from "./HeroView";
import { landingHero, landingStatistics } from "@/lib/landing-content";

export default async function Hero() {
  return <HeroView hero={landingHero} stats={landingStatistics} />;
}
