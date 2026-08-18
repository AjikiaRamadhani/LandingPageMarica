"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";

const defaultFaqs = [
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
      "Bisakah Marica menyelenggarkan acara sekolah, privat, atau ulang tahun?",
    answer:
      "Sangat bisa! Kami menyediakan paket perayaan ulang tahun edukatif, penyewaan seluruh area toko (space renting), hingga program pelatihan media ajar edugame untuk guru dan sekolah.",
  },
];

type ApiFaq = {
  id: string;
  question: string;
  answer: string;
  icon: string | null;
  order: number;
};

export default function FaqSection() {
  const [faqs, setFaqs] = useState(defaultFaqs);
  const [openKey, setOpenKey] = useState<string | null>(defaultFaqs[0].key);

  useEffect(() => {
    fetch("/api/faqs")
      .then((res) => res.json())
      .then((data: ApiFaq[]) => {
        if (Array.isArray(data) && data.length > 0) {
          const mergedFaqs = data.map((item, i) => {
            const defaultFaq = defaultFaqs[i % defaultFaqs.length];
            return {
              ...defaultFaq,
              key: item.id,
              question: item.question,
              answer: item.answer,
              emoji: item.icon || defaultFaq.emoji,
            };
          });
          setFaqs(mergedFaqs);
          setOpenKey(mergedFaqs[0].key);
        }
      })
      .catch((err) => console.error("Failed to load faqs", err));
  }, []);

  return (
    <section id="faq" className="section-sand-bg relative overflow-hidden px-6 py-20 lg:px-10 lg:py-28">
      {/* decorative glow blobs, consistent with the rest of the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 top-10 h-56 w-56 rounded-full bg-marica-amber/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 bottom-0 h-64 w-64 rounded-full bg-marica-blue/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="font-display text-[1.7rem] font-bold leading-tight text-marica-ink sm:text-3xl lg:text-[2.2rem]"
        >
          FAQ
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-3 max-w-xl font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base"
        >
          Masih ada pertanyaan? Kami sudah merangkum pertanyaan yang paling
          sering ditanyakan oleh Bunda.
        </motion.p>
      </div>

      <div className="relative z-10 mx-auto mt-14 max-w-2xl space-y-5 lg:mt-16">
        {faqs.map((item, i) => {
          const isOpen = openKey === item.key;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{
                once: true,
                amount: 0.3,
                margin: "0px 0px -60px 0px",
              }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_40px_rgba(120,60,10,0.15)] transition-shadow hover:shadow-[0_24px_50px_rgba(120,60,10,0.22)]"
            >
              <button
                type="button"
                onClick={() => setOpenKey(isOpen ? null : item.key)}
                className="flex w-full items-center gap-4 p-6 text-left sm:p-7"
                aria-expanded={isOpen}
              >
                <span
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl ${item.iconBg} ${item.iconText}`}
                >
                  {item.emoji}
                </span>
                <span className="flex-1 font-display text-base font-bold leading-snug text-marica-ink sm:text-lg">
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marica-amber/15 text-marica-amber-dark"
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
                    <p className="px-6 pb-6 pl-[5.5rem] font-body text-sm leading-relaxed text-marica-ink-soft sm:px-7 sm:pl-[5.75rem] sm:text-base">
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