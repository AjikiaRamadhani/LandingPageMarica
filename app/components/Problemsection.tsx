"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const problems = [
  {
    key: "ajak-main",
    title: "Bingung Mau Ajak Anak Main?",
    description:
      "Bosan dengan tempat rekreasi yang itu-itu saja dan cuma bikin anak muter-muter tanpa dapat manfaat atau stimulasi belajar yang berarti.",
    image: "/images/problem-playground.png",
  },
  {
    key: "ide-aktivitas",
    title: "Habis Ide Aktivitas di Rumah",
    description:
      "Pengen banget dampingi anak main yang kreatif dan melatih logika, tapi sering kehabisan ide, bingung cari bahan mainnya, dan nggak ada waktu buat ngerancang sendiri.",
    image: "/images/problem-athome.png",
  },
  {
    key: "mainan-bosan",
    title: "Mainan Cepat Membosankan",
    description:
      "Sudah beli banyak mainan, tapi cuma dimainkan sekali-dua kali lalu ditinggal begitu saja karena kurang interaktif dan nggak ada alur permainan yang seru untuk dimainkan bareng.",
    image: "/images/problem-bored.png",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff8ef] via-marica-amber to-marica-amber-dark px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
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

      <div className="mx-auto mt-12 grid max-w-6xl gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {problems.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="rounded-[28px] bg-white p-7 text-left shadow-[0_20px_50px_rgba(120,60,10,0.14)]"
          >
            <div className="relative h-32 w-32 overflow-hidden rounded-full bg-marica-cream">
              <Image
                src={item.image}
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
    </section>
  );
}