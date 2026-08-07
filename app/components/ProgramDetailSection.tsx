"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";

const programs = [
  {
    key: "event",
    title: "Event",
    description:
      "Free trial dengan kit belajar mingguan dan mentoring profesional",
    points: ["1 Kit pembelajaran per minggu", "Mentoring", "Workshop & acara"],
    image: "/images/program-event.png",
    imageAlt: "Anak-anak antusias mengikuti event belajar Marica",
    rotate: -3,
  },
  {
    key: "olimpiade",
    title: "Olimpiade",
    description:
      "Program intensif persiapan lomba dengan bimbingan expert",
    points: [
      "24 kali pertemuan intensif",
      "30 Kit pembelajaran premium",
      "Expert mentoring",
    ],
    image: "/images/program-olimpiade.png",
    imageAlt: "Anak menunjukkan sertifikat program Olimpiade Marica",
    rotate: 3,
  },
];

function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor" aria-hidden>
      <path d="M50 40H14C6.268 40 0 33.732 0 26C0 18.268 6.268 12 14 12C14.676 12 15.343 12.048 16 12.14C18.28 5.06 24.928 0 32.8 0C41.316 0 48.44 5.936 50.28 13.868C50.52 13.856 50.76 13.848 51 13.848C58.18 13.848 64 19.668 64 26.848C64 34.028 58.18 40 51 40H50Z" />
    </svg>
  );
}

export default function ProgramDetailSection() {
  return (
    <section className="relative overflow-hidden bg-marica-amber px-6 py-20 lg:px-10 lg:py-28">
      {/* soft dotted texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(255,255,255,0.35)_1.5px,transparent_1.5px)] [background-size:22px_22px]"
      />
      {/* big soft cloud blobs, same tone as the background so they read as texture */}
      <CloudShape className="pointer-events-none absolute -left-6 bottom-6 h-28 w-48 text-marica-amber-dark/20" />
      <CloudShape className="pointer-events-none absolute right-0 bottom-0 h-24 w-44 text-marica-amber-dark/15" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Detail Program
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-marica-ink/80 sm:text-base"
        >
          Program Marica membantu anak menguasai Matematika & Bahasa dengan
          cara yang menyenangkan.
        </motion.p>
      </div>

      {/* Clothesline + hanging cards */}
      <div className="relative z-10 mx-auto mt-16 max-w-3xl">
        {/* the string */}
        <svg
          viewBox="0 0 600 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute left-0 right-0 top-0 h-10 w-full overflow-visible sm:h-14"
        >
          <motion.path
            d="M0,10 C150,60 450,60 600,10"
            fill="none"
            stroke="white"
            strokeWidth={3}
            strokeDasharray="9 9"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.1, ease: "easeInOut" }}
          />
        </svg>

        <div className="grid gap-x-10 gap-y-14 pt-6 sm:grid-cols-2 sm:pt-8">
          {programs.map((item, i) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: -36, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: item.rotate }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.7,
                delay: i * 0.2 + 0.3,
                ease: "easeOut",
              }}
              style={{ transformOrigin: "top center" }}
              className="relative"
            >
              {/* gentle continuous sway, as if hanging on the line */}
              <motion.div
                animate={{ rotate: [item.rotate - 1.5, item.rotate + 1.5, item.rotate - 1.5] }}
                transition={{
                  duration: 4.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
                style={{ transformOrigin: "top center" }}
              >
                {/* clothes pin */}
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 360,
                    damping: 14,
                    delay: i * 0.2 + 0.6,
                  }}
                  className="absolute -top-4 left-1/2 z-10 flex h-8 w-6 -translate-x-1/2 items-start justify-center rounded-md bg-[#e0507a] shadow-md"
                >
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-white" />
                </motion.span>

                <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_20px_45px_rgba(120,60,10,0.2)]">
                  <div className="overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.imageAlt}
                      width={420}
                      height={220}
                      className="h-40 w-full object-cover"
                    />
                  </div>

                  <div className="p-5 text-center sm:p-6">
                    <h3 className="font-display text-lg font-bold text-marica-ink sm:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-marica-ink-soft">
                      {item.description}
                    </p>

                    <ul className="mt-4 space-y-2 text-left">
                      {item.points.map((point, pi) => (
                        <motion.li
                          key={point}
                          initial={{ opacity: 0, x: -8 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true, amount: 0.6 }}
                          transition={{
                            duration: 0.35,
                            delay: i * 0.2 + 0.7 + pi * 0.08,
                          }}
                          className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft"
                        >
                          <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-marica-amber-dark text-white">
                            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
                          </span>
                          {point}
                        </motion.li>
                      ))}
                    </ul>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-6 inline-flex items-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-display text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
                    >
                      Daftar Sekarang
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}