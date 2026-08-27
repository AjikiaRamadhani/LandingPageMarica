"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader2, MessageCircle } from "lucide-react";

type CommentUser = { name: string } | null;

// Bentuk data ini mengikuti persis apa yang dikembalikan oleh
// GET/POST /api/articles/[slug]/comments (lihat `include: { user: { select: ... } }`
// di route handler-nya). Kalau nanti field di schema Prisma berubah,
// tipe ini yang perlu disesuaikan duluan.
type ApiComment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

// API belum mendukung pagination untuk komentar (GET selalu balikin semua),
// jadi "tampilkan lebih banyak" di sini murni client-side: awalnya cuma
// render INITIAL_VISIBLE komentar, tiap klik tombol nambah LOAD_MORE_STEP.
const INITIAL_VISIBLE = 3;
const LOAD_MORE_STEP = 5;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ArticleComments({
  slug,
  user,
}: {
  // Slug artikel — dipakai untuk fetch/POST ke /api/articles/[slug]/comments.
  slug: string;
  // Dikirim dari page.tsx (Server Component) hasil `await auth()`.
  // null berarti pengunjung belum login. Ini HANYA dipakai untuk kontrol
  // UI (tampilkan form atau tidak) — validasi yang sesungguhnya tetap
  // dilakukan di server lewat route API, jadi tidak bisa dibypass dari client.
  user: CommentUser;
}) {
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const [draft, setDraft] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal memuat komentar");
      }
      setComments((body ?? []) as ApiComment[]);
      setVisibleCount(INITIAL_VISIBLE);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Gagal memuat komentar");
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    // Tombol sudah disabled kalau belum login/draft kosong, ini jaga-jaga saja.
    if (!user || !draft.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/articles/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: draft.trim() }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        // Menampilkan pesan asli dari server, misal:
        // "Silakan login terlebih dahulu untuk memberikan komentar" (401)
        // kalau session sudah expired tapi UI belum tahu.
        throw new Error(body?.error ?? "Gagal mengirim komentar");
      }
      setComments((prev) => [body as ApiComment, ...prev]);
      setDraft("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal mengirim komentar");
    } finally {
      setIsSubmitting(false);
    }
  }

  const visibleComments = comments.slice(0, visibleCount);
  const hasMore = visibleCount < comments.length;

  return (
    <section className="mt-12 border-t border-marica-ink/10 pt-8">
      {/* Keyframe animasi dipakai bareng di banyak elemen lewat Tailwind
          arbitrary value animate-[fadeInUp_...], jadi cukup didefinisikan
          sekali di sini. */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

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
            disabled={isSubmitting}
            className="w-full rounded-2xl border border-marica-ink/10 bg-white p-4 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft transition focus:outline-none focus:ring-2 focus:ring-marica-amber disabled:opacity-60"
          />
          {submitError && <p className="font-body text-sm text-rose-500">{submitError}</p>}
          <button
            type="submit"
            disabled={!draft.trim() || isSubmitting}
            className="inline-flex items-center gap-2 self-end rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 hover:shadow-md disabled:opacity-40 disabled:hover:brightness-100"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
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
        {isLoading ? (
          <p className="font-body text-sm text-marica-ink-soft">Memuat komentar...</p>
        ) : loadError ? (
          <p className="font-body text-sm text-rose-500">{loadError}</p>
        ) : comments.length === 0 ? (
          <p className="font-body text-sm text-marica-ink-soft">
            Belum ada komentar. Jadilah yang pertama berkomentar!
          </p>
        ) : (
          <>
            {visibleComments.map((comment, idx) => (
              <div
                key={comment.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className="animate-[fadeInUp_0.4s_ease-out_backwards] rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-body text-sm font-semibold text-marica-ink">
                    {comment.user?.name ?? "Pengguna"}
                  </span>
                  <span className="font-body text-xs text-marica-ink-soft">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap font-body text-sm text-marica-ink-soft">
                  {comment.content}
                </p>
              </div>
            ))}

            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount((v) => v + LOAD_MORE_STEP)}
                className="group mx-auto inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft shadow-sm transition hover:-translate-y-0.5 hover:text-marica-ink hover:shadow-md"
              >
                Tampilkan Komentar Lebih Banyak
                <ChevronDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}