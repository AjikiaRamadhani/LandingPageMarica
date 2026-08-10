"use client";

import { motion } from "framer-motion";

/**
 * Kumpulan doodle dekoratif (bintang, garis lengkung, titik-titik) yang
 * disebar di background section beraksen oranye, supaya terasa seperti
 * ilustrasi yang digambar tangan, bukan gradient polos.
 * Pakai di dalam section dengan `position: relative` + `overflow-hidden`.
 */
export default function BackgroundDoodles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft glow blobs */}
      <div className="absolute -left-10 top-6 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-0 top-40 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

      {/* sparkle stars */}
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute left-[6%] top-[10%] h-6 w-6 text-white/40"
        animate={{ rotate: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M12 2l1.9 5.6L20 9.5l-5.6 1.9L12 17l-1.9-5.6L4 9.5l5.6-1.9L12 2z"
          fill="currentColor"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute right-[10%] top-[22%] h-4 w-4 text-white/35"
        animate={{ rotate: [0, -25, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <path
          d="M12 2l1.9 5.6L20 9.5l-5.6 1.9L12 17l-1.9-5.6L4 9.5l5.6-1.9L12 2z"
          fill="currentColor"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        className="absolute left-[18%] bottom-[14%] h-5 w-5 text-white/30"
        animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <path
          d="M12 2l1.9 5.6L20 9.5l-5.6 1.9L12 17l-1.9-5.6L4 9.5l5.6-1.9L12 2z"
          fill="currentColor"
        />
      </motion.svg>

      {/* squiggly line */}
      <motion.svg
        viewBox="0 0 120 40"
        fill="none"
        className="absolute right-[4%] bottom-[8%] h-10 w-28 text-white/30"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M2 20c8-14 16-14 24 0s16 14 24 0 16-14 24 0 16 14 24 0"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>

      <motion.svg
        viewBox="0 0 120 40"
        fill="none"
        className="absolute left-[2%] top-[45%] h-8 w-24 text-white/20"
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <path
          d="M2 20c8-14 16-14 24 0s16 14 24 0 16-14 24 0 16 14 24 0"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>

      {/* dot clusters */}
      <motion.div
        className="absolute right-[22%] top-[8%] flex gap-2"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="h-2 w-2 rounded-full bg-white/35" />
        <span className="h-2 w-2 rounded-full bg-white/25" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
      </motion.div>

      <motion.div
        className="absolute left-[8%] bottom-[24%] flex gap-2"
        animate={{ y: [0, 5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
      </motion.div>

      {/* wavy dashed circle, like a hand-drawn "highlight" */}
      <motion.svg
        viewBox="0 0 100 100"
        fill="none"
        className="absolute right-[16%] bottom-[30%] h-16 w-16 text-white/20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        <circle
          cx="50"
          cy="50"
          r="42"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="6 10"
          strokeLinecap="round"
        />
      </motion.svg>
    </div>
  );
}