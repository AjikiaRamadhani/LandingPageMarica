"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Star, Download, CheckCircle2, Loader2 } from "lucide-react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { CATEGORY_STYLES, getPrintableById } from "../activities-data";

const AGE_OPTIONS = ["2-3 Tahun", "3-5 Tahun", "4-6 Tahun", "5-7 Tahun", "7-9 Tahun"];

export default function PrintablesDownloadPage() {
  return (
    <Suspense fallback={null}>
      <PrintablesDownloadContent />
    </Suspense>
  );
}

function PrintablesDownloadContent() {
  const searchParams = useSearchParams();
  const [printable, setPrintable] = useState(() => getPrintableById(searchParams.get("item")));
  const printableKey = searchParams.get("item");

  useEffect(() => {
    if (!printableKey) return;

    fetch(`/api/printables/${encodeURIComponent(printableKey)}`)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("Printable tidak ditemukan"))))
      .then((data: { id: string; slug: string; title: string; description: string; subject: string }) => {
        setPrintable((current) => ({
          ...current,
          id: data.slug,
          title: data.title,
          description: data.description,
          longDescription: data.description,
          categoryLabel: data.subject,
        }));
      })
      .catch((error) => console.error("[PrintablesDownloadPage]", error));
  }, [printableKey]);
  const style = CATEGORY_STYLES[printable.category];
  const Icon = style.icon;
  const reduceMotion = useReducedMotion();

  return (
    <>
      <Navbar />
      <main className="hero-gradient-bg-v2 min-h-screen">
        <div className="mx-auto max-w-7xl px-6 pt-6 lg:px-10">
          <Link
            href="/aktivitas"
            className="inline-flex items-center gap-2 font-body text-sm font-medium text-marica-ink-soft transition hover:text-marica-ink"
          >
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
        </div>

        <motion.section
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 pb-20 pt-8 lg:grid-cols-2 lg:gap-14 lg:px-10 lg:pb-28 lg:pt-10"
        >
          {/* Preview */}
          <div>
            <div
              className="overflow-hidden rounded-3xl border-2 p-2"
              style={{ borderColor: style.iconColor + "55" }}
            >
              <div
                className="relative flex h-72 items-center justify-center rounded-2xl sm:h-96"
                style={{ backgroundImage: `linear-gradient(135deg, ${style.from}, ${style.to})` }}
              >
                <div className="absolute left-4 top-4 flex gap-1.5 opacity-50" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-marica-ink/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-marica-ink/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-marica-ink/40" />
                </div>
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/70 shadow-inner">
                  <Icon className="h-11 w-11" style={{ color: style.iconColor }} />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between font-body text-xs text-marica-ink-soft">
              <span>Format: {printable.format}</span>
              <span>Size: {printable.fileSizeMb} MB</span>
            </div>
          </div>

          {/* Details + form */}
          <div>
            <div
              className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ backgroundColor: style.badgeBg, color: style.badgeText }}
            >
              <Star className="h-3.5 w-3.5 fill-current" /> +{printable.points} MARICA POINTS
            </div>

            <h1 className="mt-4 font-display text-3xl font-semibold text-marica-ink">{printable.title}</h1>
            <p className="mt-3 font-body text-marica-ink-soft">{printable.longDescription}</p>

            <div className="mt-6 rounded-2xl bg-white p-6 shadow-[0_14px_35px_rgba(120,60,10,0.08)] sm:p-7">
              <DownloadForm
                printableId={printable.id}
                printableTitle={printable.title}
                reduceMotion={!!reduceMotion}
              />
            </div>

            <p className="mt-4 font-body text-xs text-marica-ink-soft">
              Dengan mengunduh materi ini, Anda menyetujui{" "}
              <Link href="/syarat-ketentuan" className="font-semibold text-marica-amber-text underline underline-offset-2">
                Syarat & Ketentuan
              </Link>{" "}
              serta{" "}
              <Link href="/kebijakan-privasi" className="font-semibold text-marica-amber-text underline underline-offset-2">
                Kebijakan Privasi
              </Link>{" "}
              kami. Tautan unduhan akan dikirim langsung ke email Anda.
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </>
  );
}

