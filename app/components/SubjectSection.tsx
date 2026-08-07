"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Plus } from "lucide-react";

type Subject = {
  id: string;
  title: string;
  mascotImageUrl: string | null;
  colorTag: string | null;
  cognitiveDomainTags: string[];
  contentDomainItems: string[];
  order: number;
};

const CheckBadge = () => (
  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-marica-amber-dark">
    <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
  </span>
);

// Presentational config per colorTag - ini murni styling, sengaja nggak disimpan di database
const presentation: Record<
  string,
  {
    accentHex: string;
    badgeClasses: string[];
    decorations:
    | { type: "icon"; className: string; size: number }[]
    | { type: "letter"; letters: string[]; classNames: string[] };
    fallbackMascot: string;
    initialX: number;
  }
> = {
  purple: {
    accentHex: "var(--marica-maroon)",
    badgeClasses: ["bg-marica-teal", "bg-marica-maroon", "bg-[#e0507a]"],
    decorations: [
      { type: "icon", className: "left-2 top-3 text-marica-teal", size: 16 },
      { type: "icon", className: "right-2 top-8 text-marica-rose-deep", size: 12 },
    ],
    fallbackMascot: "/images/program-matematika-mascot.png",
    initialX: -32,
  },
  pink: {
    accentHex: "#e0507a",
    badgeClasses: ["bg-marica-teal", "bg-marica-maroon", "bg-[#e0507a]"],
    decorations: {
      type: "letter",
      letters: ["C", "D", "A", "B"],
      classNames: [
        "left-0 top-2 text-marica-blue",
        "right-0 top-1 text-marica-amber-dark",
        "left-4 bottom-8 text-marica-rose-deep",
        "right-3 bottom-6 text-marica-violet-deep",
      ],
    },
    fallbackMascot: "/images/program-bahasa-mascot.png",
    initialX: 32,
  },
};

const defaultPresentation = presentation.purple;

export default function SubjectSection() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSubjects(data);
        } else {
          console.error("Unexpected /api/subjects response:", data);
          setError("Gagal memuat data mata pelajaran.");
        }
      })
      .catch((err) => {
        console.error("Failed to load subjects", err);
        setError("Gagal memuat data mata pelajaran.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-marica-amber-dark via-marica-amber to-marica-amber px-6 py-20 lg:px-10 lg:py-28">
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

      {loading ? (
        <div className="mt-14 text-center font-body text-sm text-marica-ink/60">
          Memuat data...
        </div>
      ) : error ? (
        <div className="mt-14 text-center font-body text-sm text-red-600">
          {error}
        </div>
      ) : (
        <div className="relative z-10 mx-auto mt-14 grid max-w-3xl gap-8 sm:grid-cols-2 lg:mt-16 lg:gap-10">
          {subjects.map((subject, i) => {
            const style = presentation[subject.colorTag ?? ""] ?? defaultPresentation;

            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 40, x: style.initialX }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                whileHover={{ y: -8 }}
                className="overflow-hidden rounded-[28px] border-[3px] border-dashed bg-white shadow-[0_20px_45px_rgba(120,60,10,0.2)] transition-shadow hover:shadow-[0_28px_55px_rgba(120,60,10,0.3)]"
                style={{ borderColor: style.accentHex }}
              >
                <div className="px-6 pt-7">
                  <div className="relative mx-auto mb-3 h-24 w-24">
                    <motion.div
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      className="relative h-full w-full"
                    >
                      <Image
                        src={subject.mascotImageUrl ?? style.fallbackMascot}
                        alt={subject.title}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    </motion.div>

                    {(() => {
                      const decorations = style.decorations;

                      if (Array.isArray(decorations)) {
                        return decorations.map((deco, di) => (
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
                            <Plus size={deco.size} strokeWidth={3} />
                          </motion.span>
                        ));
                      }

                      return decorations.letters.map((letter, di) => (
                        <motion.span
                          key={di}
                          animate={{ y: [0, -6, 0] }}
                          transition={{
                            duration: 2.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: di * 0.3,
                          }}
                          className={`absolute font-display text-lg font-bold ${decorations.classNames[di]}`}
                        >
                          {letter}
                        </motion.span>
                      ));
                    })()}
                  </div>

                  <h3 className="text-center font-display text-xl font-semibold text-marica-ink">
                    {subject.title}
                  </h3>
                  <p className="mt-1 text-center font-display text-sm font-semibold text-marica-amber-dark">
                    Cognitive Domain
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {subject.cognitiveDomainTags.map((tag, bi) => (
                      <motion.span
                        key={tag}
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.6 }}
                        transition={{ duration: 0.35, delay: i * 0.15 + 0.3 + bi * 0.08 }}
                        className={`rounded-full px-3.5 py-1.5 font-body text-xs font-medium text-white ${style.badgeClasses[bi % style.badgeClasses.length]
                          }`}
                      >
                        {tag}
                      </motion.span>
                    ))}
                  </div>

                  <p className="mt-4 text-center font-display text-sm font-semibold text-marica-amber-dark">
                    Content Domain
                  </p>

                  <ul className="mx-auto mt-3 max-w-[220px] space-y-2 pb-7">
                    {subject.contentDomainItems.map((item, ci) => (
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

                <div
                  className="h-16 border-t-[3px] border-dashed border-white"
                  style={{ backgroundColor: style.accentHex }}
                />
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}