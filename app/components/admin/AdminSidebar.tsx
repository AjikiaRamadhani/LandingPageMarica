"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  Newspaper,
  Tags,
  CalendarDays,
  Palette,
  Briefcase,
  Settings,
  Lock,
  Menu,
  X,
  LogOut,
  ArrowLeft,
  ChevronDown,
} from "lucide-react";

// Item yang benar-benar sudah punya halaman. Selain "Dashboard", "Artikel",
// dan "Kategori", sisanya belum diminta/dibuat — daripada bikin link mati
// yang pura-pura berfungsi, item itu ditandai "Segera" dan non-klikable.
// Kalau menu lain sudah ada implementasinya, tinggal pindah ke daftar
// `enabled` di bawah.
const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, enabled: true },
  { label: "Program", href: "/admin/program", icon: GraduationCap, enabled: false },
  { label: "Artikel", href: "/admin/artikel", icon: Newspaper, enabled: true },
  { label: "Kategori", href: "/admin/kategori", icon: Tags, enabled: true },
  { label: "Event", href: "/admin/event", icon: CalendarDays, enabled: false },
  { label: "Kreativitas", href: "/admin/kreativitas", icon: Palette, enabled: false },
  { label: "Business", href: "/admin/business", icon: Briefcase, enabled: false },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings, enabled: false },
];

// Kartu profil + menu popup (Kembali ke situs / Keluar) yang nempel di
// bagian bawah sidebar. Dipakai bareng oleh versi desktop (statis) dan
// versi mobile (drawer), makanya ada `onNavigate` buat nutup drawer begitu
// salah satu aksi dipilih di mobile.
function AccountMenu({
  name,
  email,
  onNavigate,
}: {
  name?: string | null;
  email?: string | null;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const initial = (name ?? email ?? "A").trim().charAt(0).toUpperCase();

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative border-t border-black/5 px-3 py-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-3 right-3 mb-2 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-xl"
          >
            <Link
              href="/"
              onClick={() => {
                setIsOpen(false);
                onNavigate?.();
              }}
              className="flex items-center gap-3 px-4 py-3 font-body text-sm font-medium text-marica-ink-soft transition-colors hover:bg-marica-sky-light/60 hover:text-marica-ink"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke situs
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 border-t border-black/5 px-4 py-3 font-body text-sm font-semibold text-marica-rose-deep transition-colors hover:bg-marica-rose-deep/10"
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={`flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25 ${
          isOpen ? "bg-marica-sky-light/60" : "hover:bg-marica-sky-light/60"
        }`}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-marica-amber-dark font-body text-sm font-semibold text-white ring-2 ring-white"
        >
          {initial}
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-sm font-semibold leading-tight text-marica-ink">
            {name ?? "Admin"}
          </p>
          <p className="truncate font-body text-xs leading-tight text-marica-ink-soft/70">{email}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-marica-ink-soft/50 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
}

// Isi sidebar dipakai bareng oleh versi desktop (statis) dan versi mobile
// (drawer). `onNavigate` dipakai buat nutup drawer begitu link/aksi dipilih
// di mobile; di desktop prop ini tidak dikirim jadi tidak ngefek.
function SidebarContent({
  name,
  email,
  onNavigate,
}: {
  name?: string | null;
  email?: string | null;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex items-center gap-2 px-6 py-6">
        <Image
          src="/images/logo.png"
          alt="Marica"
          width={160}
          height={40}
          className="h-7 w-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <span className="rounded-full bg-marica-ink px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
        {navItems.map((item) => {
          const isActive =
            item.enabled && pathname.startsWith(item.href) && item.href !== "/admin"
              ? true
              : pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                aria-disabled
                title="Segera hadir"
                className="flex cursor-not-allowed items-center justify-between rounded-xl px-3.5 py-2.5 font-body text-sm text-marica-ink-soft/40"
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </span>
                <Lock className="h-3 w-3" />
              </div>
            );
          }

          return (
            <Link key={item.label} href={item.href} onClick={onNavigate} className="relative">
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-marica-amber-dark shadow-sm"
                />
              )}
              <span
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25 ${
                  isActive
                    ? "text-white"
                    : "text-marica-ink-soft hover:bg-marica-sky-light/60 hover:text-marica-ink"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Profil admin + menu "Kembali ke situs" / "Keluar", menempel di
          bagian bawah-kiri baik di drawer mobile maupun sidebar desktop. */}
      <AccountMenu name={name} email={email} onNavigate={onNavigate} />
    </>
  );
}

export default function AdminSidebar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Strip atas khusus mobile: logo + tombol buka menu. Sidebar penuh
          (termasuk profil akun di bagian bawah) disembunyikan di mobile
          supaya tidak makan lebar layar; diganti drawer yang muncul saat
          tombol menu ditekan. */}
      <div className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Marica"
            width={140}
            height={36}
            className="h-6 w-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="rounded-full bg-marica-ink px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
            Admin
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Buka menu navigasi"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-marica-ink-soft transition hover:bg-marica-sky-light/60 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Drawer mobile + backdrop, hanya dirender saat dibuka */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="admin-sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 md:hidden"
            />
            <motion.aside
              key="admin-sidebar-drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-50 flex h-screen w-72 max-w-[85vw] flex-col bg-white shadow-2xl md:hidden"
            >
              <div className="flex items-center justify-end px-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Tutup menu navigasi"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-marica-ink-soft transition hover:bg-marica-sky-light/60 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent name={name} email={email} onNavigate={() => setIsOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Sidebar statis untuk desktop (md ke atas) — profil akun & menu
          sama persis dengan versi mobile, sama-sama di kiri bawah. */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-white md:flex">
        <SidebarContent name={name} email={email} />
      </aside>
    </>
  );
}
