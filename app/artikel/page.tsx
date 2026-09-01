"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, BookOpen, Shapes, Clock3 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categoryBadgeStyle, resolveCategoryColor } from "@/lib/category-color";

// Sebelumnya halaman ini pakai data statis dari `lib/artikel-data.ts`.
// Sekarang semua data (artikel + kategori) diambil dari API yang sudah
// ada (/api/articles, /api/article-categories), yang di baliknya query ke
// Postgres Supabase lewat Prisma.
const ARTICLES_PER_PAGE = 5;
const FALLBACK_COVER = "/images/article-placeholder.png"; // TODO: pastikan file ini ada, atau ganti ke gambar default yang tersedia

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  // colorTag adalah hex color (mis. "#F59E0B") yang diisi lewat form warna
  // di halaman admin (/admin/kategori). Bisa null/invalid untuk kategori
  // lama — lihat lib/category-color.ts buat fallback-nya.
  colorTag: string | null;
};

type ApiArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
  views: number;
  category: ApiCategory | null;
  author: { id: string; name: string | null } | null;
  _count: { comments: number };
};

type ArticlesResponse = {
  articles: ApiArticle[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function ArtikelPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [page, setPage] = useState(1);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce input pencarian, biar nggak fetch tiap ketukan tombol.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  // Kategori cukup diambil sekali di awal.
  useEffect(() => {
    fetch("/api/article-categories")
      .then((res) => res.json())
      .then((body) => setCategories(Array.isArray(body) ? body : []))
      .catch(() => setCategories([]));
  }, []);

  // Artikel diambil ulang tiap kali halaman/kategori/pencarian berubah.
  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(ARTICLES_PER_PAGE));
    if (activeCategory !== "Semua") params.set("category", activeCategory);
    if (debouncedQuery) params.set("search", debouncedQuery);

    fetch(`/api/articles?${params.toString()}`, { signal: controller.signal })
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error ?? "Gagal memuat artikel");
        setData(body as ArticlesResponse);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Gagal memuat artikel");
        }
      })
      .finally(() => setIsLoading(false));

    return () => controller.abort();
  }, [page, activeCategory, debouncedQuery]);

  function resetToFirstPage() {
    setPage(1);
  }

  const articles = data?.articles ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const isFirstPage = page === 1;
  const featured = isFirstPage ? articles[0] : undefined;
  const rest = isFirstPage ? articles.slice(1) : articles;

  return (
    <div className="min-h-screen bg-marica-cream">
      {/* Keyframe animasi dipakai di banyak elemen lewat Tailwind arbitrary
          value animate-[fadeInUp_...] / animate-[fadeIn_...], jadi cukup
          didefinisikan sekali di sini. */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="animate-[fadeInUp_0.6s_ease-out_backwards]">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-body text-sm font-medium text-marica-ink-soft shadow-sm">
              <BookOpen className="h-4 w-4 text-marica-amber-text" />
              Pusat Pengetahuan
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-marica-ink sm:text-5xl">
              Jelajahi{" "}
              <span className="text-marica-amber-text underline decoration-marica-amber decoration-4 underline-offset-4">
                Dunia
              </span>
              <br />
              Pengetahuan
            </h1>

            <p className="mt-5 max-w-lg font-body text-base text-marica-ink-soft">
              Temukan ratusan artikel edukatif, inspirasi parenting, dan ide aktivitas seru untuk
              mengoptimalkan potensi buah hati Anda.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <StatPill
                icon={<BookOpen className="h-4 w-4 text-rose-500" />}
                value={pagination ? `${pagination.total}` : "-"}
                label="Artikel"
              />
              <StatPill
                icon={<Shapes className="h-4 w-4 text-amber-500" />}
                value={`${categories.length}`}
                label="Kategori"
              />
              <StatPill icon={<Clock3 className="h-4 w-4 text-emerald-500" />} value="Update" label="Mingguan" />
            </div>
          </div>

          <div
            style={{ animationDelay: "150ms" }}
            className="relative mx-auto hidden aspect-square w-full max-w-sm animate-[fadeInUp_0.6s_ease-out_backwards] rounded-full bg-white/40 sm:block"
          >
            <Image
              src="/images/hero-character.png"
              alt="Maskot Marica"
              fill
              sizes="(min-width: 640px) 384px, 0px"
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Search bar. Catatan: filter "tag" versi lama dihapus karena
            model Artikel di database belum punya konsep tag — cuma
            title/excerpt/content/category. Kalau nanti mau tag, perlu
            tambah field/tabel dulu di Prisma schema + API-nya. */}
        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(120,60,10,0.08)] lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-marica-cream/70 px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-marica-ink-soft" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari artikel..."
              className="w-full bg-transparent font-body text-sm text-marica-ink placeholder:text-marica-ink-soft focus:outline-none"
            />
          </div>
        </div>
      </section>

      <div aria-hidden className="h-10 w-full bg-marica-amber/90 [clip-path:ellipse(70%_100%_at_50%_0%)]" />

      {/* Categories + article grid */}
      <section className="bg-marica-amber/10 pb-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-center font-display text-3xl font-bold text-marica-ink">
            Eksplorasi <span className="text-marica-amber-text">Kategori</span>
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveCategory("Semua");
                resetToFirstPage();
              }}
              className={`rounded-full px-4 py-2 font-body text-sm font-medium transition ${
                activeCategory === "Semua"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "bg-white text-marica-ink-soft hover:text-marica-ink"
              }`}
            >
              Semua
            </button>
            {categories.map((category, i) => {
              const isActive = activeCategory === category.slug;
              const solidColor = resolveCategoryColor(category.colorTag, category.slug);
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    setActiveCategory(isActive ? "Semua" : category.slug);
                    resetToFirstPage();
                  }}
                  style={{
                    animationDelay: `${i * 40}ms`,
                    ...(isActive
                      ? { backgroundColor: solidColor, color: "#fff" }
                      : { backgroundColor: "#fff", color: "#6b7280" }),
                  }}
                  className="animate-[fadeInUp_0.4s_ease-out_backwards] rounded-full px-4 py-2 font-body text-sm font-medium shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="mt-12 animate-[fadeIn_0.3s_ease-out] rounded-3xl bg-white p-10 text-center font-body text-marica-ink-soft shadow-sm">
              Memuat artikel...
            </div>
          ) : error ? (
            <div className="mt-12 animate-[fadeIn_0.3s_ease-out] rounded-3xl bg-white p-10 text-center font-body text-rose-500 shadow-sm">
              {error}
            </div>
          ) : articles.length === 0 ? (
            <div className="mt-12 animate-[fadeIn_0.3s_ease-out] rounded-3xl bg-white p-10 text-center font-body text-marica-ink-soft shadow-sm">
              Belum ada artikel yang cocok dengan pencarianmu. Coba kata kunci atau kategori lain.
            </div>
          ) : (
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featured && (
                <Link
                  href={`/artikel/${featured.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg lg:col-span-2 lg:flex-row animate-[fadeInUp_0.5s_ease-out_backwards]"
                >
                  <div className="relative h-56 w-full shrink-0 overflow-hidden lg:h-auto lg:w-1/2">
                    <Image
                      src={featured.coverImageUrl || FALLBACK_COVER}
                      alt={featured.title}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-3 p-6">
                    <CategoryTag category={featured.category} date={formatDate(featured.publishedAt)} />
                    <h3 className="font-display text-2xl font-bold leading-snug text-marica-ink">
                      {featured.title}
                    </h3>
                    <p className="font-body text-sm text-marica-ink-soft">{featured.excerpt}</p>
                    <span className="mt-1 inline-flex items-center gap-1 font-body text-sm font-semibold text-rose-500">
                      Baca Selengkapnya <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )}

              {rest.map((article, i) => (
                <Link
                  key={article.slug}
                  href={`/artikel/${article.slug}`}
                  style={{ animationDelay: `${(featured ? i + 1 : i) * 80}ms` }}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg animate-[fadeInUp_0.5s_ease-out_backwards]"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image
                      src={article.coverImageUrl || FALLBACK_COVER}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, 100vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <CategoryTag category={article.category} />
                    <h3 className="font-display text-lg font-bold leading-snug text-marica-ink">
                      {article.title}
                    </h3>
                    <p className="line-clamp-2 font-body text-sm text-marica-ink-soft">{article.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-body text-xs text-marica-ink-soft">
                        {formatDate(article.publishedAt)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-marica-ink-soft transition group-hover:translate-x-1 group-hover:text-marica-amber-text" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-full bg-white px-3 py-2 font-body text-sm text-marica-ink-soft shadow-sm disabled:opacity-40"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-full font-body text-sm font-semibold transition ${
                    page === i + 1
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-white text-marica-ink-soft hover:bg-marica-amber/15"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-full bg-white px-3 py-2 font-body text-sm text-marica-ink-soft shadow-sm disabled:opacity-40"
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 shadow-sm">
      {icon}
      <span className="font-body text-sm text-marica-ink">
        <strong className="font-display font-bold">{value}</strong> {label}
      </span>
    </span>
  );
}

function CategoryTag({ category, date }: { category: ApiCategory | null; date?: string }) {
  if (!category) return null;
  return (
    <div className="flex items-center gap-2">
      <span
        className="rounded-full px-2.5 py-1 font-body text-xs font-semibold"
        style={categoryBadgeStyle(category.colorTag, category.slug)}
      >
        {category.name}
      </span>
      {date && <span className="font-body text-xs text-marica-ink-soft">{date}</span>}
    </div>
  );
}