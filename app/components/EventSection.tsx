"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const events = [
  {
    key: "playday",
    title: "Serunya PlayDay: Marica X Oddish Family Hub Ha...",
    subtitle: "Marica Kembali Menghadirkan Inovasi Dalam...",
    date: "Senin, 08 September 2025",
    image: "/images/event-playday.png",
    imageAlt: "Keseruan PlayDay Marica x Oddish Family Hub",
  },
  {
    key: "kikoku",
    title: "Serunya Trial Class Talking Dino Di TK Kikok...",
    subtitle: "Marica Kembali Menghadirkan Inovasi Dalam...",
    date: "Kamis, 04 September 2025",
    image: "/images/event-kikoku.png",
    imageAlt: "Trial class Talking Dino di TK Kikoku",
  },
  {
    key: "kidsland",
    title: "Marica Hadir Di KidsLand Galeria Mall: Meramaik...",
    subtitle: "Marica Kembali Menebarkan Semangat Kre...",
    date: "Rabu, 17 September 2025",
    image: "/images/event-kidsland.png",
    imageAlt: "Marica hadir di KidsLand Galeria Mall",
  },
];

export default function EventSection() {
  return (
    <section className="relative overflow-hidden bg-marica-amber px-6 py-20 lg:px-10 lg:py-28">
      {/* decorative glow blobs, consistent with the rest of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 top-8 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Event Kami
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

      {/* Cards */}
      <div className="relative z-10 mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-7">
        {events.map((item, i) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3, margin: "0px 0px -60px 0px" }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            whileHover={{ y: -6 }}
            className="flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_18px_40px_rgba(120,60,10,0.15)] transition-shadow hover:shadow-[0_24px_50px_rgba(120,60,10,0.22)]"
          >
            <motion.div
              className="overflow-hidden"
              whileHover={{ scale: 1.04 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image
                src={item.image}
                alt={item.imageAlt}
                width={420}
                height={240}
                className="h-40 w-full object-cover sm:h-44"
              />
            </motion.div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 16,
                  delay: i * 0.15 + 0.2,
                }}
                className="inline-flex w-fit items-center rounded-full bg-marica-amber/20 px-3 py-1 font-display text-xs font-semibold text-marica-amber-text"
              >
                Event
              </motion.span>

              <h3 className="mt-3 line-clamp-2 font-display text-base font-bold leading-snug text-marica-ink sm:text-lg">
                {item.title}
              </h3>

              <p className="mt-2 line-clamp-2 font-body text-sm leading-relaxed text-marica-ink-soft">
                {item.subtitle}
              </p>

              <p className="mt-3 font-body text-xs text-marica-ink-soft/70">
                {item.date}
              </p>

              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-display text-sm font-semibold text-white shadow-md transition-shadow hover:shadow-lg"
              >
                Lihat Selengkapnya
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}