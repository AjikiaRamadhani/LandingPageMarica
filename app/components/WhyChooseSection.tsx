"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type LearningCategory = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  colorTag: string | null;
  order: number;
};

// Presentational config per colorTag - styling murni, bukan data
const presentation: Record<
  string,
  { pillClass: string; fallbackImage: string; rotate: number; floatDelay: number }
> = {
  purple: {
    pillClass: "bg-marica-maroon shadow-marica-maroon/40",
    fallbackImage: "/images/why-story-telling.png",
    rotate: -6,
    floatDelay: 0,
  },
  teal: {
    pillClass: "bg-marica-teal shadow-marica-teal/40",
    fallbackImage: "/images/why-play-based-learning.png",
    rotate: 5,
    floatDelay: 0.4,
  },
  pink: {
    pillClass: "bg-[#e0507a] shadow-[#e0507a]/40",
    fallbackImage: "/images/why-problem-solving.png",
    rotate: -4,
    floatDelay: 0.8,
  },
};

const defaultPresentation = presentation.purple;

export default function WhyChooseSection() {
  const [reasons, setReasons] = useState<LearningCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/learning-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReasons(data);
        } else {
          console.error("Unexpected /api/learning-categories response:", data);
          setError("Gagal memuat data.");
        }
      })
      .catch((err) => {
        console.error("Failed to load learning categories", err);
        setError("Gagal memuat data.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-marica-amber-dark via-marica-amber to-marica-amber-dark px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Mengapa Memilih Marica?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink/80 sm:text-base"
        >
          Program calistung yang dirancang khusus untuk anak usia TK
        </motion.p>
      </div>

      {loading ? (
        <div className="mt-14 text-center font-body text-sm text-marica-ink/60">
          Memuat data...
        </div>
      ) : error ? (
        <div className="mt-14 text-center font-body text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="mx-auto mt-14 grid max-w-5xl gap-x-8 gap-y-16 sm:grid-cols-3 lg:mt-20">
          {reasons.map((item, i) => {
            const style = presentation[item.colorTag ?? ""] ?? defaultPresentation;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 32, scale: 0.85, rotate: 0 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: style.rotate }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={{
                    y: [0, -12, 0],
                    rotate: [style.rotate, style.rotate - 3, style.rotate],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: style.floatDelay,
                  }}
                  whileHover={{ scale: 1.08, rotate: 0 }}
                  className="relative aspect-square w-full max-w-[240px] cursor-pointer drop-shadow-[0_18px_30px_rgba(120,60,10,0.35)]"
                >
                  <Image
                    src={item.imageUrl ?? style.fallbackImage}
                    alt={item.name}
                    fill
                    sizes="240px"
                    className="object-contain"
                  />
                </motion.div>

                <motion.span
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: i * 0.15 + 0.35 }}
                  whileHover={{ scale: 1.05 }}
                  className={`-mt-4 inline-flex items-center rounded-full px-6 py-2.5 font-display text-sm font-medium text-white shadow-lg sm:text-base ${style.pillClass}`}
                >
                  {item.name}
                </motion.span>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}