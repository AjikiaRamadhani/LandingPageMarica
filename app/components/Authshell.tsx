"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  PackageCheck,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

type AuthMode = "login" | "daftar";

const highlights = [
  { icon: Sparkles, text: "Pantau progress belajar si kecil kapan saja" },
  { icon: BookOpenCheck, text: "Akses materi bahasa & matematika interaktif" },
  { icon: PackageCheck, text: "Riwayat workshop & Edu-Kit dalam satu tempat" },
];

// Gelembung yang naik di belakang maskot ikan — posisi & waktu di-hardcode
// (bukan random di render) supaya tidak ada hydration mismatch server/client.
const bubbles = [
  { left: "10%", size: 9, delay: 0, duration: 6.5 },
  { left: "26%", size: 6, delay: 1.4, duration: 5.2 },
  { left: "45%", size: 13, delay: 0.5, duration: 7.2 },
  { left: "63%", size: 7, delay: 2.1, duration: 5.8 },
  { left: "80%", size: 11, delay: 0.9, duration: 6.8 },
  { left: "92%", size: 5, delay: 1.8, duration: 5 },
];

function getPasswordStrength(pw: string) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 3);
}

const strengthMeta = [
  { label: "Lemah", color: "bg-marica-rose-deep" },
  { label: "Sedang", color: "bg-marica-amber" },
  { label: "Kuat", color: "bg-marica-green" },
];

