"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal berlangganan");
      }
      setStatus("success");
      setMessage(body?.message ?? "Berhasil berlangganan!");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Gagal berlangganan, coba lagi nanti");
    }
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email kamu..."
          disabled={status === "loading"}
          className="w-full flex-1 rounded-full border-none px-5 py-3 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="rounded-full bg-marica-ink px-6 py-3 font-body text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60"
        >
          {status === "loading" ? "Mengirim..." : "Langganan"}
        </button>
      </form>
      {message && (
        <p
          className={`mt-2 font-body text-xs ${
            status === "error" ? "text-rose-600" : "text-emerald-800"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}