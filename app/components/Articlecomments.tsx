"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { ArticleComment } from "@/lib/artikel-data";

type CommentUser = { name: string } | null;

export default function ArticleComments({
  initialComments,
  user,
}: {
  initialComments: ArticleComment[];
  // Dikirim dari page.tsx (Server Component) hasil `await auth()`.
  // null berarti pengunjung belum login.
  user: CommentUser;
}) {
  const [comments, setComments] = useState(initialComments);
  const [draft, setDraft] = useState("");

  function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    // Pengunjung yang belum masuk hanya bisa membaca komentar; menulis
    // komentar baru mengharuskan login terlebih dahulu.
    if (!user || !draft.trim()) return;
    setComments((prev) => [
      { id: crypto.randomUUID(), name: user.name, date: "Baru saja", message: draft.trim() },
      ...prev,
    ]);
    setDraft("");
  }

  return (
    <section className="mt-12 border-t border-marica-ink/10 pt-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold text-marica-ink">
        <MessageCircle className="h-5 w-5 text-marica-amber-text" />
        Komentar ({comments.length})
      </h2>

      {user ? (
        <form onSubmit={handleSubmitComment} className="mt-5 flex flex-col gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tulis komentar kamu..."
            rows={3}
            className="w-full rounded-2xl border border-marica-ink/10 bg-white p-4 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft focus:outline-none focus:ring-2 focus:ring-marica-amber"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="self-end rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-40"
          >
            Kirim Komentar
          </button>
        </form>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-sm">
          <p className="font-body text-sm text-marica-ink-soft">
            Masuk terlebih dahulu untuk ikut berkomentar di artikel ini.
          </p>
          <Link
            href="/login"
            className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Masuk untuk Berkomentar
          </Link>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="font-body text-sm text-marica-ink-soft">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm font-semibold text-marica-ink">{comment.name}</span>
                <span className="font-body text-xs text-marica-ink-soft">{comment.date}</span>
              </div>
              <p className="mt-2 font-body text-sm text-marica-ink-soft">{comment.message}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
