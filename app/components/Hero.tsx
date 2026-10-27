import HeroView from "./HeroView";
import { landingHero, landingStatistics } from "@/lib/landing-content";

const hero = {
  id: "static-hero",
  headline: "Ciptakan Momen Belajar Ceria dan Bermakna Bersama Si Kecil Setiap Hari",
  subheadline:
    "Bingung mencari aktivitas bermanfaat untuk anak? Dari keseruan area bermain fisik, workshop akhir pekan, hingga paket edukasi rutin di rumah, Marica siap mendampingi tiap tahapan tumbuh kembang anak Anda.",
  imageUrl: "/images/hero-character.webp",
  ctaText: "Eksplor Serunya Marica",
  ctaLink: "#program",
  badges: [],
};

const stats = [
  { id: "families", label: "Keluarga", value: "5000+", icon: "users", order: 1 },
  { id: "rating", label: "Rating Review", value: "4.9/5", icon: "star", order: 2 },
  { id: "activities", label: "Aktivitas", value: "100+", icon: "box", order: 3 },
];

export default function Hero() {
  return <HeroView hero={hero} stats={stats} />;
}
