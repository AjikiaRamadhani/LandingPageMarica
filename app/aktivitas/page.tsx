"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft, Star, Play, Download } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { CATEGORY_STYLES, EDUGAMES, PRINTABLES, type Activity } from "./activities-data";

const TABS = [
  { key: "edugames", label: "Edugames" },
  { key: "printables", label: "Printables" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

const gridVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function AktivitasPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("edugames");
  const reduceMotion = useReducedMotion();
  const items = activeTab === "edugames" ? EDUGAMES : PRINTABLES;

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
            Temukan Aktivitas Seru & Edukatif
          </h1>
          <p className="mt-3 font-body text-marica-ink-soft">
            Jelajahi berbagai permainan interaktif dan materi cetak yang dirancang untuk
            mendukung tumbuh kembang anak Anda dengan cara yang menyenangkan.
          </p>
        </motion.div>

        {/* Segmented toggle — same sliding-pill pattern as the Navbar's hover state */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-1 rounded-full border border-marica-ink/10 bg-white p-1 shadow-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  aria-pressed={isActive}
                  className={`relative isolate min-w-[112px] rounded-full px-5 py-2 text-center font-body text-sm font-semibold transition-colors ${
                    isActive ? "text-white" : "text-marica-ink-soft hover:text-marica-ink"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="aktivitas-tab-pill"
                      className="absolute inset-0 z-0 rounded-full"
                      style={{ backgroundColor: "#de8f0c" }}
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Activity grid — cross-fades and re-staggers in whenever the tab changes */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={reduceMotion ? undefined : gridVariants}
              initial="hidden"
              animate="show"
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {items.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} kind={activeTab} reduceMotion={!!reduceMotion} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ActivityCard({
  activity,
  kind,
  reduceMotion,
}: {
  activity: Activity;
  kind: TabKey;
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
        style={{ backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
      >
        <div className="absolute left-3 top-3 flex gap-1.5 opacity-50" aria-hidden>
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
          <span className="h-2 w-2 rounded-full bg-marica-ink/40" />
        </div>

        {kind === "edugames" && activity.rating && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-marica-ink shadow-sm">
            <Star className="h-3 w-3 fill-marica-amber text-marica-amber" />
            {activity.rating}
          </div>
        )}

        <div className="flex h-full items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/70 shadow-inner">
            <Icon className="h-7 w-7" style={{ color: style.iconColor }} />
          </div>
        </div>

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
        <h3 className="mt-3 font-display text-lg font-semibold text-marica-ink">{activity.title}</h3>
        <p className="mt-1 flex-1 font-body text-sm text-marica-ink-soft line-clamp-2">
          {activity.description}
        </p>

        <Link
          href={activity.href}
          className="mt-4 flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
        >
          {kind === "edugames" ? (
            <>
              <Play className="h-4 w-4" /> Main Sekarang
            </>
          ) : (
            <>
              <Download className="h-4 w-4" /> Download PDF
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}