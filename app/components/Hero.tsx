"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Dices,
  Gamepad2,
  Users,
  PackageOpen,
  Star,
  Boxes,
  Rocket,
  Sparkles,
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

// Icon key (dari database) -> komponen Lucide. Kalau icon key belum ada di
// database / belum kepetakan, jatuh ke Sparkles biar tetap aman.
const iconMap: Record<string, LucideIcon> = {
  dice: Dices,
  ticket: Gamepad2,
  pencil: Users,
  box: PackageOpen,
  users: Users,
  star: Star,
  boxes: Boxes,
};

// Posisi & warna badge murni presentasional, di-siklus berdasarkan urutan index
const badgePresentation = [
  {
    className: "left-[0%] top-[2%] sm:left-[-4%] sm:top-[0%]",
    iconBg: "bg-marica-tan/20",
    iconColor: "text-marica-tan",
    floatDelay: 0,
  },
  {
    className: "right-[-2%] bottom-[2%] sm:right-[-6%] sm:bottom-auto sm:top-[26%]",
    iconBg: "bg-marica-blue/15",
    iconColor: "text-marica-blue",
    floatDelay: 0.6,
  },
  {
    className: "left-[2%] bottom-[6%] sm:left-[-6%] sm:bottom-[6%]",
    iconBg: "bg-marica-violet/25",
    iconColor: "text-marica-violet-deep",
    floatDelay: 1.2,
  },
  {
    className: "right-[-2%] top-[18%] sm:right-[-6%] sm:top-auto sm:bottom-[0%]",
    iconBg: "bg-marica-rose/25",
    iconColor: "text-marica-rose-deep",
    floatDelay: 1.8,
  },
];

const statColors = ["text-marica-amber-dark", "text-marica-violet-deep", "text-marica-blue"];

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

export default function Hero() {
  const [hero, setHero] = useState<HeroData | null>(null);
  const [stats, setStats] = useState<Statistic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/hero").then((res) => res.json()),
      fetch("/api/statistics").then((res) => res.json()),
    ])
      .then(([heroData, statsData]) => {
        if (heroData && !heroData.error) setHero(heroData);
        if (Array.isArray(statsData)) setStats(statsData);
      })
      .catch((err) => console.error("Failed to load hero/statistics", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section id="beranda" className="relative overflow-hidden bg-gradient-to-b from-white via-marica-cream to-marica-amber">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center font-body text-sm text-marica-ink-soft">
          Memuat data...
        </div>
      </section>
    );
  }

  if (!hero) {
    return null;
  }

  return (
    <section id="beranda" className="relative overflow-hidden bg-gradient-to-b from-white via-marica-cream to-marica-amber">
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:px-10 lg:pb-20 lg:pt-8">
        {/* Left: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10 max-w-xl lg:max-w-none"
        >
          <h1 className="font-display text-[2rem] font-semibold leading-[1.2] text-marica-ink sm:text-[2.6rem] lg:text-[2.9rem]">
            {hero.headline}
          </h1>

          {hero.subheadline && (
            <p className="mt-5 max-w-md font-body text-[15px] leading-relaxed text-marica-ink-soft sm:text-base">
              {hero.subheadline}
            </p>
          )}

          <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-5 lg:flex-nowrap lg:gap-4">
            {hero.ctaText && (
              <motion.a
                href={hero.ctaLink ?? "#"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-marica-amber to-marica-amber-dark px-7 py-3.5 font-display text-base font-medium text-white shadow-lg shadow-marica-amber-dark/30 lg:w-auto lg:justify-start lg:gap-3"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 lg:hidden">
                  <Rocket className="h-3.5 w-3.5" />
                </span>
                {hero.ctaText}
                <span className="hidden lg:inline-flex">
                  <ArrowIcon />
                </span>
              </motion.a>
            )}

            {/* Stats pill — desktop only, sits beside the CTA */}
            {stats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="hidden items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_30px_rgba(80,50,10,0.08)] sm:gap-4 lg:inline-flex lg:px-5 lg:py-4"
              >
                {stats.map((stat, i) => {
                  const Icon = iconMap[stat.icon ?? ""] ?? Sparkles;
                  return (
                    <div key={stat.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
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
                      {i < stats.length - 1 && (
                        <span className="h-7 w-px shrink-0 bg-black/10" aria-hidden />
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right: photo with floating badges */}
        <div className="relative z-10 mx-auto w-full max-w-[460px] px-4 py-8 sm:px-8 lg:py-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative mx-auto aspect-square w-full max-w-[380px] overflow-hidden rounded-full bg-gradient-to-br from-marica-amber via-marica-amber-dark to-marica-amber-text p-3 shadow-[0_25px_60px_rgba(120,70,10,0.25)]"
          >
            <div className="h-full w-full overflow-hidden rounded-full bg-white/10">
              <Image
                src={hero.imageUrl ?? "/images/hero-character.png"}
                alt="Ibu dan anak bermain balok edukatif bersama"
                width={596}
                height={596}
                priority
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </motion.div>

          {hero.badges.map((badge, i) => {
            const Icon = iconMap[badge.icon ?? ""] ?? Sparkles;
            const style = badgePresentation[i % badgePresentation.length];

            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.15, ease: "easeOut" }}
                className={`absolute ${style.className}`}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: style.floatDelay,
                  }}
                  whileHover={{ scale: 1.08 }}
                  className="flex items-center gap-2 rounded-full bg-white/95 py-2 pl-2 pr-4 shadow-[0_12px_24px_rgba(80,50,10,0.14)] backdrop-blur-sm"
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${style.iconBg}`}
                  >
                    <Icon className={`h-4 w-4 ${style.iconColor}`} />
                  </span>
                  <span className="font-body text-sm font-medium text-marica-ink whitespace-nowrap">
                    {badge.label}
                  </span>
                </motion.div>
              </motion.div>
            );
          })}

          {/* soft glow blob behind photo */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 scale-90 rounded-full bg-marica-amber/30 blur-3xl"
          />
        </div>

        {/* Stats card — mobile only, sits below the photo */}
        {stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative z-10 mx-auto grid w-full max-w-[380px] grid-cols-3 divide-x divide-black/10 rounded-2xl bg-white px-2 py-4 shadow-[0_10px_30px_rgba(80,50,10,0.08)] lg:hidden"
          >
            {stats.map((stat, i) => {
              const Icon = iconMap[stat.icon ?? ""] ?? Sparkles;
              return (
                <div key={stat.id} className="flex flex-col items-center gap-1 px-2 text-center">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${statColors[i % statColors.length]}`} fill="currentColor" />
                    <p className="font-display text-base font-semibold text-marica-ink">
                      {stat.value}
                    </p>
                  </div>
                  <p className="font-body text-[10px] font-medium uppercase tracking-wide text-marica-ink-soft">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}