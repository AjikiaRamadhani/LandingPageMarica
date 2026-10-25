"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink, Search, Sparkles, Star, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import FeedbackPopup from "../components/FeedbackPopup";
import { WEB_GAMES, type WebGameId } from "../../lib/web-games";

type Edugame = {
  gameId?: WebGameId;
  title: string;
  description: string;
  age: string;
  skill: string;
  duration: string;
  platform: "Website" | "Mobile";
  image: string;
  href: string;
};

const games: Edugame[] = [
  {
    gameId: "pacu-jalur",
    title: "Marica Pacu Jalur",
    description: "Berlomba menyusuri sungai sambil mengenal budaya dan tradisi Indonesia.",
    age: "5–8 Tahun",
    skill: "Strategi",
    duration: "5 Menit",
    platform: "Website",
    image: "/images/edugames/marica pacu jalur.png",
    href: WEB_GAMES["pacu-jalur"].url,
  },
  {
    gameId: "panjat-pinang",
    title: "Panjat Pinang",
    description: "Latih ketangkasan dan kerja sama melalui permainan seru khas Indonesia.",
    age: "5–8 Tahun",
    skill: "Motorik",
    duration: "5 Menit",
    platform: "Website",
    image: "/images/edugames/panjat pinang.png",
    href: WEB_GAMES["panjat-pinang"].url,
  },
  {
    gameId: "dino-escape",
    title: "Dino Escape",
    description: "Bantu dinosaurus melewati tantangan dan melatih fokus dalam petualangan prasejarah.",
    age: "5–9 Tahun",
    skill: "Logika",
    duration: "6 Menit",
    platform: "Website",
    image: "/images/edugames/dino escpae.png",
    href: WEB_GAMES["dino-escape"].url,
  },
  {
    gameId: "angkasa-rasa",
    title: "Marica Angkasa Rasa",
    description: "Jelajahi luar angkasa sambil menemukan tantangan angka dan benda-benda menarik.",
    age: "5–9 Tahun",
    skill: "Numerasi",
    duration: "5 Menit",
    platform: "Website",
    image: "/images/edugames/marica angkasa rasa.jpg",
    href: WEB_GAMES["angkasa-rasa"].url,
  },
  {
    title: "Petualangan Marica",
    description: "Ikuti petualangan seru Marica dan asah kemampuan memecahkan masalah.",
    age: "5–9 Tahun",
    skill: "Eksplorasi",
    duration: "7 Menit",
    platform: "Mobile",
    image: "/images/edugames/petualangan marica.png",
    href: "https://play.google.com/store/apps/details?id=com.SebangkuGames.PetualanganMarica&hl=gsw",
  },
  {
    title: "Olimpiade Marica",
    description: "Tantang kemampuanmu dalam rangkaian permainan edukatif yang menyenangkan.",
    age: "6–10 Tahun",
    skill: "Kognitif",
    duration: "8 Menit",
    platform: "Mobile",
    image: "/images/edugames/olimpiade marica.png",
    href: "https://play.google.com/store/apps/details?id=com.SebangkuGames.MaricaOlympiade&hl=id",
  },
  {
    title: "Balap Cikar Marica",
    description: "Balapan penuh warna untuk melatih refleks, fokus, dan semangat pantang menyerah.",
    age: "5–9 Tahun",
    skill: "Refleks",
    duration: "5 Menit",
    platform: "Mobile",
    image: "/images/edugames/balap cikar marica.png",
    href: "https://play.google.com/store/apps/details?id=com.SebangkuGames.BalapCikarMarica&hl=uz",
  },
];

