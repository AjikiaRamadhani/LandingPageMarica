"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Heart,
  Rocket,
  Home as HomeIcon,
  Puzzle,
  Sparkles,
  Package,
  GraduationCap,
  Pin,
  type LucideIcon,
} from "lucide-react";

type Benefit = {
  id: string;
  category: string | null;
  icon: string | null;
  title: string;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  order: number;
};

type CategoryStyle = {
  categoryIcon: LucideIcon;
  pillClass: string;
  tagIcon: LucideIcon;
  tagClass: string;
  fallbackImage: string;
  imageAlt: string;
};

// Normalize category text jadi key sederhana ("LOGIKA & KREATIVITAS" -> "logikakreativitas")
// biar nggak sensitif ke huruf besar/kecil atau spasi dari data API
function normalizeCategory(category: string | null): string {
  return (category ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

const categoryStyles: Record<string, CategoryStyle> = {
  logikakreativitas: {
    categoryIcon: MapPin,
    pillClass: "bg-marica-amber/20 text-marica-amber-text",
    tagIcon: Puzzle,
    tagClass: "bg-marica-amber/15 text-marica-amber-text",
    fallbackImage: "/images/benefit-logika-kreativitas.png",
    imageAlt: "Ruang belajar Marica yang hangat dan nyaman",
  },
  familybonding: {
    categoryIcon: Heart,
    pillClass: "bg-[#e0507a]/15 text-[#e0507a]",
    tagIcon: Heart,
    tagClass: "bg-[#e0507a]/10 text-[#e0507a]",
    fallbackImage: "/images/benefit-family-bonding.png",
    imageAlt: "Ibu dan anak tertawa bersama sambil bermain",
  },
  edurecreation: {
    categoryIcon: Rocket,
    pillClass: "bg-marica-blue/20 text-[#1f5f83]",
    tagIcon: Sparkles,
    tagClass: "bg-marica-blue/10 text-[#1f5f83]",
    fallbackImage: "/images/benefit-edu-recreation.png",
    imageAlt: "Ibu dan anak bermain board game Woodland Adventure",
  },
  homelearning: {
    categoryIcon: HomeIcon,
    pillClass: "bg-[#29cc7a]/15 text-[#1f9c5c]",
    tagIcon: Package,
    tagClass: "bg-[#29cc7a]/10 text-[#1f9c5c]",
    fallbackImage: "/images/benefit-home-learning.png",
    imageAlt: "Ibu dan anak membuka paket Marica Edu Kit di rumah",
  },
  holisticsupport: {
    categoryIcon: MapPin,
    pillClass: "bg-marica-violet/25 text-marica-violet-deep",
    tagIcon: GraduationCap,
    tagClass: "bg-marica-violet/15 text-marica-violet-deep",
    fallbackImage: "/images/benefit-holistic-support.png",
    imageAlt: "Kelas parenting orang tua Marica",
  },
};

const defaultStyle: CategoryStyle = categoryStyles.logikakreativitas;

export default function BenefitsSection() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/benefits")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBenefits(data);
        } else {
          console.error("Unexpected /api/benefits response:", data);
          setError("Gagal memuat data.");
        }
      })
      .catch((err) => {
        console.error("Failed to load benefits", err);
        setError("Gagal memuat data.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-marica-amber via-marica-amber to-marica-amber-dark px-6 py-20 lg:px-10 lg:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-6 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-40 h-48 w-48 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-white sm:text-3xl lg:text-[2.2rem]"
        >
          Apa yang Didapatkan Bunda & Si Kecil?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-white/85 sm:text-base"
        >
          Semua manfaat yang akan dirasakan keluarga bersama Marica.
        </motion.p>
      </div>

      {loading ? (
        <div className="relative z-10 mt-14 text-center font-body text-sm text-white/80">
          Memuat data...
        </div>
      ) : error ? (
        <div className="relative z-10 mt-14 text-center font-body text-sm text-red-100">
          {error}
        </div>
      ) : (
        <div className="relative z-10 mx-auto mt-14 flex max-w-5xl flex-col gap-8 lg:mt-16 lg:gap-10">
          {benefits.map((item, i) => {
            const style = categoryStyles[normalizeCategory(item.category)] ?? defaultStyle;
            const reverse = i % 2 === 1;
            const rotate = reverse ? 2 : -2;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.05, ease: "easeOut" }}
                className={`flex flex-col items-center gap-10 rounded-[32px] bg-white p-7 shadow-[0_20px_50px_rgba(120,60,10,0.15)] sm:p-9 lg:gap-14 lg:p-12 ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"
                  }`}
              >
                {/* Photo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, rotate: 0 }}
                  whileInView={{ opacity: 1, scale: 1, rotate }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
                  whileHover={{ scale: 1.03, rotate: 0 }}
                  className="relative w-full max-w-[420px] shrink-0 lg:w-[42%]"
                >
                  <div className="overflow-hidden rounded-2xl border-[6px] border-white bg-white shadow-[0_18px_35px_rgba(120,60,10,0.25)]">
                    <Image
                      src={item.imageUrl ?? style.fallbackImage}
                      alt={style.imageAlt}
                      width={520}
                      height={420}
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <motion.span
                    animate={{ y: [0, -4, 0], rotate: [-8, 4, -8] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-4 right-6 text-marica-amber-dark drop-shadow-md"
                  >
                    <Pin className="h-7 w-7 fill-marica-amber" strokeWidth={2} />
                  </motion.span>
                </motion.div>

                {/* Copy */}
                <div className="w-full text-left">
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-display text-xs font-semibold uppercase tracking-wide ${style.pillClass}`}
                  >
                    <style.categoryIcon className="h-3.5 w-3.5" />
                    {item.category}
                  </motion.span>

                  <motion.h3
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.28 }}
                    className="mt-4 font-display text-xl font-bold leading-snug text-marica-ink sm:text-2xl"
                  >
                    {item.icon && <span className="mr-1.5">{item.icon}</span>}
                    {item.title}
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: 0.36 }}
                    className="mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base"
                  >
                    {item.description}
                  </motion.p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.map((tag, ti) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.75 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.35, delay: 0.45 + ti * 0.07 }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-body text-xs font-medium ${style.tagClass}`}
                      >
                        <style.tagIcon className="h-3.5 w-3.5" />
                        {tag}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}