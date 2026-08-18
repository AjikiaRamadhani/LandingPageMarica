"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { FaInstagram as Instagram } from "react-icons/fa6";

type ApiCompany = {
  phone: string | null;
  instagram: string | null;
  address: string | null;
};

export default function CtaSection() {
  const [company, setCompany] = useState<ApiCompany | null>(null);

  useEffect(() => {
    fetch("/api/company")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setCompany(data);
        }
      })
      .catch((err) => console.error("Failed to load company profile", err));
  }, []);

  const phoneRaw = company?.phone || "+62 822 2149 1429";
  const phoneClean = phoneRaw.replace(/[^0-9+]/g, "");
  const waLink = `https://wa.me/${phoneClean.replace('+', '')}`;
  const igLink = company?.instagram ? `https://instagram.com/${company.instagram.replace('@', '')}` : "#";
  const mapsLink = company?.address ? `https://maps.google.com/?q=${encodeURIComponent(company.address)}` : "#";

  const contacts = [
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, href: waLink },
    { key: "instagram", label: "Instagram", icon: Instagram, href: igLink },
    { key: "location", label: "Location", icon: MapPin, href: mapsLink },
  ];

  return (
    <section className="relative overflow-hidden bg-marica-amber px-6 pb-16 pt-16 lg:px-10 lg:pb-20 lg:pt-20">
      {/* animated wave at the top edge, flowing in from the FAQ section above */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-10 overflow-hidden leading-[0] sm:h-14"
      >
        <motion.svg
          viewBox="0 0 2400 60"
          className="h-full w-[200%]"
          preserveAspectRatio="none"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M0 30C100 5 200 5 300 30C400 55 500 55 600 30C700 5 800 5 900 30C1000 55 1100 55 1200 30C1300 5 1400 5 1500 30C1600 55 1700 55 1800 30C1900 5 2000 5 2100 30C2200 55 2300 55 2400 30V0H0V30Z"
            fill="#f1cfa6"
          />
        </motion.svg>
      </div>

      {/* soft decorative glow, same language as the footer below */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-white/10 blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-marica-cream px-6 py-12 shadow-[0_25px_60px_rgba(120,60,10,0.2)] sm:px-10 sm:py-14 lg:px-14"
      >
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
          {/* Copy */}
          <div className="text-center lg:text-left">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-2xl font-bold leading-tight text-marica-ink sm:text-3xl lg:text-[2.1rem]"
            >
              Siap Menciptakan Momen Belajar Terbaik Bersama Si Kecil
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink-soft sm:text-base lg:mx-0"
            >
              Bergabunglah dengan ribuan keluarga lainnya dan temukan cara
              baru yang menyenangkan untuk mendukung tumbuh kembang anak.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-7 flex justify-center lg:justify-start"
            >
              <motion.a
                href="#"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-sm font-semibold text-marica-ink shadow-[0_10px_24px_rgba(120,60,10,0.15)] transition-shadow hover:shadow-[0_14px_30px_rgba(120,60,10,0.22)]"
              >
                Eksplor Serunya Marica
                <ArrowRight className="h-4 w-4" />
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-7 flex items-center justify-center gap-6 lg:justify-start"
            >
              {contacts.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center gap-1.5 font-body text-xs text-marica-ink-soft transition-colors hover:text-marica-ink"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-marica-ink/15 text-marica-ink-soft transition-colors group-hover:border-marica-ink/30 group-hover:text-marica-ink">
                    <c.icon className="h-4 w-4" />
                  </span>
                  {c.label}
                </a>
              ))}
            </motion.div>
          </div>

          {/* Mascot */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mx-auto w-full max-w-[220px] sm:max-w-[260px] lg:max-w-[280px]"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/trust-mascot.png"
                alt="Maskot Marica"
                width={280}
                height={270}
                className="h-auto w-full object-contain"
              />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}