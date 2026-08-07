"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaPhone as Phone,
  FaEnvelope as Mail,
  FaYoutube as Youtube,
  FaInstagram as Instagram,
  FaGlobe as Globe,
  FaTiktok,
} from "react-icons/fa6";

const navigasi = [
  { label: "Beranda", href: "#" },
  { label: "Tentang Kami", href: "#" },
  { label: "Kursus", href: "#" },
  { label: "Kontak", href: "#" },
];

const layanan = [
  { label: "Kursus Membaca", href: "#" },
  { label: "Kursus Menulis", href: "#" },
  { label: "Kursus Berhitung", href: "#" },
  { label: "Workshop", href: "#" },
];

function TikTokIcon({ className }: { className?: string }) {
  return <FaTiktok className={className} />;
}

const socials = [
  { key: "youtube", icon: Youtube, href: "#", label: "YouTube" },
  { key: "tiktok", icon: TikTokIcon, href: "#", label: "TikTok" },
  { key: "instagram", icon: Instagram, href: "#", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden rounded-t-[2.5rem] bg-marica-cream px-6 py-14 sm:px-10 lg:px-16">
      {/* soft decorative blobs */}
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-marica-amber/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-marica-amber/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto grid max-w-7xl gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr]"
      >
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.04, rotate: -1 }}
            transition={{ type: "spring", stiffness: 300, damping: 12 }}
            className="w-32"
          >
            <Image
              src="/images/logo.png"
              alt="Marica - Math with a Smile"
              width={200}
              height={80}
              className="h-auto w-full select-none"
              priority
            />
          </motion.div>

          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-marica-ink-soft">
            Platform edukasi Calistung terbaik untuk anak-anak Indonesia
          </p>
        </motion.div>

        {/* Navigasi */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h4 className="font-display text-sm font-bold tracking-wide text-marica-ink">
            Navigasi
          </h4>

          <ul className="mt-4 space-y-3">
            {navigasi.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-amber-dark"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-marica-amber-dark transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Layanan */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.18 }}
        >
          <h4 className="font-display text-sm font-bold tracking-wide text-marica-ink">
            Layanan
          </h4>

          <ul className="mt-4 space-y-3">
            {layanan.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="group inline-flex items-center font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-amber-dark"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-marica-amber-dark transition-all duration-300 group-hover:w-full" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Kontak */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, delay: 0.26 }}
        >
          <h4 className="font-display text-sm font-bold tracking-wide text-marica-ink">
            Kontak
          </h4>

          <ul className="mt-4 space-y-3">
            <li>
              <a
                href="tel:+6282221491429"
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-amber-dark"
              >
                <Phone className="h-4 w-4 shrink-0" />
                +62 822 2149 1429
              </a>
            </li>

            <li>
              <a
                href="mailto:pt.sebangku@gmail.com"
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-amber-dark"
              >
                <Mail className="h-4 w-4 shrink-0" />
                pt.sebangku@gmail.com
              </a>
            </li>

            <li>
              <a
                href="https://marica.id"
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-amber-dark"
              >
                <Globe className="h-4 w-4 shrink-0" />
                www.marica.id
              </a>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-2.5">
            {socials.map((s, i) => (
              <motion.a
                key={s.key}
                href={s.href}
                aria-label={s.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{
                  type: "spring",
                  stiffness: 340,
                  damping: 15,
                  delay: 0.4 + i * 0.08,
                }}
                whileHover={{ scale: 1.15, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-marica-amber/15 text-marica-amber-dark transition-colors hover:bg-marica-amber-dark hover:text-white"
              >
                <s.icon className="h-4 w-4" />
              </motion.a>
            ))}

            <span className="ml-1 font-body text-sm text-marica-ink-soft">
              @kids.marica
            </span>
          </div>
        </motion.div>
      </motion.div>

      {/* divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.2 }}
        style={{ originX: 0.5 }}
        className="relative mx-auto mt-10 h-px w-full max-w-7xl bg-marica-ink/10"
      />

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative mt-6 text-center font-body text-xs text-marica-ink-soft/80"
      >
        © 2025 Marica Calistung - PT Sebangku Jaya Abadi. All rights
        reserved.
      </motion.p>
    </footer>
  );
}