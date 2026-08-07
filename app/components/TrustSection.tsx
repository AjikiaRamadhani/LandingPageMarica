"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type TrustStat = {
  id: string;
  value: string | null;
  label: string;
  imageUrl: string | null;
  dotColor: string | null;
  order: number;
};

type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  order: number;
};

const dotClassMap: Record<string, string> = {
  purple: "bg-marica-maroon",
  pink: "bg-[#e0507a]",
  teal: "bg-marica-teal",
};

const valueClassMap: Record<string, string> = {
  purple: "text-marica-maroon",
  pink: "text-[#e0507a]",
  teal: "text-marica-teal",
};

function LogoMarqueeRow({
  items,
  direction,
  duration,
}: {
  items: Partner[];
  direction: "left" | "right";
  duration: number;
}) {
  const animClass = direction === "left" ? "animate-marquee-left" : "animate-marquee-right";
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max items-center gap-4 ${animClass}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((logo, i) => (
          <div
            key={`${logo.id}-${i}`}
            className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-white p-2.5 shadow-[0_6px_16px_rgba(30,60,90,0.08)] sm:h-20 sm:w-28"
          >
            <Image
              src={logo.logoUrl}
              alt={logo.name}
              width={96}
              height={64}
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor" aria-hidden>
      <path d="M50 40H14C6.268 40 0 33.732 0 26C0 18.268 6.268 12 14 12C14.676 12 15.343 12.048 16 12.14C18.28 5.06 24.928 0 32.8 0C41.316 0 48.44 5.936 50.28 13.868C50.52 13.856 50.76 13.848 51 13.848C58.18 13.848 64 19.668 64 26.848C64 34.028 58.18 40 51 40H50Z" />
    </svg>
  );
}

export default function TrustSection() {
  const [stats, setStats] = useState<TrustStat[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/trust-stats").then((res) => res.json()),
      fetch("/api/partners").then((res) => res.json()),
    ])
      .then(([statsData, partnersData]) => {
        if (Array.isArray(statsData)) setStats(statsData);
        if (Array.isArray(partnersData)) setPartners(partnersData);
      })
      .catch((err) => console.error("Failed to load trust section data", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-marica-amber pb-20 pt-4 lg:pb-28">
      {/* curved transition from the warm section above, melting down into the blue */}
      <div className="relative -mt-1 h-20 overflow-hidden sm:h-28 lg:h-40">
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-marica-amber/50 blur-2xl"
        >
          <path d="M0,10 L1440,10 L1440,80 C1160,145 720,145 0,65 Z" fill="currentColor" />
        </svg>
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-marica-amber"
        >
          <path d="M0,0 L1440,0 L1440,75 C1160,150 720,150 0,55 Z" fill="currentColor" />
        </svg>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-marica-amber" />
      </div>

      {/* animated background blobs (glow) */}
      <div
        aria-hidden
        className="animate-blob-drift pointer-events-none absolute -left-10 top-24 h-64 w-64 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob-drift pointer-events-none absolute right-0 top-6 h-48 w-48 rounded-full bg-white/30 blur-3xl"
        style={{ animationDelay: "3s" }}
      />

      {/* decorative clouds scattered through the section */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-4 top-4 z-0 h-14 w-24 text-white/95 drop-shadow-sm sm:h-20 sm:w-36"
        animate={{ x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudShape className="h-full w-full" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-2 top-8 z-0 h-16 w-28 text-white sm:h-24 sm:w-44 lg:top-4"
        animate={{ x: [0, -12, 0] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudShape className="h-full w-full" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-2 top-[38%] z-0 h-10 w-20 text-white/80 sm:h-14 sm:w-28"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <CloudShape className="h-full w-full" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-6 top-[52%] z-0 h-9 w-16 text-white/70 sm:h-12 sm:w-24"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <CloudShape className="h-full w-full" />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-2xl px-6 text-center lg:px-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.6rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.1rem]"
        >
          Dipercaya oleh Mitra & Institusi Terkemuka
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-marica-ink/80 sm:text-base"
        >
          Marica berkolaborasi dengan berbagai lembaga pendidikan, komunitas,
          dan institusi untuk menghadirkan solusi belajar yang menyenangkan
          dan terpercaya.
        </motion.p>
      </div>

      {loading ? (
        <div className="relative z-10 mt-12 text-center font-body text-sm text-marica-ink/60">
          Memuat data...
        </div>
      ) : (
        <>
          {/* Mascot + stat cards */}
          <div className="relative z-10 mx-auto mt-12 grid max-w-5xl items-center gap-8 px-6 lg:mt-14 lg:grid-cols-[260px_1fr] lg:gap-10 lg:px-10">
            {/* Mascot - dekoratif, tetap statis di frontend (bukan data yang berubah-ubah) */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="mx-auto w-full max-w-[220px] lg:max-w-none"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/images/trust-mascot.png"
                  alt="Maskot Marica"
                  width={340}
                  height={330}
                  className="h-auto w-full object-contain"
                />
              </motion.div>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              {stats.map((stat, i) => {
                const dotClass = dotClassMap[stat.dotColor ?? ""] ?? "bg-marica-teal";
                const valueClass = valueClassMap[stat.dotColor ?? ""] ?? "text-marica-teal";
                const isPhotoCard = Boolean(stat.imageUrl);

                if (isPhotoCard) {
                  return (
                    <motion.div
                      key={stat.id}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.4 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      whileHover={{ y: -4 }}
                      className="relative overflow-hidden rounded-2xl border-2 border-dashed border-marica-teal/50 bg-white p-1.5 shadow-[0_10px_25px_rgba(30,60,90,0.08)]"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ type: "spring", stiffness: 400, damping: 14, delay: i * 0.1 + 0.15 }}
                        className={`absolute -top-1 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white ${dotClass}`}
                      />
                      <Image
                        src={stat.imageUrl!}
                        alt={stat.label}
                        width={340}
                        height={220}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={stat.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    whileHover={{ y: -4 }}
                    className="relative rounded-2xl border-2 border-dashed border-marica-amber/50 bg-white px-5 pb-5 pt-7 shadow-[0_10px_25px_rgba(30,60,90,0.08)]"
                  >
                    <motion.span
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ type: "spring", stiffness: 400, damping: 14, delay: i * 0.1 + 0.15 }}
                      className={`absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white ${dotClass}`}
                    />
                    <p className={`font-display text-2xl font-bold ${valueClass}`}>{stat.value}</p>
                    <p className="mt-1 font-body text-sm text-marica-ink-soft">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Auto-running logo marquee */}
          {partners.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 mx-auto mt-14 max-w-6xl lg:mt-16"
            >
              <LogoMarqueeRow items={partners} direction="left" duration={42} />
            </motion.div>
          )}
        </>
      )}
    </section>
  );
}