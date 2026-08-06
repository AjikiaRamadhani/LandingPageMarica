"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";

const CheckBadge = () => (
  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-marica-amber-dark">
    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
  </span>
);

const programs = [
  {
    key: "matematika",
    title: "Matematika",
    accentHex: "var(--marica-maroon)",
    mascot: "/images/program-matematika-mascot.png",
    badges: [
      { label: "Knowing", className: "bg-marica-teal" },
      { label: "Applying", className: "bg-marica-maroon" },
      { label: "Reasoning", className: "bg-[#e0507a]" },
    ],
    checklist: [
      "Number & Operation",
      "Algebra",
      "Geometry",
      "Measurement",
      "Data Analysis & Probability",
    ],
    decorations: [
      { icon: Plus, className: "left-2 top-3 text-marica-teal", size: 16 },
      { icon: Plus, className: "right-2 top-8 text-marica-rose-deep", size: 12 },
    ],
    initialX: -32,
  },
  {
    key: "bahasa",
    title: "Bahasa",
    accentHex: "#e0507a",
    mascot: "/images/program-bahasa-mascot.png",
    badges: [
      { label: "Pre Reading", className: "bg-marica-teal" },
      { label: "Reading", className: "bg-marica-maroon" },
      { label: "Post Reading", className: "bg-[#e0507a]" },
    ],
    checklist: [
      "Six Syllables",
      "A I U E O",
      "Sound Recognation",
      "Reading Stories",
      "Upper & Lower Letters",
    ],
    decorations: [
      { letter: "C", className: "left-0 top-2 text-marica-blue" },
      { letter: "D", className: "right-0 top-1 text-marica-amber-dark" },
      { letter: "A", className: "left-4 bottom-8 text-marica-rose-deep" },
      { letter: "B", className: "right-3 bottom-6 text-marica-violet-deep" },
    ],
    initialX: 32,
  },
];

export default function ProgramSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-marica-amber-dark via-marica-amber to-marica-amber px-6 py-20 lg:px-10 lg:py-28">
      {/* decorative cloud blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-white/15 blur-3xl"
      />

      <div className="mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Apa yang Ingin Dipelajari Si Kecil?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink/80 sm:text-base"
        >
          Pilih dari berbagai program seru yang dirancang khusus untuk
          mengasah kreativitas dan logika si kecil.
        </motion.p>
      </div>

      <div className="relative z-10 mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2 lg:mt-16 lg:gap-10">
        {programs.map((program, i) => (
          <motion.div
            key={program.key}
            initial={{ opacity: 0, y: 40, x: program.initialX }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
            whileHover={{ y: -8 }}
            className="overflow-hidden rounded-[28px] border-[3px] border-dashed bg-white shadow-[0_20px_45px_rgba(120,60,10,0.2)] transition-shadow hover:shadow-[0_28px_55px_rgba(120,60,10,0.3)]"
            style={{ borderColor: program.accentHex }}
          >
            <div className="px-6 pt-7">
              {/* Mascot with floating decorations */}
              <div className="relative mx-auto mb-3 h-24 w-24">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative h-full w-full"
                >
                  <Image
                    src={program.mascot}
                    alt={program.title}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                </motion.div>

                {program.decorations.map((deco, di) =>
                  "icon" in deco ? (
                    <motion.span
                      key={di}
                      animate={{ y: [0, -6, 0], rotate: [0, 10, 0] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: di * 0.4,
                      }}
                      className={`absolute ${deco.className}`}
                    >
                      <deco.icon size={deco.size} strokeWidth={3} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key={di}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 2.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: di * 0.3,
                      }}
                      className={`absolute font-display text-lg font-bold ${deco.className}`}
                    >
                      {deco.letter}
                    </motion.span>
                  )
                )}
              </div>

              <h3 className="text-center font-display text-xl font-semibold text-marica-ink">
                {program.title}
              </h3>
              <p className="mt-1 text-center font-display text-sm font-semibold text-marica-amber-dark">
                Cognitive Domain
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                {program.badges.map((badge, bi) => (
                  <motion.span
                    key={badge.label}
                    initial={{ opacity: 0, scale: 0.7 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.35, delay: i * 0.15 + 0.3 + bi * 0.08 }}
                    className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium text-white ${badge.className}`}
                  >
                    {badge.label}
                  </motion.span>
                ))}
              </div>

              <p className="mt-4 text-center font-display text-sm font-semibold text-marica-amber-dark">
                Content Domain
              </p>

              <ul className="mx-auto mt-3 max-w-[220px] space-y-2 pb-7">
                {program.checklist.map((item, ci) => (
                  <motion.li
                    key={item}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.35, delay: i * 0.15 + 0.5 + ci * 0.06 }}
                    className="flex items-start gap-2"
                  >
                    <CheckBadge />
                    <span className="font-body text-sm text-marica-ink-soft">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* ticket-stub footer */}
            <div
              className="h-16 border-t-[3px] border-dashed border-white"
              style={{ backgroundColor: program.accentHex }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
}