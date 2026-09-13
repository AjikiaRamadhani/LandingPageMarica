"use client";

import { useEffect } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type FeedbackPopupProps = {
  message: string | null | undefined;
  type?: "error" | "success";
  onClose: () => void;
};

export default function FeedbackPopup({
  message,
  type = "error",
  onClose,
}: FeedbackPopupProps) {
  useEffect(() => {
    if (!message || type !== "success") return;
    const timeout = window.setTimeout(onClose, 3200);
    return () => window.clearTimeout(timeout);
  }, [message, onClose, type]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-marica-ink/20 px-5 backdrop-blur-[2px]"
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-live="assertive"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-3xl border border-white/70 bg-white p-6 text-center shadow-[0_24px_70px_rgba(56,37,15,0.22)]"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup notifikasi"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-marica-ink-soft transition hover:bg-marica-cream hover:text-marica-ink"
        >
          <X className="h-4 w-4" />
        </button>
        <span
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${
            isSuccess
              ? "bg-marica-green/15 text-marica-green"
              : "bg-marica-rose-deep/10 text-marica-rose-deep"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 className="h-7 w-7" />
          ) : (
            <AlertCircle className="h-7 w-7" />
          )}
        </span>
        <h2 className="mt-4 font-display text-lg font-semibold text-marica-ink">
          {isSuccess ? "Berhasil" : "Ada kendala"}
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-marica-ink-soft">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`mt-5 rounded-full px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 ${
            isSuccess ? "bg-marica-green" : "bg-marica-amber-dark"
          }`}
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}