export default function EdugamesPage() {
  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("Semua");
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const skills = ["Semua", ...new Set(games.map((game) => game.skill))];
  const filteredGames = useMemo(() => {
    const query = search.trim().toLowerCase();
    return games.filter((game) => {
      const matchesSearch =
        !query ||
        game.title.toLowerCase().includes(query) ||
        game.description.toLowerCase().includes(query);
      const matchesSkill = skill === "Semua" || game.skill === skill;
      return matchesSearch && matchesSkill;
    });
  }, [search, skill]);

  async function handleGameVisit(game: Edugame) {
    window.open(game.href, "_blank", "noopener,noreferrer");
    try {
      const response = await fetch("/api/games/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.gameId }),
      });
      const result = (await response.json().catch(() => ({}))) as {
        awarded?: boolean;
        reason?: "already_awarded" | "daily_limit_reached";
        pointsAwarded?: number;
        error?: string;
      };
      if (response.status === 401) {
        setFeedback({ message: "Login terlebih dahulu agar kunjungan game mendapatkan poin.", type: "error" });
      } else if (!response.ok) {
        setFeedback({ message: result.error ?? "Kunjungan game belum tercatat.", type: "error" });
      } else if (result.awarded) {
        setFeedback({ message: `Kamu mendapatkan +${result.pointsAwarded ?? 5} Marica Points untuk kunjungan game ini.`, type: "success" });
      } else if (result.reason === "daily_limit_reached") {
        setFeedback({ message: "Batas poin kunjungan game hari ini sudah tercapai.", type: "success" });
      } else {
        setFeedback({ message: "Kunjungan game ini sudah dihitung hari ini.", type: "success" });
      }
    } catch {
      setFeedback({ message: "Game terbuka, tetapi kunjungan belum sempat tercatat.", type: "error" });
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#fffaf3] font-body text-marica-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-6 sm:px-8 lg:px-10 lg:pt-10">
          <div className="grid items-center gap-8 overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_12px_35px_rgba(120,60,10,0.08)] sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:p-12">
            <div>
              <p className="font-body text-xs font-bold uppercase tracking-[0.2em] text-marica-amber-dark">
                Edugames Marica
              </p>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-bold leading-tight text-marica-ink sm:text-5xl">
                Belajar jadi lebih seru lewat permainan.
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-6 text-marica-ink-soft sm:text-base">
                Temukan mini game edukatif yang membantu anak melatih logika,
                numerasi, strategi, refleks, dan kreativitas sambil bermain.
              </p>
              <a
                href="#pilih-permainan"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-marica-amber-dark px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(222,143,12,0.25)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Pilih Game <ArrowRight className="h-4 w-4" />
              </a>
              <p className="mt-4 flex items-center gap-2 text-xs text-marica-ink-soft">
                <Sparkles className="h-4 w-4 text-marica-amber-dark" />
                Aman dimainkan bersama pendamping
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl bg-marica-cream">
              <div className="relative aspect-[16/9]">
                <Image
                  src="/images/edugames.png"
                  alt="Petualangan Marica"
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="pilih-permainan" className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Pilih permainan yang anak sukai</h2>
            <p className="mt-2 text-sm text-marica-ink-soft">
              Mainkan game pilihan Marica langsung dari perangkatmu.
            </p>
          </div>

          <div className="mx-auto mt-7 flex max-w-2xl flex-col gap-4">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/70" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama permainan..."
                className="w-full rounded-full border border-marica-amber-dark/25 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/15"
              />
            </label>
            <div className="flex flex-wrap justify-center gap-2">
              {skills.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setSkill(item)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    skill === item
                      ? "border-marica-amber-dark bg-marica-amber-dark text-white"
                      : "border-marica-ink/10 bg-white text-marica-ink-soft hover:border-marica-amber-dark/50"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {filteredGames.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredGames.map((game) => (
                <article key={game.title} className="group flex flex-col overflow-hidden rounded-2xl border border-marica-ink/5 bg-white shadow-[0_10px_28px_rgba(120,60,10,0.08)] transition hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(120,60,10,0.14)]">
                  <div className="relative aspect-[16/9] overflow-hidden bg-marica-cream">
                    <Image
                      src={game.image}
                      alt={game.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-marica-ink-soft">
                      <span className="rounded-full bg-marica-sky-light px-2.5 py-1">{game.age}</span>
                      <span className="rounded-full bg-marica-amber/20 px-2.5 py-1 text-marica-amber-text">{game.skill}</span>
                      <span className={`rounded-full px-2.5 py-1 ${
                        game.platform === "Mobile"
                          ? "bg-marica-violet/15 text-marica-violet-deep"
                          : "bg-marica-green/15 text-marica-green"
                      }`}>
                        {game.platform}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl font-bold">{game.title}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-5 text-marica-ink-soft">{game.description}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-marica-ink-soft">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> Bersama orang tua</span>
                      <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-marica-amber-dark" /> {game.duration}</span>
                    </div>
                    {game.gameId ? (
                      <button
                        type="button"
                        onClick={() => void handleGameVisit(game)}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                      >
                        Mainkan di Website <ExternalLink className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <a
                        href={game.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-105"
                      >
                        Buka Google Play <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-2xl bg-white p-10 text-center text-sm text-marica-ink-soft shadow-sm">
              Permainan tidak ditemukan. Coba kata kunci lain.
            </p>
          )}
        </section>

        <section className="mx-auto mb-14 max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-5 rounded-3xl bg-gradient-to-r from-marica-amber-dark to-[#ffc936] p-7 text-white sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold">Lebih seru jika dimainkan bersama</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
                Dampingi anak, berikan pujian, dan jadikan setiap permainan sebagai momen belajar yang hangat.
              </p>
            </div>
            <Link href="/poin" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-marica-amber-text transition hover:bg-marica-cream">
              Pelajari MARICA Points <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <FeedbackPopup
        message={feedback?.message}
        type={feedback?.type}
        onClose={() => setFeedback(null)}
      />
    </div>
  );
}
