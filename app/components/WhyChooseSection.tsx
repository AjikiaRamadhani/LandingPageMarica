"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const reasons = [
  {
    key: "story-telling",
    label: "Story Telling",
    pillClass: "bg-marica-maroon shadow-marica-maroon/40",
    image: "/images/why-story-telling.png",
    rotate: -6,
    floatDelay: 0,
  },
  {
    key: "play-based-learning",
    label: "Play Based Learning",
    pillClass: "bg-marica-teal shadow-marica-teal/40",
    image: "/images/why-play-based-learning.png",
    rotate: 5,
    floatDelay: 0.4,
  },
  {
    key: "problem-solving",
    label: "Problem Solving",
    pillClass: "bg-[#e0507a] shadow-[#e0507a]/40",
    image: "/images/why-problem-solving.png",
    rotate: -4,
    floatDelay: 0.8,
  },
];

export default function WhyChooseSection() {
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

      <div className="mx-auto mt-14 grid max-w-5xl gap-x-8 gap-y-16 sm:grid-cols-3 lg:mt-20">
        {reasons.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 32, scale: 0.85, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotate: item.rotate }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [item.rotate, item.rotate - 3, item.rotate],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: item.floatDelay,
              }}
              whileHover={{ scale: 1.08, rotate: 0 }}
              className="relative aspect-square w-full max-w-[240px] cursor-pointer drop-shadow-[0_18px_30px_rgba(120,60,10,0.35)]"
            >
              <Image
                src={item.image}
                alt={item.label}
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
              className={`-mt-4 inline-flex items-center rounded-full px-6 py-2.5 font-display text-sm font-medium text-white shadow-lg sm:text-base ${item.pillClass}`}
            >
              {item.label}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
