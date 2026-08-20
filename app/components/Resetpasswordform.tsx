"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import AuthCard from "./Authcard";

function getPasswordStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Za-z]/.test(pw) && /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

const strengthMeta = [
  { label: "Lemah", color: "bg-marica-rose-deep" },
  { label: "Sedang", color: "bg-marica-amber" },
  { label: "Kuat", color: "bg-marica-green" },
];

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const linkInvalid = !token || !email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle" || linkInvalid) return;

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setError(null);
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error ?? "Gagal reset password, coba lagi nanti.");
        return;
      }

      setStatus("success");
      window.setTimeout(() => router.push("/login"), 1400);
    } catch (err) {
      console.error("[reset-password]", err);
      setStatus("idle");
      setError("Gagal reset password, coba lagi nanti.");
    }
  };

  if (linkInvalid) {
    return (
      <AuthCard title="Link tidak valid" subtitle="Link reset password ini tidak lengkap atau sudah tidak berlaku.">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <Link href="/lupa-password" className="font-body text-sm font-semibold text-marica-amber-text hover:underline">
            Minta link reset baru
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Atur password baru" subtitle={`Buat password baru untuk ${email}.`}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-4 text-center"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-marica-green/15 text-marica-green">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="font-body text-sm text-marica-ink-soft">
              Password berhasil diubah. Mengarahkan ke halaman masuk...
            </p>
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
              <label htmlFor="password" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Password Baru
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-black/10 bg-marica-sky-light/40 py-2.5 pl-10 pr-11 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-marica-ink-soft/60 transition hover:text-marica-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex flex-1 gap-1">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < strength ? strengthMeta[strength - 1].color : "bg-black/10"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-body text-xs text-marica-ink-soft/70">
                    {strength > 0 ? strengthMeta[strength - 1].label : ""}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
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
                  Menyimpan...
                </span>
              ) : (
                "Simpan Password Baru"
              )}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthCard>
  );
}