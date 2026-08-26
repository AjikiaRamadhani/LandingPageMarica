"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ArrowRight, BookOpen, Shapes, Clock3 } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { articles, categories, tags, categoryColorClasses } from "@/lib/artikel-data";

// Jumlah artikel minimal yang tampil di halaman pertama (1 featured + 4
// grid, sesuai desain). Kalau total artikel (setelah difilter) lebih dari
// ini, sisanya otomatis pindah ke halaman 2, 3, dst.
const ARTICLES_PER_PAGE = 5;

export default function ArtikelPage() {
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string>("Semua");
  const [activeCategory, setActiveCategory] = useState<string>("Semua");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return articles.filter((article) => {
      const matchesQuery = query.trim()
        ? article.title.toLowerCase().includes(query.trim().toLowerCase())
        : true;
      const matchesTag = activeTag === "Semua" ? true : article.tags.includes(activeTag);
      const matchesCategory =
        activeCategory === "Semua" ? true : article.categorySlug === activeCategory;
      return matchesQuery && matchesTag && matchesCategory;
    });
  }, [query, activeTag, activeCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);
  // Card besar (hero, span 2 kolom) hanya untuk halaman pertama. Di halaman
  // 2 dst, semua artikel yang tersisa ditampilkan rata dalam grid biasa —
  // sebelumnya item pertama tiap halaman ikut dijadikan card besar, padahal
  // itu bukan artikel "Featured" beneran.
  const isFirstPage = currentPage === 1;
  const featured = isFirstPage ? paged[0] : undefined;
  const rest = isFirstPage ? paged.slice(1) : paged;

  function resetToFirstPage() {
    setPage(1);
  }

  return (
    <div className="min-h-screen bg-marica-cream">
      <Navbar />

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-6 lg:px-10">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 font-body text-sm font-medium text-marica-ink-soft shadow-sm">
              <BookOpen className="h-4 w-4 text-marica-amber-text" />
              Pusat Pengetahuan
            </span>

            <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-marica-ink sm:text-5xl">
              Jelajahi <span className="text-marica-amber-text underline decoration-marica-amber decoration-4 underline-offset-4">Dunia</span>
              <br />
              Pengetahuan
            </h1>

            <p className="mt-5 max-w-lg font-body text-base text-marica-ink-soft">
              Temukan ratusan artikel edukatif, inspirasi parenting, dan ide aktivitas seru untuk
              mengoptimalkan potensi buah hati Anda.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <StatPill icon={<BookOpen className="h-4 w-4 text-rose-500" />} value="73+" label="Artikel" />
              <StatPill icon={<Shapes className="h-4 w-4 text-amber-500" />} value="6" label="Kategori" />
              <StatPill icon={<Clock3 className="h-4 w-4 text-emerald-500" />} value="Update" label="Mingguan" />
            </div>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-sm rounded-full bg-white/40 sm:block">
            <Image
              src="/images/hero-character.png"
              alt="Maskot Marica"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-[0_10px_30px_rgba(120,60,10,0.08)] lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2 rounded-2xl bg-marica-cream/70 px-4 py-2.5">
            <Search className="h-4 w-4 shrink-0 text-marica-ink-soft" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                resetToFirstPage();
              }}
              placeholder="Cari artikel..."
              className="w-full bg-transparent font-body text-sm text-marica-ink placeholder:text-marica-ink-soft focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {["Semua", ...tags].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setActiveTag(tag);
                  resetToFirstPage();
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 font-body text-sm font-medium transition ${
                  activeTag === tag
                    ? "bg-marica-amber-dark text-white shadow-sm"
                    : "bg-marica-cream/70 text-marica-ink-soft hover:bg-marica-amber/15 hover:text-marica-ink"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Decorative wave divider */}
      <div aria-hidden className="h-10 w-full bg-marica-amber/90 [clip-path:ellipse(70%_100%_at_50%_0%)]" />

      {/* Categories */}
      <section className="bg-marica-amber/10 pb-16 pt-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <h2 className="text-center font-display text-3xl font-bold text-marica-ink">
            Eksplorasi <span className="text-marica-amber-text">Kategori</span>
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => {
              const colors = categoryColorClasses[category.color];
              const Icon = category.icon;
              const isActive = activeCategory === category.slug;
              return (
                <button
                  key={category.slug}
                  type="button"
                  onClick={() => {
                    setActiveCategory(isActive ? "Semua" : category.slug);
                    resetToFirstPage();
                  }}
                  className={`flex flex-col items-center gap-2 rounded-2xl bg-white p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    isActive ? "ring-2 ring-marica-amber-dark" : ""
                  }`}
                >
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full ${colors.iconBg}`}>
                    <Icon className={`h-5 w-5 ${colors.text}`} />
                  </span>
                  <span className="font-body text-sm font-semibold text-marica-ink">{category.label}</span>
                  <span className="rounded-full bg-marica-cream px-2.5 py-0.5 font-body text-xs text-marica-ink-soft">
                    {category.count} Artikel
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category pill filter (mirrors the grid above, handy once the list is long) */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
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
            {categories.map((category) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => {
                  setActiveCategory(category.slug);
                  resetToFirstPage();
                }}
                className={`rounded-full px-4 py-2 font-body text-sm font-medium transition ${
                  activeCategory === category.slug
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-white text-marica-ink-soft hover:text-marica-ink"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Article grid */}
          {paged.length === 0 ? (
            <div className="mt-12 rounded-3xl bg-white p-10 text-center font-body text-marica-ink-soft shadow-sm">
              Belum ada artikel yang cocok dengan pencarianmu. Coba kata kunci atau kategori lain.
            </div>
          ) : (
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {featured && (
                <Link
                  href={`/artikel/${featured.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg lg:col-span-2 lg:flex-row"
                >
                  <div className="relative h-56 w-full shrink-0 overflow-hidden lg:h-auto lg:w-1/2">
                    {featured.badge && (
                      <span
                        className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 font-body text-xs font-semibold text-white ${
                          featured.badge === "Featured" ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        {featured.badge === "Featured" ? "★ Featured" : "Baru"}
                      </span>
                    )}
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-center gap-3 p-6">
                    <CategoryTag slug={featured.categorySlug} date={featured.date} />
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

              {rest.map((article) => (
                <Link
                  key={article.slug}
                  href={`/artikel/${article.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition hover:shadow-lg"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    {article.badge && (
                      <span
                        className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1 font-body text-xs font-semibold text-white ${
                          article.badge === "Featured" ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                      >
                        {article.badge === "Featured" ? "★ Featured" : "Baru"}
                      </span>
                    )}
                    <Image
                      src={article.coverImage}
                      alt={article.title}
                      fill
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <CategoryTag slug={article.categorySlug} />
                    <h3 className="font-display text-lg font-bold leading-snug text-marica-ink">
                      {article.title}
                    </h3>
                    <p className="line-clamp-2 font-body text-sm text-marica-ink-soft">{article.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-body text-xs text-marica-ink-soft">{article.date}</span>
                      <ArrowRight className="h-4 w-4 text-marica-ink-soft transition group-hover:translate-x-1 group-hover:text-marica-amber-text" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
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
                    currentPage === i + 1
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-white text-marica-ink-soft hover:bg-marica-amber/15"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage === totalPages}
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

function CategoryTag({ slug, date }: { slug: string; date?: string }) {
  const category = categories.find((c) => c.slug === slug);
  if (!category) return null;
  const colors = categoryColorClasses[category.color];
  return (
    <div className="flex items-center gap-2">
      <span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${colors.bg} ${colors.text}`}>
        {category.label}
      </span>
      {date && <span className="font-body text-xs text-marica-ink-soft">{date}</span>}
    </div>
  );
}