function DownloadForm({
  printableId,
  printableTitle,
  reduceMotion,
}: {
  printableId: string;
  printableTitle: string;
  reduceMotion: boolean;
}) {
  const { data: session } = useSession();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", whatsapp: "", age: "" });

  const nameValue = form.name || session?.user?.name || "";
  const emailValue = form.email || session?.user?.email || "";

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const response = await fetch(`/api/printables/${encodeURIComponent(printableId)}/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameValue,
          email: emailValue,
          whatsapp: form.whatsapp,
          childAge: Number.parseInt(form.age, 10),
        }),
      });
      const result = (await response.json()) as { downloadUrl?: string; error?: string };

      if (!response.ok || !result.downloadUrl) {
        throw new Error(result.error ?? "Download belum bisa disiapkan");
      }

      setDownloadUrl(result.downloadUrl);
      setStatus("success");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Terjadi kesalahan");
      setStatus("idle");
    }
  };

  return (
    <AnimatePresence mode="wait">
      {status === "success" ? (
        <motion.div
          key="success"
          initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center py-6 text-center"
        >
          <CheckCircle2 className="h-12 w-12 text-marica-green" />
          <h3 className="mt-4 font-display text-lg font-semibold text-marica-ink">Berhasil dikirim!</h3>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Download &ldquo;{printableTitle}&rdquo; sudah siap.
          </p>
          {downloadUrl && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-marica-amber-dark px-5 py-3 font-body text-sm font-semibold text-white"
            >
              <Download className="h-4 w-4" /> Buka PDF
            </a>
          )}
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={reduceMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.2 }}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <h2 className="font-display text-lg font-semibold text-marica-ink">Informasi Pengiriman</h2>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 font-body text-sm text-red-700">{error}</p>}

          <Field label="Nama Lengkap Orang Tua">
            <input
              required
              type="text"
              value={nameValue}
              onChange={update("name")}
              placeholder="Masukkan nama lengkap"
              className="w-full rounded-xl border border-marica-ink/10 bg-white px-4 py-2.5 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/60 outline-none transition focus:border-marica-amber-dark focus:ring-2 focus:ring-marica-amber-dark/20"
            />
          </Field>

          <Field label="Alamat Email">
            <input
              required
              type="email"
              value={emailValue}
              onChange={update("email")}
              placeholder="Alamat pengiriman file PDF"
              className="w-full rounded-xl border border-marica-ink/10 bg-white px-4 py-2.5 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/60 outline-none transition focus:border-marica-amber-dark focus:ring-2 focus:ring-marica-amber-dark/20"
            />
          </Field>

          <Field label="Nomor WhatsApp">
            <div className="flex items-center overflow-hidden rounded-xl border border-marica-ink/10 bg-white transition focus-within:border-marica-amber-dark focus-within:ring-2 focus-within:ring-marica-amber-dark/20">
              <span className="border-r border-marica-ink/10 px-3 py-2.5 font-body text-sm text-marica-ink-soft">
                +62
              </span>
              <input
                required
                type="tel"
                value={form.whatsapp}
                onChange={update("whatsapp")}
                placeholder="812-xxxx-xxxx"
                className="w-full px-4 py-2.5 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/60 outline-none"
              />
            </div>
          </Field>

          <Field label="Usia Anak">
            <select
              required
              value={form.age}
              onChange={update("age")}
              className="w-full rounded-xl border border-marica-ink/10 bg-white px-4 py-2.5 font-body text-sm text-marica-ink outline-none transition focus:border-marica-amber-dark focus:ring-2 focus:ring-marica-amber-dark/20"
            >
              <option value="" disabled>
                Pilih usia anak
              </option>
              {AGE_OPTIONS.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-70"
          >
            {status === "submitting" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Lanjutkan ke Download
              </>
            )}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-sm font-medium text-marica-ink">{label}</span>
      {children}
    </label>
  );
}