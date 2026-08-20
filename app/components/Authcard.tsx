"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

export default function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <main className="hero-gradient-bg-v2 relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-2 font-body text-sm font-medium text-marica-ink-soft backdrop-blur-sm transition hover:bg-white hover:text-marica-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50 sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Beranda
      </Link>

      <div
        aria-hidden
        className="animate-blob-drift pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-marica-amber/20 blur-3xl"
      />
      <div
        aria-hidden
        style={{ animationDelay: "-4s" }}
        className="animate-blob-drift pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-marica-violet-deep/20 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_rgba(120,60,10,0.18)] sm:p-10"
      >
        <motion.div
          aria-hidden
          animate={prefersReducedMotion ? { y: 0 } : { y: [0, -10, 0] }}
          transition={{ duration: 3.6, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
          className="mx-auto -mt-2 mb-4 w-fit"
        >
          <Image
            src="/images/mascots/program-matematika-mascot.png"
            alt=""
            width={88}
            height={120}
            className="h-16 w-auto drop-shadow-md"
          />
        </motion.div>

        <h1 className="text-center font-display text-2xl font-semibold text-marica-ink sm:text-[26px]">{title}</h1>
        <p className="mt-2 text-center font-body text-sm text-marica-ink-soft">{subtitle}</p>

        <div className="mt-7">{children}</div>
      </motion.div>
    </main>
  );
}