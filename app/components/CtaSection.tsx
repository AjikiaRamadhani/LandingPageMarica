"use client";

import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";

function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor" aria-hidden>
      <path d="M50 40H14C6.268 40 0 33.732 0 26C0 18.268 6.268 12 14 12C14.676 12 15.343 12.048 16 12.14C18.28 5.06 24.928 0 32.8 0C41.316 0 48.44 5.936 50.28 13.868C50.52 13.856 50.76 13.848 51 13.848C58.18 13.848 64 19.668 64 26.848C64 34.028 58.18 40 51 40H50Z" />
    </svg>
  );
}

function StarShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="currentColor" aria-hidden>
      <path d="M20 0L23.9 15.1L38.6 20L23.9 24.9L20 40L16.1 24.9L1.4 20L16.1 15.1L20 0Z" />
    </svg>
  );
}

export default function CtaSection() {
  return (
    <section className="relative bg-marica-cream px-6 pb-20 lg:px-10 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-gradient-to-br from-marica-amber to-marica-amber-dark px-6 py-14 text-center shadow-[0_25px_60px_rgba(120,60,10,0.25)] sm:px-10 sm:py-16"
      >
        {/* decorative floating shapes */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -left-4 top-6 text-white/15"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <CloudShape className="h-16 w-28" />
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-4 bottom-4 text-white/15"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <CloudShape className="h-16 w-28" />
        </motion.div>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute bottom-8 right-10 text-white/20"
          animate={{ rotate: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <StarShape className="h-8 w-8" />
        </motion.div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:radial-gradient(rgba(255,255,255,0.6)_1.5px,transparent_1.5px)] [background-size:20px_20px]"
        />

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative z-10 font-display text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-[2.1rem]"
        >
          Siap Memulai Petualangan Belajar, Bersama Mari & Caca?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-white/85 sm:text-base"
        >
          Bergabunglah dengan ribuan keluarga lainnya yang telah mempercayakan
          pengalaman belajar anak mereka kepada Marica.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative z-10 mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full bg-marica-cream px-6 py-3 font-display text-sm font-semibold text-marica-amber-dark shadow-md transition-shadow hover:shadow-lg"
          >
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-6 py-3 font-display text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Hubungi Kami
            <MessageCircle className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}