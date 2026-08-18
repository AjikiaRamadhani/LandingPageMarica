"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import BackgroundDoodles from "./BackgroundDoodles";

type PainPoint = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  order: number;
};

// Fallback image kalau field imageUrl belum diisi di database
const fallbackImages = [
  "/images/problemkids1.png",
  "/images/problemkids2.png",
  "/images/problemkids3.png",
];

export default function ProblemSection() {
  const [problems, setProblems] = useState<PainPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/pain-points")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProblems(data);
        } else {
          console.error("Unexpected /api/pain-points response:", data);
          setError("Gagal memuat data.");
        }
      })
      .catch((err) => {
        console.error("Failed to load pain points", err);
        setError("Gagal memuat data.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="masalah" className="section-soft-bg relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28">
      <BackgroundDoodles />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-bold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Apakah Bunda Pernah Mengalami Hal Ini?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-4 max-w-xl font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base"
        >
          Kami mengerti tantangan yang sering dihadapi orang tua dalam
          memberikan stimulasi belajar yang tepat.
        </motion.p>
      </div>

      {loading ? (
        <div className="relative z-10 mt-12 text-center font-body text-sm text-marica-ink/60">
          Memuat data...
        </div>
      ) : error ? (
        <div className="relative z-10 mt-12 text-center font-body text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="relative z-10 mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-3 lg:mt-16 lg:grid-cols-3">
          {problems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-[28px] bg-white p-7 text-left shadow-[0_20px_50px_rgba(120,60,10,0.1)]"
            >
              <div className="relative h-32 w-32 overflow-hidden rounded-full bg-marica-cream">
                <Image
                  src={fallbackImages[i % fallbackImages.length]}
                  alt={item.title}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>

              <h3 className="mt-6 font-display text-lg font-semibold text-marica-ink">
                {item.title}
              </h3>
              <p className="mt-2.5 font-body text-sm leading-relaxed text-marica-ink-soft">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}