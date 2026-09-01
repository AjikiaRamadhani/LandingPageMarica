"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
  RotateCcw,
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductCard from "../components/belanja/ProductCard";
import FilterPanel, { type FilterState } from "../components/belanja/FilterPanel";
import {
  AGE_OPTIONS,
  PRICE_RANGES,
  SORT_OPTIONS,
  type ApiCategory,
  type ApiProduct,
  type SortValue,
} from "../components/belanja/types";

const DEFAULT_FILTERS: FilterState = {
  categorySlug: null,
  ageKey: null,
  priceKey: "all",
};

const PAGE_SIZE = 12;

export default function BelanjaPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortValue>("newest");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce the free-text search so we don't hit the API on every keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    fetch("/api/product-categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error("Failed to load product categories", err));
  }, []);

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(PAGE_SIZE));
    params.set("sort", sort);
    if (search) params.set("search", search);
    if (filters.categorySlug) params.set("category", filters.categorySlug);
    if (filters.ageKey) {
      const age = AGE_OPTIONS.find((a) => a.key === filters.ageKey);
      if (age) params.set("age", age.value);
    }
    const priceRange = PRICE_RANGES.find((p) => p.key === filters.priceKey);
    if (priceRange?.min != null) params.set("minPrice", String(priceRange.min));
    if (priceRange?.max != null) params.set("maxPrice", String(priceRange.max));
    return params.toString();
  }, [page, sort, search, filters]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/products?${buildQuery()}`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Gagal memuat produk");
        return json;
      })
      .then((json) => {
        if (cancelled) return;
        setProducts(Array.isArray(json.products) ? json.products : []);
        setTotal(json.pagination?.total ?? 0);
        setTotalPages(json.pagination?.totalPages ?? 1);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Gagal memuat produk");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [buildQuery]);

  const handleFilterChange = (next: FilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.categorySlug) count += 1;
    if (filters.ageKey) count += 1;
    if (filters.priceKey !== "all") count += 1;
    return count;
  }, [filters]);

  const pageNumbers = useMemo(() => buildPageNumbers(page, totalPages), [page, totalPages]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="section-soft-bg flex-1">
        {/* Page heading */}
        <div className="mx-auto max-w-7xl px-5 pb-4 pt-8 sm:px-6 lg:px-10 lg:pt-12">
          <h1 className="font-display text-2xl font-bold text-marica-ink sm:text-3xl">Belanja</h1>
          <p className="mt-1.5 max-w-xl font-body text-sm text-marica-ink-soft sm:text-base">
            Mainan, buku, dan perlengkapan edukatif pilihan untuk tumbuh kembang si kecil.
          </p>
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-10">
          {/* Search + sort (all breakpoints) */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari mainan, buku..."
                className="w-full rounded-full border border-marica-ink/10 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/50 shadow-sm outline-none transition focus:border-marica-amber-dark/50"
              />
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sort — dropdown on all sizes, kept compact */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as SortValue);
                    setPage(1);
                  }}
                  className="appearance-none rounded-full border border-marica-ink/10 bg-white py-2.5 pl-4 pr-9 font-body text-sm font-medium text-marica-ink shadow-sm outline-none transition focus:border-marica-amber-dark/50"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-marica-ink-soft/60" />
              </div>

              {/* Filter button — mobile/tablet only, sidebar covers desktop */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="relative flex shrink-0 items-center gap-2 rounded-full border border-marica-ink/10 bg-white px-4 py-2.5 font-body text-sm font-medium text-marica-ink shadow-sm transition hover:bg-marica-cream lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-marica-amber-dark px-1 font-body text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content: sidebar (desktop) + grid */}
          <div className="mt-6 flex items-start gap-8">
            <aside className="sticky top-24 hidden w-64 shrink-0 rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-[0_10px_28px_rgba(120,60,10,0.08)] lg:block">
              <FilterPanel
                categories={categories}
                filters={filters}
                onChange={handleFilterChange}
                onReset={handleReset}
              />
            </aside>

            <div className="min-w-0 flex-1">
              <p className="mb-4 font-body text-sm text-marica-ink-soft">
                {isLoading
                  ? "Memuat produk..."
                  : `Menampilkan ${products.length} dari ${total} produk`}
              </p>

              {error && (
                <div className="rounded-2xl border border-marica-rose-deep/20 bg-marica-rose-deep/5 p-6 text-center font-body text-sm text-marica-rose-deep">
                  {error}
                </div>
              )}

              {!error && isLoading && (
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4.4] animate-pulse rounded-2xl bg-marica-ink/5"
                    />
                  ))}
                </div>
              )}

              {!error && !isLoading && products.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-marica-ink/5 bg-white py-16 text-center shadow-sm">
                  <PackageSearch className="h-10 w-10 text-marica-ink-soft/40" />
                  <p className="font-display text-base font-semibold text-marica-ink">
                    Produk tidak ditemukan
                  </p>
                  <p className="max-w-xs font-body text-sm text-marica-ink-soft">
                    Coba ubah kata kunci atau atur ulang filter pencarianmu.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-4 py-2 font-body text-sm font-semibold text-white transition hover:brightness-105"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Filter
                  </button>
                </div>
              )}

              {!error && !isLoading && products.length > 0 && (
                <div className="grid grid-cols-2 gap-3.5 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="mt-9 flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-marica-ink/10 bg-white text-marica-ink-soft transition hover:bg-marica-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman sebelumnya"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {pageNumbers.map((n, i) =>
                    n === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="flex h-9 w-9 items-center justify-center font-body text-sm text-marica-ink-soft"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setPage(n)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full font-body text-sm font-semibold transition ${
                          n === page
                            ? "bg-marica-amber-dark text-white shadow-sm"
                            : "border border-marica-ink/10 bg-white text-marica-ink-soft hover:bg-marica-cream"
                        }`}
                      >
                        {n}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-marica-ink/10 bg-white text-marica-ink-soft transition hover:bg-marica-cream disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Halaman berikutnya"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
              className="fixed inset-0 z-40 bg-marica-ink/40 lg:hidden"
            />
            <motion.div
              key="drawer"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-8 shadow-[0_-14px_35px_rgba(120,60,10,0.15)] lg:hidden"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="mx-auto h-1.5 w-12 rounded-full bg-marica-ink/10" />
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Tutup filter"
                className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-marica-cream text-marica-ink-soft"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="mt-6">
                <FilterPanel
                  categories={categories}
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleReset}
                />
              </div>

              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="mt-7 w-full rounded-full bg-marica-amber-dark py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Terapkan Filter
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Builds a compact page-number list with ellipses, e.g. [1, 2, 3, "...", 9]
function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, 2, total - 1, total, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);

  const result: (number | "...")[] = [];
  let prev = 0;
  for (const n of sorted) {
    if (prev && n - prev > 1) result.push("...");
    result.push(n);
    prev = n;
  }
  return result;
}
