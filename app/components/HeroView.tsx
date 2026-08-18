"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dices,
  Gamepad2,
  Users,
  PackageOpen,
  Star,
  Boxes,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

type HeroBadge = {
  id: string;
  label: string;
  icon: string | null;
  order: number;
};

type HeroData = {
  id: string;
  headline: string;
  subheadline: string | null;
  imageUrl: string | null;
  ctaText: string | null;
  ctaLink: string | null;
  badges: HeroBadge[];
};

type Statistic = {
  id: string;
  label: string;
  value: string;
  icon: string | null;
  order: number;
};

type Props = {
  hero: HeroData;
  stats: Statistic[];
};

// Icon key (dari database) -> komponen Lucide.
const iconMap: Record<string, LucideIcon> = {
  dice: Dices,
  ticket: Gamepad2,
  pencil: Users,
  box: PackageOpen,
  users: Users,
  star: Star,
  boxes: Boxes,
};

const statColors = ["text-marica-amber-dark", "text-marica-violet-deep", "text-marica-tan"];

const ArrowIcon = () => (
  <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
    <path
      d="M1 7H17M17 7L11 1M17 7L11 13"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Squiggle underline dipakai di bawah kata yang di-highlight pada headline.
const Squiggle = () => (
  <svg
    aria-hidden
    viewBox="0 0 200 12"
    preserveAspectRatio="none"
    className="absolute -bottom-1.5 left-0 h-2.5 w-full text-marica-amber-dark"
  >
    <path
      d="M2 8C30 2 60 2 90 6C120 10 150 10 198 4"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

/**
 * Headline mendukung satu kata/frasa yang di-highlight dengan cara
 * membungkusnya dalam tanda bintang di data CMS, mis.
 *   "Ciptakan Momen Belajar Ceria dan *Bermakna* Bersama Si Kecil Setiap Hari"
 * Frasa di antara *…* akan dirender berwarna amber dengan garis bawah coret tangan.
 * Kalau tidak ada tanda bintang, headline dirender polos seperti sebelumnya.
 */
function renderHeadline(headline: string) {
  const parts = headline.split(/\*(.+?)\*/g);
  if (parts.length === 1) return headline;

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} className="relative inline-block whitespace-nowrap text-marica-amber-dark">
        {part}
        <Squiggle />
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function HeroView({ hero, stats }: Props) {
  return (
    <section id="beranda" className="hero-gradient-bg relative overflow-hidden">
      {/* fade halus di dasar hero: meluruh dari transparan ke warna awal
          .section-soft-bg (#fdf8f0) supaya sambungan ke section berikutnya
          tidak terlihat sebagai garis tegas */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-[#fdf8f0] sm:h-36"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-16 pt-6 md:grid-cols-[1.05fr_1fr] md:items-center md:gap-6 md:px-8 md:pb-14 md:pt-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-10 lg:pb-20 lg:pt-8">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-xl md:max-w-none"
        >
          <h1 className="font-display text-[2rem] font-bold leading-[1.2] text-marica-ink sm:text-[2.6rem] md:text-[1.85rem] lg:text-[2.9rem]">
            {renderHeadline(hero.headline)}
          </h1>

          {hero.subheadline && (
            <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-marica-ink-soft sm:text-base md:max-w-lg">
              {hero.subheadline}
            </p>
          )}

          {hero.ctaText && (
            <motion.a
              href={hero.ctaLink ?? "#"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-marica-ink bg-white px-7 py-3.5 font-display text-base font-semibold text-marica-ink sm:w-auto"
            >
              {hero.ctaText}
              <ArrowIcon />
            </motion.a>
          )}

          {/* Stats — tiga pil terpisah berjajar di bawah CTA */}
          {stats.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              {stats.map((stat, i) => {
                const Icon = iconMap[stat.icon ?? ""] ?? Sparkles;
                return (
                  <div
                    key={stat.id}
                    className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-[0_10px_24px_rgba(80,50,10,0.08)]"
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 ${statColors[i % statColors.length]}`}
                      fill="currentColor"
                    />
                    <div className="leading-tight">
                      <p className="font-display text-xs font-semibold text-marica-ink whitespace-nowrap sm:text-sm">
                        {stat.value}
                      </p>
                      <p className="font-body text-[10px] text-marica-ink-soft whitespace-nowrap sm:text-[11px]">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Right: illustration with floating badges */}
        <div className="relative z-10 mx-auto w-full max-w-[460px] px-4 py-8 sm:px-8 md:max-w-[320px] md:px-2 md:py-0 lg:max-w-[480px] lg:px-8 lg:py-4">
          {/* soft blob backdrop behind the illustration */}
          <div aria-hidden className="absolute inset-[6%] -z-10 rounded-full bg-marica-cream" />

          {/* decorative target/ring icon, top-right of the blob */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="absolute right-[10%] top-[-2%] text-marica-amber-dark sm:right-[14%]"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Target className="h-7 w-7" strokeWidth={1.75} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative mx-auto aspect-square w-full max-w-[380px]"
          >
            <Image
              src={hero.imageUrl ?? "/images/hero-character.png"}
              alt="Ibu dan anak bermain balok edukatif bersama"
              width={596}
              height={596}
              priority
              className="h-full w-full object-contain"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}