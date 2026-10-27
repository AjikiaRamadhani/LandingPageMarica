"use client";

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
import BackgroundDoodles from "./BackgroundDoodles";

type Benefit = {
  id: string;
  category: string | null;
  icon: string | null;
  title: string;
  description: string | null;
  tags: string[];
  order: number;
};

const benefits: Benefit[] = [
  {
    id: "logic-creativity",
    category: "LOGIKA & KREATIVITAS",
    icon: "💡",
    title: "Bermain Sambil Melatih Logika & Kreativitas",
    description:
      "Anak-anak diajak berpikir kritis, memecahkan masalah, dan mengasah imajinasi lewat ratusan board game pilihan, buku interaktif, dan workshop sains serta kriya (craft kit).",
    tags: ["Board Game", "Buku Interaktif", "Workshop", "Craft Kit"],
    order: 1,
  },
  {
    id: "family-bonding",
    category: "FAMILY BONDING",
    icon: "🤝",
    title: "Menguatkan Bonding Ibu & Anak",
    description:
      "Menciptakan quality time yang hangat dan penuh tawa bersama keluarga melalui sesi bermain meja (Table-fee) dan kelas edukasi interaktif.",
    tags: ["Quality Time", "Kelas Edukasi"],
    order: 2,
  },
  {
    id: "edu-recreation",
    category: "EDU-RECREATION",
    icon: "🎉",
    title: "Rekreasi Seru yang Berbobot Edukasi",
    description:
      "Alternatif tempat main fisik (Playpass) yang tidak hanya menyenangkan, tetapi juga aman, nyaman, dan mendukung perkembangan karakter serta sosialisasi anak.",
    tags: ["Playpass", "Aman", "Sosialisasi", "Karakter Positif"],
    order: 3,
  },
  {
    id: "home-learning",
    category: "HOME LEARNING",
    icon: "📦",
    title: "Praktis! Inspirasi Main Tanpa Ribet di Rumah",
    description:
      "Lewat layanan Edu-Kit & Langganan Bulanan, Bunda tak perlu pusing lagi memikirkan ide permainan kreatif—bahan dan panduan aktivitas langsung dikirim rapi ke rumah.",
    tags: ["Edu Kit", "Langganan", "Aktivitas Rumah", "Panduan"],
    order: 4,
  },
  {
    id: "holistic-support",
    category: "HOLISTIC SUPPORT",
    icon: "🏠",
    title: "Dukungan Tumbuh Kembang Terpadu",
    description:
      "Menyediakan wadah sharing session / parenting class untuk orang tua, paket perayaan ulang tahun edukatif, hingga pelatihan media ajar untuk guru dan sekolah.",
    tags: ["Parenting Class", "Birthday Package", "Pelatihan Guru", "Sekolah"],
    order: 5,
  },
];

type CategoryStyle = {
  categoryIcon: LucideIcon;
  pillClass: string;
  tagIcon: LucideIcon;
  tagClass: string;
  fallbackImage: string;
  imageAlt: string;
};

// Normalize category text jadi key sederhana ("LOGIKA & KREATIVITAS" -> "logikakreativitas").
function normalizeCategory(category: string | null): string {
  return (category ?? "").toLowerCase().replace(/[^a-z]/g, "");
}

const categoryStyles: Record<string, CategoryStyle> = {
  logikakreativitas: {
    categoryIcon: MapPin,
    pillClass: "bg-marica-amber/20 text-marica-amber-text",
    tagIcon: Puzzle,
    tagClass: "bg-marica-amber/15 text-marica-amber-text",
    fallbackImage: "/images/benefit1.webp",
    imageAlt: "Ruang belajar Marica yang hangat dan nyaman",
  },
  familybonding: {
    categoryIcon: Heart,
    pillClass: "bg-[#e0507a]/15 text-[#e0507a]",
    tagIcon: Heart,
    tagClass: "bg-[#e0507a]/10 text-[#e0507a]",
    fallbackImage: "/images/benefit2.webp",
    imageAlt: "Ibu dan anak tertawa bersama sambil bermain",
  },
  edurecreation: {
    categoryIcon: Rocket,
    pillClass: "bg-marica-blue/20 text-[#1f5f83]",
    tagIcon: Sparkles,
    tagClass: "bg-marica-blue/10 text-[#1f5f83]",
    fallbackImage: "/images/benefit3.webp",
    imageAlt: "Ibu dan anak bermain board game Woodland Adventure",
  },
  homelearning: {
    categoryIcon: HomeIcon,
    pillClass: "bg-[#29cc7a]/15 text-[#1f9c5c]",
    tagIcon: Package,
    tagClass: "bg-[#29cc7a]/10 text-[#1f9c5c]",
    fallbackImage: "/images/benefit4.webp",
    imageAlt: "Ibu dan anak membuka paket Marica Edu Kit di rumah",
  },
  holisticsupport: {
    categoryIcon: MapPin,
    pillClass: "bg-marica-violet/25 text-marica-violet-deep",
    tagIcon: GraduationCap,
    tagClass: "bg-marica-violet/15 text-marica-violet-deep",
    fallbackImage: "/images/benefit5.webp",
    imageAlt: "Kelas parenting orang tua Marica",
  },
};

const defaultStyle: CategoryStyle = categoryStyles.logikakreativitas;

export default function BenefitsSection() {
  return (
    <section id="manfaat" className="section-warm-bg relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28">
      <BackgroundDoodles />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-bold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Apa yang Didapatkan Bunda & Si Kecil?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base"
        >
          Semua manfaat yang akan dirasakan keluarga bersama Marica.
        </motion.p>
      </div>

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
                      src={style.fallbackImage}
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
    </section>
  );
}