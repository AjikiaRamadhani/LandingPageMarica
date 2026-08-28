"use client";

import { motion } from "framer-motion";

// Aksi "Keluar" sekarang tinggal di footer AdminSidebar (kiri-bawah) supaya
// jadi satu tombol yang jelas terlihat & mudah dijangkau, bukan ikon kecil
// yang terselip di pojok kanan atas. Topbar ini murni menampilkan identitas
// admin yang sedang login.
export default function AdminTopbar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const initial = (name ?? email ?? "A").trim().charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-black/5 bg-white px-4 sm:px-6">
      <div className="max-w-[45vw] text-right sm:max-w-none">
        <p className="truncate font-body text-sm font-semibold leading-tight text-marica-ink">
          {name ?? "Admin"}
        </p>
        <p className="truncate font-body text-xs leading-tight text-marica-ink-soft/70">{email}</p>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-marica-amber-dark font-body text-sm font-semibold text-white"
      >
        {initial}
      </motion.div>
    </header>
  );
}
