"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const faqs = [
  {
    key: "usia",
    emoji: "👶",
    iconBg: "bg-[#e0507a]/15",
    iconText: "text-[#e0507a]",
    question: "Untuk anak usia berapa saja aktivitas dan produk di Marica?",
    answer:
      "Aktivitas dan produk Marica dirancang untuk anak usia 2–10 tahun, dengan tingkat kesulitan yang disesuaikan pada setiap modul agar sesuai tahap tumbuh kembang Si Kecil.",
  },
  {
    key: "reservasi",
    emoji: "📅",
    iconBg: "bg-marica-blue/20",
    iconText: "text-[#1f5f83]",
    question:
      "Apakah harus reservasi terlebih dahulu jika ingin datang main ke Marica Experience Store?",
    answer:
      "Disarankan untuk melakukan reservasi terlebih dahulu, terutama di akhir pekan, agar kami dapat menyiapkan aktivitas dan tempat terbaik untuk keluarga Anda.",
  },
  {
    key: "edukit",
    emoji: "📦",
    iconBg: "bg-marica-amber-dark/15",
    iconText: "text-marica-amber-dark",
    question: "Apa isi dari paket berlangganan Edu-Kit bulanan Marica?",
    answer:
      "Setiap paket Edu-Kit bulanan berisi modul aktivitas, alat belajar, dan panduan bermain yang dikembangkan bersama psikolog dan pendidik anak.",
  },
  {
    key: "keamanan",
    emoji: "🛡️",
    iconBg: "bg-marica-maroon/15",
    iconText: "text-marica-maroon",
    question: "Apakah tempatnya nyaman dan aman untuk balita dan keluarga?",
    answer:
      "Ya, seluruh area dan produk Marica telah melalui standar keamanan yang ketat serta divalidasi oleh ahli agar nyaman digunakan balita dan keluarga.",
  },
  {
    key: "acara",
    emoji: "🎉",
    iconBg: "bg-marica-amber/20",
    iconText: "text-marica-amber-text",
    question:
      "Bisakah Marica menyelenggarakan acara sekolah, privat, atau ulang tahun?",
    answer:
      "Tentu! Marica menyediakan paket acara sekolah, kelas privat, hingga ulang tahun edukatif yang bisa disesuaikan dengan kebutuhan Anda.",
  },
];

function CloudShape({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 40" className={className} fill="currentColor" aria-hidden>
      <path d="M50 40H14C6.268 40 0 33.732 0 26C0 18.268 6.268 12 14 12C14.676 12 15.343 12.048 16 12.14C18.28 5.06 24.928 0 32.8 0C41.316 0 48.44 5.936 50.28 13.868C50.52 13.856 50.76 13.848 51 13.848C58.18 13.848 64 19.668 64 26.848C64 34.028 58.18 40 51 40H50Z" />
    </svg>
  );
}

export default function FaqSection() {
  const [openKey, setOpenKey] = useState<string | null>(faqs[0].key);

  return (
    <section className="relative overflow-hidden bg-marica-cream px-6 py-20 lg:px-10 lg:py-28">
      <CloudShape className="pointer-events-none absolute -left-4 top-6 h-12 w-20 text-marica-amber/25 sm:h-16 sm:w-28" />
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-marica-amber/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          Frequently Asked Questions
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base"
        >
          Masih ada pertanyaan? Kami sudah merangkum pertanyaan yang paling
          sering ditanyakan oleh Bunda.
        </motion.p>
      </div>

      <div className="relative z-10 mx-auto mt-10 max-w-2xl space-y-3">
        {faqs.map((item, i) => {
          const isOpen = openKey === item.key;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3, margin: "0px 0px -60px 0px" }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl bg-white/70 shadow-[0_6px_18px_rgba(120,60,10,0.06)]"
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className="flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/60 sm:gap-4 sm:px-5"
                aria-expanded={isOpen}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base ${item.iconBg} ${item.iconText}`}
                >
                  {item.emoji}
                </span>
                <span className="flex-1 font-display text-sm font-semibold leading-snug text-marica-ink sm:text-base">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marica-amber/15 text-marica-amber-dark"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pl-16 font-body text-sm leading-relaxed text-marica-ink-soft sm:px-5 sm:pl-[4.25rem]">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}