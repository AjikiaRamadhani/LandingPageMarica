"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

// Catatan: /belanja, /aktivitas, /edugames, /event belum ada halamannya —
// hrefnya sudah disiapkan lebih dulu supaya begitu halaman dibuat, tinggal
// dipasang di App Router tanpa perlu balik ke sini. /artikel sudah live.
const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Belanja", href: "/belanja" },
  { label: "Aktivitas", href: "/aktivitas" },
  { label: "Edugames", href: "/edugames" },
  { label: "Event", href: "/event" },
  { label: "Blog", href: "/artikel" },
];

type ApiCompany = {
  name: string;
  logoUrl: string | null;
};

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState<string>("/");
  const [profileOpen, setProfileOpen] = useState(false);

  // Menu aktif mengikuti route saat ini. startsWith dipakai supaya halaman
  // detail (mis. /artikel/slug-nya) tetap menyorot menu "Blog" sebagai induknya.
  useEffect(() => {
    const routeLink = navLinks.find(
      (link) =>
        pathname === link.href ||
        (link.href !== "/" && pathname?.startsWith(`${link.href}/`))
    );
    setActiveHref(routeLink?.href ?? pathname ?? "/");
  }, [pathname]);

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

  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Tutup dropdown profil kalau user klik di luar area dropdown-nya.
  useEffect(() => {
    if (!profileOpen) return;
    const handleClickOutside = (e: PointerEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleClickOutside);
    return () => document.removeEventListener("pointerdown", handleClickOutside);
  }, [profileOpen]);

  // Header sticky: begitu halaman digeser turun, background gradient-transparan
  // diganti jadi putih solid + blur + shadow supaya tetap terbaca rapi di atas
  // section apa pun yang lewat di belakangnya.
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Semua item nav sekarang route halaman asli (bukan hash section di
  // satu halaman panjang), jadi klik di mobile tinggal set active lalu
  // tutup menu — navigasinya sendiri ditangani default <a href>.
  const handleMobileNavClick = (href: string) => {
    setActiveHref(href);
    setIsOpen(false);
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

        {/* Right side: auth pills (desktop) + mobile menu button */}
        <div className="flex shrink-0 items-center gap-3">
          {status === "loading" ? (
            // Skeleton kecil biar tidak "flash" antara logged-out -> logged-in saat sesi masih dicek
            <div className="hidden h-9 w-24 animate-pulse rounded-full bg-marica-ink/5 lg:block" />
          ) : isLoggedIn ? (
            <div className="relative hidden lg:block" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                className="flex items-center gap-2 rounded-full border border-marica-ink/10 bg-white py-1.5 pl-1.5 pr-3.5 shadow-sm transition hover:bg-marica-cream"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-marica-amber/20 text-marica-amber-dark">
                  <User className="h-4 w-4" />
                </span>
                <span className="max-w-[120px] truncate font-body text-sm font-semibold text-marica-ink">
                  {session?.user?.name?.split(" ")[0] || "Akun"}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 text-marica-ink-soft transition-transform ${profileOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl bg-white shadow-[0_14px_35px_rgba(120,60,10,0.15)]"
                  >
                    <div className="flex items-center gap-3 border-b border-black/5 px-4 py-3.5">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marica-amber/20 text-marica-amber-dark">
                        <User className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-marica-ink">
                          {session?.user?.name || "Pengguna"}
                        </p>
                        <p className="truncate font-body text-xs text-marica-ink-soft">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex w-full items-center gap-2.5 border-b border-black/5 px-4 py-3 font-body text-sm font-medium text-marica-ink-soft transition hover:bg-marica-cream hover:text-marica-ink"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard Admin
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-3 font-body text-sm font-medium text-marica-ink-soft transition hover:bg-marica-cream hover:text-marica-ink"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <a
                href="/login"
                className="hidden items-center justify-center rounded-full border border-marica-ink/10 bg-white px-5 py-2 font-body text-sm font-semibold text-marica-ink shadow-sm transition hover:bg-marica-cream lg:inline-flex"
              >
                Masuk
              </a>

              <a
                href="/daftar"
                className="hidden items-center justify-center rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 lg:inline-flex"
              >
                Daftar Sekarang
              </a>
            </>
          )}

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
        </div>
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
                  onClick={() => handleMobileNavClick(link.href)}
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

              <div className="mt-2 flex flex-col gap-2">
                {isLoggedIn ? (
                  <motion.div
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: navLinks.length * 0.05 }}
                    className="rounded-xl bg-marica-cream/60 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marica-amber/20 text-marica-amber-dark">
                        <User className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-body text-sm font-semibold text-marica-ink">
                          {session?.user?.name || "Pengguna"}
                        </p>
                        <p className="truncate font-body text-xs text-marica-ink-soft">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-marica-ink/10 bg-white py-2 font-body text-sm font-semibold text-marica-ink-soft"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard Admin
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-marica-ink/10 bg-white py-2 font-body text-sm font-semibold text-marica-ink-soft"
                    >
                      <LogOut className="h-4 w-4" />
                      Keluar
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <motion.a
                      href="/login"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: navLinks.length * 0.05 }}
                      className="rounded-xl border border-marica-ink/10 bg-white px-4 py-2.5 text-center font-body text-[15px] font-semibold text-marica-ink"
                    >
                      Masuk
                    </motion.a>
                    <motion.a
                      href="/register"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: (navLinks.length + 1) * 0.05 }}
                      className="rounded-xl bg-marica-amber-dark px-4 py-2.5 text-center font-body text-[15px] font-semibold text-white"
                    >
                      Daftar Sekarang
                    </motion.a>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}