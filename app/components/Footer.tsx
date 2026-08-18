"use client";

import { useEffect, useState } from "react";
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
  { label: "Beranda", href: "#beranda", active: true },
  { label: "Masalah", href: "#masalah" },
  { label: "Manfaat", href: "#manfaat" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "FAQ", href: "#faq" },
];

const layanan = [
  { label: "Books & Edugames", href: "/layanan" },
  { label: "Subscription", href: "/layanan" },
  { label: "Play & Interactive Zone", href: "/layanan" },
];

function TikTokIcon({ className }: { className?: string }) {
  return <FaTiktok className={className} />;
}

type ApiCompany = {
  name: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  logoUrl: string | null;
};

export default function Footer() {
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

  // Fallbacks
  const description = company?.description || "Pusat pengalaman edukasi keluarga berkonsep phygital yang memadukan ritel buku, board game edukatif, dan aktivitas interaktif.";
  const phone = company?.phone || "+62 858 7045 9329";
  const email = company?.email || "pt.sebangku@gmail.com";
  const website = company?.website || "www.marica.id";
  const instagramId = company?.instagram || "@kids.marica";

  // Clean phone for tel: link
  const phoneClean = phone.replace(/[^0-9+]/g, "");

  const socials = [
    { key: "youtube", icon: Youtube, href: company?.youtube || "#", label: "YouTube" },
    { key: "tiktok", icon: TikTokIcon, href: company?.tiktok || "#", label: "TikTok" },
    { key: "instagram", icon: Instagram, href: company?.instagram ? `https://instagram.com/${company.instagram.replace('@', '')}` : "#", label: "Instagram" },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#f7ead2]">
      <div className="relative px-6 py-14 sm:px-10 lg:px-16">

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
              src={company?.logoUrl || "/images/logo.png"}
              alt={`${company?.name || "Marica"} - Math with a Smile`}
              width={200}
              height={80}
              className="h-auto w-full select-none"
              priority
            />
          </motion.div>

          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-marica-ink-soft">
            {description}
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
                  className="group inline-flex items-center font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-ink"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-marica-ink transition-all duration-300 group-hover:w-full" />
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
                  className="group inline-flex items-center font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-ink"
                >
                  <span className="relative">
                    {item.label}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-marica-ink transition-all duration-300 group-hover:w-full" />
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
                href={`tel:${phoneClean}`}
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-ink"
              >
                <Phone className="h-4 w-4 shrink-0" />
                {phone}
              </a>
            </li>

            <li>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-ink"
              >
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </a>
            </li>

            <li>
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                className="flex items-center gap-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:text-marica-ink"
              >
                <Globe className="h-4 w-4 shrink-0" />
                {website.replace(/^https?:\/\//, '')}
              </a>
            </li>
          </ul>

          <div className="mt-5 flex items-center gap-2.5">
            {socials.map((s, i) => (
              <motion.a
                key={s.key}
                href={s.href}
                aria-label={s.label}
                target="_blank"
                rel="noopener noreferrer"
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
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-marica-amber-dark shadow-sm transition-colors hover:bg-marica-ink hover:text-white"
              >
                <s.icon className="h-4 w-4" />
              </motion.a>
            ))}

            <span className="ml-1 font-body text-sm text-marica-ink-soft">
              {instagramId}
            </span>
          </div>
        </motion.div>
        </motion.div>
      </div>

      {/* bottom bar */}
      <div className="relative bg-[#f2ddba] px-6 py-5 sm:px-10 lg:px-16">
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          style={{ originX: 0.5 }}
          className="mx-auto mb-4 h-px w-full max-w-7xl bg-marica-ink/10"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-center font-body text-xs text-marica-ink-soft"
        >
          © 2025 {company?.name || "Marica Experience Store"} - PT Sebangku Jaya Abadi. All rights
          reserved.
        </motion.p>
      </div>
    </footer>
  );
}