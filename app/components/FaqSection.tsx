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
      "Aktivitas dan produk Marica dirancang khusus untuk anak usia 2 hingga 12 tahun, mulai dari balita (pendampingan orang tua) hingga anak usia sekolah dasar.",
  },
  {
    key: "reservasi",
    emoji: "📅",
    iconBg: "bg-marica-blue/20",
    iconText: "text-[#1f5f83]",
    question:
      "Apakah harus reservasi terlebih dahulu jika ingin datang main ke Marica Experience Store?",
    answer:
      "Bunda bisa langsung datang (walk-in) untuk area bermain (Playpass) dan sewa meja board game. Namun, untuk Weekend Workshop dan kelas khusus, kami menyarankan reservasi terlebih dahulu agar kepastian slot tempat terjamin.",
  },
  {
    key: "edukit",
    emoji: "📦",
    iconBg: "bg-marica-amber-dark/15",
    iconText: "text-marica-amber-dark",
    question: "Apa isi dari paket berlangganan Edu-Kit bulanan Marica?",
    answer:
      "Paket Edu-Kit berisi kotak aktivitas mandiri terstruktur (craft kit, permainan logika/sains, atau board game) yang dilengkapi panduan belajar interaktif dan dikirim rutin langsung ke rumah setiap bulan.",
  },
  {
    key: "keamanan",
    emoji: "🛡️",
    iconBg: "bg-marica-maroon/15",
    iconText: "text-marica-maroon",
    question: "Apakah tempatnya nyaman dan aman untuk balita dan keluarga?",
    answer:
      "Sangat aman dan nyaman! Seluruh area bermain fisik, fasilitas meja, dan alat peraga kami selalu dibersihkan secara berkala, ramah anak, serta didampingi oleh staf/fasilitator yang telaten.",
  },
  {
    key: "acara",
    emoji: "🎉",
    iconBg: "bg-marica-amber/20",
    iconText: "text-marica-amber-text",
    question:
      "Bisakah Marica menyelenggarakan acara sekolah, privat, atau ulang tahun?",
    answer:
      "Sangat bisa! Kami menyediakan paket perayaan ulang tahun edukatif, penyewaan seluruh area toko (space renting), hingga program pelatihan media ajar edugame untuk guru dan sekolah.",
  },
];

function CloudShape({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 40"
      className={className}
      fill="currentColor"
      aria-hidden
    >
      <path d="M50 40H14C6.268 40 0 33.732 0 26C0 18.268 6.268 12 14 12C14.676 12 15.343 12.048 16 12.14C18.28 5.06 24.928 0 32.8 0C41.316 0 48.44 5.936 50.28 13.868C50.52 13.856 50.76 13.848 51 13.848C58.18 13.848 64 19.668 64 26.848C64 34.028 58.18 40 51 40H50Z" />
    </svg>
  );
}

export default function FaqSection() {
  const [openKey, setOpenKey] = useState<string | null>(faqs[0].key);

  return (
    <section className="relative overflow-hidden bg-marica-amber px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
      {/* decorative floating clouds */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-4 top-16 text-white/25"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <CloudShape className="h-12 w-20 sm:h-16 sm:w-28" />
      </motion.div>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-4 top-10 text-white/20"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      >
        <CloudShape className="h-10 w-16 sm:h-14 sm:w-24" />
      </motion.div>
      <div
        aria-hidden
        className="pointer-events-none absolute right-0 top-1/3 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-semibold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          FAQ
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink/75 sm:text-base"
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
              viewport={{
                once: true,
                amount: 0.3,
                margin: "0px 0px -60px 0px",
              }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl bg-marica-cream shadow-[0_8px_20px_rgba(120,60,10,0.15)]"
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

      {/* animated wave at the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 overflow-hidden leading-[0] sm:h-10"
      >
        <motion.svg
          viewBox="0 0 2400 60"
          className="h-full w-[200%]"
          preserveAspectRatio="none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M0 30C100 5 200 5 300 30C400 55 500 55 600 30C700 5 800 5 900 30C1000 55 1100 55 1200 30C1300 5 1400 5 1500 30C1600 55 1700 55 1800 30C1900 5 2000 5 2100 30C2200 55 2300 55 2400 30V60H0V30Z"
            fill="#a9d9f0"
          />
        </motion.svg>
      </div>
    </section>
  );
}