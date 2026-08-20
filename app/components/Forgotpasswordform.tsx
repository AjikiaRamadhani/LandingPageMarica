"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import AuthCard from "./Authcard";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;

    setError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error ?? "Gagal memproses permintaan, coba lagi nanti.");
        return;
      }

      setStatus("sent");
    } catch (err) {
      console.error("[forgot-password]", err);
      setStatus("idle");
      setError("Gagal memproses permintaan, coba lagi nanti.");
    }
  };

  return (
    <AuthCard
      title="Lupa password?"
      subtitle="Masukkan email akun kamu, kami kirimkan link untuk atur ulang password."
    >
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marica-green/15 text-marica-green">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="font-body text-sm text-marica-ink-soft">
              Kalau email{" "}
              <span className="font-medium text-marica-ink">{email}</span>{" "}
              terdaftar, link reset password sudah dikirim. Cek juga folder spam
              ya.
            </p>
            <Link
              href="/login"
              className="mt-2 font-body text-sm font-semibold text-marica-amber-text hover:underline"
            >
              Kembali ke halaman masuk
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-body text-sm font-medium text-marica-ink"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full rounded-xl border border-black/10 bg-marica-sky-light/40 py-2.5 pl-10 pr-4 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="font-body text-sm text-marica-rose-deep"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={status !== "idle"}
              className="relative mt-1 flex h-12 w-full items-center justify-center rounded-full bg-marica-amber-dark font-body text-[15px] font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-90"
            >
              {status === "loading" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Mengirim...
                </span>
              ) : (
                "Kirim Link Reset"
              )}
            </button>

            <p className="text-center font-body text-sm text-marica-ink-soft">
              Sudah ingat password?{" "}
              <Link
                href="/login"
                className="font-semibold text-marica-amber-text hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}
