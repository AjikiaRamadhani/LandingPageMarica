"use client";

import type { MouseEvent } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#beranda", active: true },
  { label: "Masalah", href: "#masalah" },
  { label: "Manfaat", href: "#manfaat" },
  { label: "Testimoni", href: "#testimoni" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "FAQ", href: "#faq" },
];

type ApiCompany = {
  name: string;
  logoUrl: string | null;
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("#beranda");

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

  // Header sticky: begitu halaman digeser turun, background gradient-transparan
  // diganti jadi putih solid + blur + shadow supaya tetap terbaca rapi di atas
  // section apa pun yang lewat di belakangnya.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-spy: setiap kali user scroll, cek ulang posisi tiap section
  // (bukan cuma sekali di awal) supaya tetap akurat walau section tertentu
  // baru muncul di DOM belakangan — misalnya karena datanya masih di-fetch
  // saat Navbar pertama kali mount. Menu aktif = section terakhir yang sudah
  // terlewati dari titik acuan di ~35% tinggi viewport.
  useEffect(() => {
    const hashLinks = navLinks
      .map((link) => link.href)
      .filter((href) => href.startsWith("#") && href !== "#");

    const handleScroll = () => {
      if (window.scrollY < 80) {
        setActiveHref("#beranda");
        return;
      }

      const referenceY = window.scrollY + window.innerHeight * 0.35;
      let current = "#beranda";

      for (const href of hashLinks) {
        const el = document.querySelector(href);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= referenceY) {
          current = href;
        }
      }

      setActiveHref(current);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Di mobile, menu ditutup dulu (animasi ~300ms) baru discroll ke section
  // tujuan. Kalau scroll dan animasi penutupan dijalankan bersamaan, layout
  // yang berubah saat menu menutup bisa mengacaukan posisi scroll sehingga
  // terasa seperti "tidak menggeser" sama sekali.
  const handleMobileNavClick = (e: MouseEvent<HTMLAnchorElement>, href: string) => {
    setActiveHref(href);
    if (!href.startsWith("#") || href === "#") return;
    e.preventDefault();
    setIsOpen(false);

    window.setTimeout(() => {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 320);
  };

  return (
    <header className="sticky top-0 z-30 isolate">
      {/* layer 1: cream-to-transparent gradient, blends into Hero at the top of the page */}
      <motion.div
        aria-hidden
        animate={{ opacity: scrolled ? 0 : 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-marica-cream via-marica-cream/70 to-transparent"
      />

      {/* layer 2: solid, blurred, with shadow — fades in once the page is scrolled so the header stays readable over any section */}
      <motion.div
        aria-hidden
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 -z-10 bg-white/90 shadow-[0_8px_24px_rgba(120,60,10,0.1)] backdrop-blur-md"
      />
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src={company?.logoUrl || "/images/logo.png"}
            alt={company?.name || "Marica"}
            width={434}
            height={145}
            priority
            className="h-8 w-auto object-contain sm:h-9"
          />
          {/* <span className="font-display text-base font-semibold text-marica-amber-text lg:text-xl">
            {company?.name || "Marica"}
          </span> */}
        </a>

        {/* Nav links — absolutely centered relative to the whole navbar, not just the space left after the logo */}
        <div
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 font-body text-[15px] font-medium text-marica-ink-soft lg:flex"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navLinks.map((link, i) => {
            const isHighlighted = hoveredIndex === i || (hoveredIndex === null && link.href === activeHref);
            return (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHoveredIndex(i)}
                onClick={() => setActiveHref(link.href)}
                className={`relative rounded-full px-3 py-1.5 transition-colors ${
                  isHighlighted ? "text-marica-amber-text" : "hover:text-marica-ink"
                }`}
              >
                {isHighlighted && (
                  <motion.span
                    layoutId="nav-hover-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-marica-amber/15"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </a>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-marica-ink lg:hidden"
        >
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.span
                key="close"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </motion.span>
            ) : (
              <motion.span
                key="menu"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Menu className="h-6 w-6" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-20 overflow-hidden lg:hidden"
          >
            <motion.div
              initial={{ y: -8 }}
              animate={{ y: 0 }}
              exit={{ y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-6 mb-5 flex flex-col gap-1 rounded-2xl bg-white p-3 shadow-[0_14px_35px_rgba(120,60,10,0.15)]"
            >
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleMobileNavClick(e, link.href)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className={
                    link.href === activeHref
                      ? "rounded-xl bg-marica-amber/15 px-4 py-2.5 font-body text-[15px] font-medium text-marica-amber-text"
                      : "rounded-xl px-4 py-2.5 font-body text-[15px] font-medium text-marica-ink-soft transition hover:bg-marica-amber/10 hover:text-marica-ink"
                  }
                >
                  {link.label}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}