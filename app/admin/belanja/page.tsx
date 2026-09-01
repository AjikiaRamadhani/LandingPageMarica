"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, ImageOff, Tags } from "lucide-react";
import DeleteProductModal from "../../components/admin/DeleteProductModal";
import { categoryBadgeStyle } from "@/lib/category-color";

type ApiCategory = { id: string; name: string; slug: string; colorTag: string | null };
type ApiProductImage = { id: string; url: string; isVideo: boolean };
type ApiProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isBestSeller: boolean;
  createdAt: string;
  category: ApiCategory | null;
  images: ApiProductImage[];
};
type ProductsResponse = {
  products: ApiProduct[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const TABS = [
  { label: "Semua", value: "" },
  { label: "Tersedia", value: "in_stock" },
  { label: "Stok Habis", value: "out_of_stock" },
  { label: "Nonaktif", value: "inactive" },
] as const;

const LIMIT = 10;

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function AdminBelanjaPage() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["value"]>("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ProductsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<ApiProduct | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (activeTab) params.set("status", activeTab);
      if (debouncedQuery) params.set("search", debouncedQuery);

      const res = await fetch(`/api/admin/products?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Gagal memuat produk");
      const json = (await res.json()) as ProductsResponse;
      setData(json);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar produk. Coba muat ulang halaman.");
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, debouncedQuery, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openDeleteModal = (product: ApiProduct) => {
    setActionError(null);
    setToDelete(product);
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/products/${toDelete.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menghapus produk");
      setToDelete(null);
      await fetchProducts();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-marica-ink">Manajemen Produk</h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Kelola semua produk yang tampil di halaman Belanja Marica.
          </p>
        </div>
        <div className="flex gap-2.5">
          <Link
            href="/admin/belanja/kategori"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-black/10 px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-black/3 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-ink/10"
          >
            <Tags className="h-4 w-4" />
            Kelola Kategori
          </Link>
          <Link
            href="/admin/belanja/baru"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
          >
            <Plus className="h-4 w-4" />
            Tambah Produk
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1 rounded-full bg-marica-sky-light/40 p-1">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                type="button"
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`relative rounded-full px-4 py-1.5 font-body text-sm font-medium transition-colors ${
                  activeTab === tab.value ? "text-white" : "text-marica-ink-soft hover:text-marica-ink"
                }`}
              >
                {activeTab === tab.value && (
                  <motion.span
                    layoutId="admin-belanja-tab"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-marica-amber-dark"
                  />
                )}
                <span className="relative">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama produk..."
              className="w-full rounded-full border border-black/10 bg-marica-sky-light/30 py-2 pl-10 pr-4 font-body text-sm text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            />
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Produk</th>
                <th className="py-3 pr-4">Kategori</th>
                <th className="py-3 pr-4">Harga</th>
                <th className="py-3 pr-4">Stok</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-4 pr-4" colSpan={6}>
                      <div className="h-10 animate-pulse rounded-lg bg-black/5" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-body text-sm text-marica-rose-deep">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && data?.products.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-body text-sm text-marica-ink-soft">
                    Belum ada produk yang cocok dengan filter ini.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                data?.products.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-marica-sky-light/60">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.images[0].url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-marica-ink-soft/40" />
                          )}
                        </div>
                        <span className="line-clamp-2 max-w-xs font-body text-sm font-medium text-marica-ink">
                          {product.name}
                          {product.isBestSeller && (
                            <span className="ml-1.5 rounded-full bg-marica-amber-dark/10 px-1.5 py-0.5 font-body text-[10px] font-semibold text-marica-amber-text">
                              Best Seller
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      {product.category ? (
                        <span
                          className="rounded-full px-2.5 py-1 font-body text-xs font-medium"
                          style={categoryBadgeStyle(product.category.colorTag, product.category.slug)}
                        >
                          {product.category.name}
                        </span>
                      ) : (
                        <span className="font-body text-xs text-marica-ink-soft/50">Tanpa kategori</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">{product.stock}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${
                          !product.isActive
                            ? "bg-black/5 text-marica-ink-soft"
                            : product.stock > 0
                              ? "bg-marica-green/15 text-marica-green"
                              : "bg-marica-rose-deep/10 text-marica-rose-deep"
                        }`}
                      >
                        {!product.isActive ? "Nonaktif" : product.stock > 0 ? "Tersedia" : "Stok Habis"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/belanja/${product.id}`}
                          title="Edit"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-marica-ink-soft transition hover:bg-marica-sky-light/60 hover:text-marica-ink active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          title="Hapus"
                          onClick={() => openDeleteModal(product)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-marica-ink-soft transition hover:bg-marica-rose-deep/10 hover:text-marica-rose-deep active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-rose-deep/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>

        {actionError && <p className="mt-3 font-body text-sm text-marica-rose-deep">{actionError}</p>}

        {!isLoading && data && data.pagination.total > 0 && (
          <div className="mt-5 flex flex-col gap-3 font-body text-sm text-marica-ink-soft sm:flex-row sm:items-center sm:justify-between">
            <span>
              Menampilkan {(data.pagination.page - 1) * data.pagination.limit + 1}–
              {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} dari{" "}
              {data.pagination.total} produk
            </span>
            <div className="flex items-center justify-between gap-1.5 sm:justify-start">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg px-3 py-1.5 transition hover:bg-black/5 active:scale-[0.97] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/20"
              >
                Sebelumnya
              </button>
              <span className="px-2">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="rounded-lg px-3 py-1.5 transition hover:bg-black/5 active:scale-[0.97] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/20"
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </motion.div>

      <DeleteProductModal
        productName={toDelete?.name ?? null}
        isDeleting={isDeleting}
        error={actionError}
        onCancel={() => {
          setToDelete(null);
          setActionError(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
