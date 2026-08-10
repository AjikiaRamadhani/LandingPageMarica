"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Beranda", href: "#", active: true },
  { label: "Program", href: "#program" },
  { label: "Aktivitas", href: "#aktivitas" },
  // { label: "Event", href: "#event" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="relative z-30">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 lg:px-10">
        {/* Logo */}
        <a href="/" className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="Marica"
            width={500}
            height={500}
            priority
            className="h-15 w-20 object-contain"
          />
          {/* <span className="font-display text-base font-semibold text-marica-amber-text lg:text-xl">
            Marica
          </span> */}
        </a>

        {/* Nav links */}
        <div className="hidden items-center gap-8 font-body text-[15px] font-medium text-marica-ink-soft lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className={
                link.active
                  ? "relative pb-1 text-marica-amber-text after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-marica-amber-dark"
                  : "transition hover:text-marica-ink"
              }
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Auth button */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <a
            href="#"
            className="rounded-full bg-gradient-to-b from-marica-amber to-marica-amber-dark px-7 py-2.5 font-display text-[15px] font-medium text-white shadow-sm shadow-marica-amber-dark/30 transition hover:brightness-105"
          >
            Masuk
          </a>
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
            className="overflow-hidden lg:hidden"
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
                  onClick={() => setIsOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className={
                    link.active
                      ? "rounded-xl bg-marica-amber/15 px-4 py-2.5 font-body text-[15px] font-medium text-marica-amber-text"
                      : "rounded-xl px-4 py-2.5 font-body text-[15px] font-medium text-marica-ink-soft transition hover:bg-marica-amber/10 hover:text-marica-ink"
                  }
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.a
                href="#"
                onClick={() => setIsOpen(false)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: navLinks.length * 0.05 }}
                className="mt-2 rounded-xl bg-gradient-to-b from-marica-amber to-marica-amber-dark px-4 py-2.5 text-center font-display text-[15px] font-medium text-white shadow-sm shadow-marica-amber-dark/30"
              >
                Masuk
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}