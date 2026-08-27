"use client";

import { signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";

export default function AdminTopbar({
  name,
  email,
}: {
  name?: string | null;
  email?: string | null;
}) {
  const initial = (name ?? email ?? "A").trim().charAt(0).toUpperCase();

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-black/5 bg-white px-6">
      <div className="text-right">
        <p className="font-body text-sm font-semibold leading-tight text-marica-ink">
          {name ?? "Admin"}
        </p>
        <p className="font-body text-xs leading-tight text-marica-ink-soft/70">{email}</p>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-marica-amber-dark font-body text-sm font-semibold text-white"
      >
        {initial}
      </motion.div>

      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        title="Keluar"
        className="flex h-9 w-9 items-center justify-center rounded-full text-marica-ink-soft transition hover:bg-marica-rose-deep/10 hover:text-marica-rose-deep"
      >
        <LogOut className="h-4.5 w-4.5" />
      </button>
    </header>
  );
}
