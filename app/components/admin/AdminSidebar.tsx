"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GraduationCap,
  Newspaper,
  CalendarDays,
  Palette,
  Briefcase,
  Settings,
  Lock,
} from "lucide-react";

// Item yang benar-benar sudah punya halaman. Selain "Artikel", sisanya
// belum diminta/dibuat — daripada bikin link mati yang pura-pura berfungsi,
// item itu ditandai "Segera" dan non-klikable. Kalau menu lain sudah ada
// implementasinya, tinggal pindah ke daftar `enabled` di bawah.
const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, enabled: false },
  { label: "Program", href: "/admin/program", icon: GraduationCap, enabled: false },
  { label: "Artikel", href: "/admin/artikel", icon: Newspaper, enabled: true },
  { label: "Event", href: "/admin/event", icon: CalendarDays, enabled: false },
  { label: "Kreativitas", href: "/admin/kreativitas", icon: Palette, enabled: false },
  { label: "Business", href: "/admin/business", icon: Briefcase, enabled: false },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings, enabled: false },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-black/5 bg-white">
      <div className="flex items-center gap-2 px-6 py-6">
        <Image src="/images/logo-marica.png" alt="Marica" width={32} height={32} className="h-8 w-8" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        <span className="font-display text-lg font-semibold text-marica-ink">Marica</span>
        <span className="rounded-full bg-marica-ink px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-white">
          Admin
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = item.enabled && pathname.startsWith(item.href) && item.href !== "/admin" ? true : pathname === item.href;
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
            <Link key={item.label} href={item.href} className="relative">
              {isActive && (
                <motion.span
                  layoutId="admin-nav-active"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 rounded-xl bg-marica-amber-dark shadow-sm"
                />
              )}
              <span
                className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-marica-ink-soft hover:bg-marica-sky-light/60 hover:text-marica-ink"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/5 px-3 py-4">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-body text-sm text-marica-ink-soft transition-colors hover:bg-marica-sky-light/60 hover:text-marica-ink"
        >
          ← Kembali ke situs
        </Link>
      </div>
    </aside>
  );
}
