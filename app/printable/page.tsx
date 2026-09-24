"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  CATEGORY_STYLES,
  PRINTABLES,
  type Activity,
  type CategoryKey,
  type Printable,
} from "./activities-data";

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function PrintablePage() {
  const [printables, setPrintables] = useState<Printable[]>(PRINTABLES);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    fetch("/api/printables")
      .then((response) =>
        response.ok
          ? response.json()
          : Promise.reject(new Error("Gagal memuat printable")),
      )
      .then(
        (
          data: Array<{
            slug: string;
            title: string;
            description: string;
            subject: string;
            ageMin: number | null;
            ageMax: number | null;
            thumbnailUrl: string | null;
          }>,
        ) => {
          setPrintables(
            data.map((item) => {
              const category = toCategoryKey(item.subject);
              const age =
                item.ageMin !== null && item.ageMax !== null
                  ? `${item.ageMin}-${item.ageMax} Thn`
                  : "Semua usia";
              return {
                ...PRINTABLES[0],
                id: item.slug,
                title: item.title,
                description: item.description,
                longDescription: item.description,
                category,
                categoryLabel: item.subject,
                age,
                thumbnailUrl: item.thumbnailUrl,
                href: `/printable/printables-download?item=${encodeURIComponent(item.slug)}`,
              };
            }),
          );
        },
      )
      .catch((error) => console.error("[PrintablePage]", error));
  }, []);

  return (
    <>
      <Navbar />
      <main className="hero-gradient-bg-v2 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-marica-ink-soft transition hover:text-marica-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-8 lg:px-10 lg:pb-24 lg:pt-10">
          {/* Header — single entrance moment on page load */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="font-display text-3xl font-semibold text-marica-ink sm:text-4xl">
              Printable Seru untuk Si Kecil
            </h1>
            <p className="mt-3 font-body text-marica-ink-soft">
              Pilih materi cetak edukatif yang dirancang untuk mendukung tumbuh
              kembang anak dengan cara yang menyenangkan.
            </p>
          </motion.div>

          {/* Printable grid */}
          <div className="mt-10">
            <motion.div
              variants={reduceMotion ? undefined : gridVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {printables.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  reduceMotion={!!reduceMotion}
                />
              ))}
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ActivityCard({
  activity,
  reduceMotion,
}: {
  activity: Activity;
  reduceMotion: boolean;
}) {
  const style = CATEGORY_STYLES[activity.category];
  const Icon = style.icon;

  return (
    <motion.div
      variants={reduceMotion ? undefined : cardVariants}
      whileHover={reduceMotion ? undefined : { y: -4 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-marica-ink/5 bg-white shadow-[0_14px_35px_rgba(120,60,10,0.08)] transition-shadow duration-300 hover:shadow-[0_18px_40px_rgba(120,60,10,0.14)]"
    >
      {/* Illustration area — faux browser chrome + a category icon standing in for artwork */}
      <div
        className="relative h-40 shrink-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})`,
        }}
      >
        <div
          className="absolute left-3 top-3 flex gap-1.5 opacity-50"
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
        </div>

        {activity.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-inner">
              <Icon className="h-7 w-7" style={{ color: style.iconColor }} />
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-marica-ink-soft shadow-sm">
          {activity.age}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <span
          className="inline-block w-fit rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: style.badgeBg, color: style.badgeText }}
        >
          {activity.categoryLabel}
        </span>
        <h3 className="mt-3 font-display text-lg font-semibold text-marica-ink">
          {activity.title}
        </h3>
        <p className="mt-1 flex-1 font-body text-sm text-marica-ink-soft line-clamp-2">
          {activity.description}
        </p>

        <Link
          href={activity.href}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          <Download className="h-4 w-4" /> Download PDF
        </Link>
      </div>
    </motion.div>
  );
}

function toCategoryKey(subject: string): CategoryKey {
  const normalized = subject.toLowerCase();
  if (normalized.includes("sains")) return "sains";
  if (normalized.includes("bahasa")) return "bahasa";
  if (normalized.includes("logika")) return "logika";
  if (normalized.includes("kognitif")) return "kognitif";
  if (normalized.includes("kreativ")) return "kreativitas";
  return "motorik";
}
