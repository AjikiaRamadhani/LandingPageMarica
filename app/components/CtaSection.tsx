"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MapPin, MessageCircle } from "lucide-react";
import { FaInstagram as Instagram } from "react-icons/fa6";

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
    <section className="relative bg-marica-cream px-6 pb-20 lg:px-10 lg:pb-28">
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-gradient-to-br from-marica-amber to-marica-amber-dark px-6 py-12 shadow-[0_25px_60px_rgba(120,60,10,0.25)] sm:px-10 sm:py-14 lg:px-14"
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
              className="mx-auto mt-3 max-w-md font-body text-sm leading-relaxed text-marica-ink/70 sm:text-base lg:mx-0"
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
                className="inline-flex items-center gap-2 rounded-full bg-marica-cream px-6 py-3 font-display text-sm font-semibold text-marica-amber-dark shadow-md transition-shadow hover:shadow-lg"
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
              className="mt-6 flex items-center justify-center gap-5 lg:justify-start"
            >
              {contacts.map((c) => (
                <a
                  key={c.key}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 font-body text-xs font-medium text-marica-ink/70 transition-colors hover:text-marica-ink"
                >
                  <c.icon className="h-3.5 w-3.5" />
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