export default function AuthShell({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const prefersReducedMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status !== "idle") return;

    if (!isLogin && password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak sama.");
      return;
    }

    setError(null);
    setStatus("loading");

    if (isLogin) {
      // Provider "credentials" harus terdaftar di lib/auth.ts (Auth.js/NextAuth config)
      // dengan field email & password, sesuai kontrak yang dipakai app/api/auth/register.
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (!result || result.error) {
          setStatus("idle");
          setError(
            result?.error === "CredentialsSignin"
              ? "Email atau password salah."
              : "Gagal masuk, coba lagi."
          );
          return;
        }

        setStatus("success");
        window.setTimeout(() => {
          router.push("/");
          router.refresh();
        }, 700);
      } catch (err) {
        console.error("[login]", err);
        setStatus("idle");
        setError("Gagal masuk, coba lagi.");
      }
      return;
    }

    // Daftar: buat akun lewat API, lalu langsung sign-in supaya user tidak perlu login manual.
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("idle");
        setError(data?.error ?? "Gagal membuat akun, coba lagi nanti.");
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (!result || result.error) {
        // Akun berhasil dibuat tapi auto-login gagal — arahkan ke halaman login saja.
        setStatus("success");
        window.setTimeout(() => router.push("/login"), 900);
        return;
      }

      setStatus("success");
      window.setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 700);
    } catch (err) {
      console.error("[register]", err);
      setStatus("idle");
      setError("Gagal membuat akun, coba lagi nanti.");
    }
  };

  const bobA = prefersReducedMotion ? { y: 0 } : { y: [0, -10, 0] };
  const bobB = prefersReducedMotion ? { y: 0 } : { y: [0, -14, 0] };

  return (
    <main className="hero-gradient-bg-v2 relative isolate flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3.5 py-2 font-body text-sm font-medium text-marica-ink-soft backdrop-blur-sm transition hover:bg-white hover:text-marica-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50 sm:left-8 sm:top-8"
      >
        <ArrowLeft className="h-4 w-4" />
        Beranda
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[2.5rem] bg-white shadow-[0_30px_80px_rgba(120,60,10,0.18)] lg:grid-cols-2"
      >
        {/* Illustration panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-marica-sky-light via-marica-sky to-marica-violet/40 p-10 lg:flex">
          <div
            aria-hidden
            className="animate-blob-drift pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-marica-amber/30 blur-3xl"
          />
          <div
            aria-hidden
            style={{ animationDelay: "-4s" }}
            className="animate-blob-drift pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-marica-violet-deep/25 blur-3xl"
          />

          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-72 overflow-hidden">
            {bubbles.map((b, i) => (
              <span
                key={i}
                className="animate-bubble absolute rounded-full bg-white/60"
                style={{
                  left: b.left,
                  bottom: "-20px",
                  width: b.size,
                  height: b.size,
                  animationDelay: `${b.delay}s`,
                  animationDuration: `${b.duration}s`,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <span className="font-display text-lg font-semibold text-marica-amber-text">Marica</span>
            <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-marica-ink">
              Belajar jadi lebih ceria
            </h2>
            <p className="mt-3 max-w-xs font-body text-[15px] leading-relaxed text-marica-ink-soft">
              Satu akun untuk semua progress calistung si kecil — dari kelas online sampai Edu-Kit bulanan.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {highlights.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 font-body text-sm text-marica-ink-soft">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/70 text-marica-amber-dark">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-8 flex items-end justify-center gap-5">
            <motion.div
              animate={bobA}
              transition={{ duration: 4, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut" }}
            >
              <Image
                src="/images/mascots/program-bahasa-mascot.png"
                alt="Maskot Program Bahasa Marica"
                width={126}
                height={119}
                className="h-24 w-auto drop-shadow-lg sm:h-28"
              />
            </motion.div>
            <motion.div
              animate={bobB}
              transition={{ duration: 3.4, repeat: prefersReducedMotion ? 0 : Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <Image
                src="/images/mascots/program-matematika-mascot.png"
                alt="Maskot Program Matematika Marica"
                width={88}
                height={120}
                className="h-28 w-auto drop-shadow-lg sm:h-32"
              />
            </motion.div>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-12 lg:py-14">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <h1 className="font-display text-[28px] font-semibold text-marica-ink sm:text-[32px]">
                {isLogin ? "Selamat datang kembali" : "Buat akun Marica"}
              </h1>
              <p className="mt-2 font-body text-[15px] text-marica-ink-soft">
                {isLogin
                  ? "Masuk untuk melanjutkan perjalanan belajar si kecil."
                  : "Daftar sebentar, mulai belajar ceria bersama si kecil hari ini."}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                      Nama Lengkap
                    </label>
                    <div className="relative">
                      <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                      <input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nama Bunda / Ayah"
                        className="w-full rounded-xl border border-black/10 bg-marica-sky-light/40 py-2.5 pl-10 pr-4 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
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

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <label htmlFor="password" className="block font-body text-sm font-medium text-marica-ink">
                      Password
                    </label>
                    {isLogin && (
                      <Link
                        href="/lupa-password"
                        className="font-body text-xs font-medium text-marica-amber-text hover:underline"
                      >
                        Lupa password?
                      </Link>
                    )}
                  </div>
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
                      <AnimatePresence mode="wait" initial={false}>
                        {showPassword ? (
                          <motion.span
                            key="off"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.15 }}
                            className="flex"
                          >
                            <EyeOff className="h-4 w-4" />
                          </motion.span>
                        ) : (
                          <motion.span
                            key="on"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                            transition={{ duration: 0.15 }}
                            className="flex"
                          >
                            <Eye className="h-4 w-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </div>

                  {!isLogin && password.length > 0 && (
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

                {!isLogin && (
                  <div>
                    <label htmlFor="confirm" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                      Konfirmasi Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
                      <input
                        id="confirm"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="w-full rounded-xl border border-black/10 bg-marica-sky-light/40 py-2.5 pl-10 pr-11 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-marica-ink-soft/60 transition hover:text-marica-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <label className="flex items-center gap-2 font-body text-sm text-marica-ink-soft">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-black/20 text-marica-amber-dark focus:ring-marica-amber/40"
                    />
                    Ingat saya
                  </label>
                )}

                {!isLogin && (
                  <label className="flex items-start gap-2.5 font-body text-[13px] text-marica-ink-soft">
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-black/20 text-marica-amber-dark focus:ring-marica-amber/40"
                    />
                    <span>
                      Saya menyetujui{" "}
                      <Link href="/syarat-ketentuan" className="font-medium text-marica-amber-text underline underline-offset-2">
                        Syarat &amp; Ketentuan
                      </Link>{" "}
                      serta{" "}
                      <Link href="/kebijakan-privasi" className="font-medium text-marica-amber-text underline underline-offset-2">
                        Kebijakan Privasi
                      </Link>{" "}
                      Marica.
                    </span>
                  </label>
                )}

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
                  className="relative mt-1 flex h-12 w-full items-center justify-center overflow-hidden rounded-full bg-marica-amber-dark font-body text-[15px] font-semibold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-90"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {status === "idle" && (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {isLogin ? "Masuk" : "Buat Akun"}
                      </motion.span>
                    )}
                    {status === "loading" && (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Memproses...
                      </motion.span>
                    )}
                    {status === "success" && (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Berhasil!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-black/10" />
                <span className="font-body text-xs font-medium uppercase tracking-wide text-marica-ink-soft/50">
                  atau
                </span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <button
                type="button"
                onClick={() => signIn("google", { callbackUrl: "/" })}
                className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-black/10 bg-white font-body text-[15px] font-medium text-marica-ink transition hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marica-amber-dark/50 focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 24 24" className="h-4.5 w-4.5">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.88-3c-1.08.72-2.46 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.96H1.28v3.11A11.99 11.99 0 0 0 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.6l4 3.11C6.22 6.86 8.87 4.75 12 4.75z"
                  />
                </svg>
                {isLogin ? "Masuk dengan Google" : "Daftar dengan Google"}
              </button>

              <p className="mt-8 text-center font-body text-sm text-marica-ink-soft">
                {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
                <Link
                  href={isLogin ? "/daftar" : "/login"}
                  className="font-semibold text-marica-amber-text hover:underline"
                >
                  {isLogin ? "Daftar di sini" : "Masuk di sini"}
                </Link>
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </main>
  );
}