"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const stats = [
  {
    key: "rating",
    value: "4 dari 5",
    label: "Tingkat kepuasan pelanggan",
    dot: "bg-marica-maroon",
    valueClass: "text-marica-maroon",
  },
  {
    key: "percentage",
    value: "90%",
    label: "Tingkat kepuasan pelanggan",
    dot: "bg-[#e0507a]",
    valueClass: "text-[#e0507a]",
  },
  {
    key: "validation",
    value: "100",
    label:
      "Validasi ahli untuk Marica Kit, yang mencakup kontribusi dari psikolog, guru, dan dosen.",
    dot: "bg-marica-teal",
    valueClass: "text-marica-teal",
  },
];

const logos = Array.from({ length: 15 }, (_, i) => ({
  key: `logo-${i + 1}`,
  src: `/images/partners/logo-${i + 1}.png`,
}));

const logoRow1 = logos.slice(0, 8);
const logoRow2 = logos.slice(8);

function LogoMarqueeRow({
  items,
  direction,
  duration,
}: {
  items: typeof logos;
  direction: "left" | "right";
  duration: number;
}) {
  const animClass =
    direction === "left" ? "animate-marquee-left" : "animate-marquee-right";
  return (
    <div className="overflow-hidden">
      <div
        className={`flex w-max items-center gap-4 ${animClass}`}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...items, ...items].map((logo, i) => (
          <div
            key={`${logo.key}-${i}`}
            className="flex h-16 w-24 shrink-0 items-center justify-center rounded-xl bg-white p-2.5 shadow-[0_6px_16px_rgba(30,60,90,0.08)] sm:h-20 sm:w-28"
          >
            <Image
              src={logo.src}
              alt="Logo mitra Marica"
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

export default function TrustSection() {
  return (
    <section className="relative overflow-hidden bg-marica-sky pb-20 pt-4 lg:pb-28">
      {/* curved transition from the warm section above into blue */}
      <div className="relative -mt-1 h-14 sm:h-20 lg:h-28">
        <svg
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full text-marica-amber"
        >
          <path
            d="M0,0 L1440,0 L1440,60 C1160,110 720,110 0,40 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* animated background blobs */}
      <div
        aria-hidden
        className="animate-blob-drift pointer-events-none absolute -left-10 top-24 h-64 w-64 rounded-full bg-white/40 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-blob-drift pointer-events-none absolute right-0 top-6 h-48 w-48 rounded-full bg-white/30 blur-3xl"
        style={{ animationDelay: "3s" }}
      />

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
          className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-[#3b5568]/80 sm:text-base"
        >
          Marica berkolaborasi dengan berbagai lembaga pendidikan, komunitas,
          dan institusi untuk menghadirkan solusi belajar yang menyenangkan
          dan terpercaya.
        </motion.p>
      </div>

      {/* Mascot + stat cards */}
      <div className="relative z-10 mx-auto mt-12 grid max-w-5xl items-center gap-8 px-6 lg:mt-14 lg:grid-cols-[260px_1fr] lg:gap-10 lg:px-10">
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
          {stats.slice(0, 2).map((stat, i) => (
            <motion.div
              key={stat.key}
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
                className={`absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white ${stat.dot}`}
              />
              <p className={`font-display text-2xl font-bold ${stat.valueClass}`}>
                {stat.value}
              </p>
              <p className="mt-1 font-body text-sm text-marica-ink-soft">
                {stat.label}
              </p>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="relative overflow-hidden rounded-2xl border-2 border-dashed border-marica-teal/50 bg-white p-1.5 shadow-[0_10px_25px_rgba(30,60,90,0.08)]"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.3 }}
              className="absolute -top-1 left-1/2 z-10 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-marica-teal"
            />
            <Image
              src="/images/trust-team-photo.png"
              alt="Tim Marica berkolaborasi dengan mitra"
              width={340}
              height={220}
              className="h-full w-full rounded-xl object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="relative rounded-2xl border-2 border-dashed border-marica-teal/50 bg-white px-5 pb-5 pt-7 shadow-[0_10px_25px_rgba(30,60,90,0.08)]"
          >
            <motion.span
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ type: "spring", stiffness: 400, damping: 14, delay: 0.45 }}
              className="absolute -top-2.5 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-marica-teal"
            />
            <p className="font-display text-2xl font-bold text-marica-teal">
              {stats[2].value}
            </p>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              {stats[2].label}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Auto-running logo marquee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mx-auto mt-14 max-w-6xl space-y-4 lg:mt-16"
      >
        <LogoMarqueeRow items={logoRow1} direction="left" duration={32} />
        <LogoMarqueeRow items={logoRow2} direction="right" duration={26} />
      </motion.div>
    </section>
  );
}
