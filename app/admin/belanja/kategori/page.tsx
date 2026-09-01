"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tag, ArrowLeft, ImageOff } from "lucide-react";
import ProductCategoryFormModal, {
  type ProductCategoryFormValues,
} from "../../../components/admin/ProductCategoryFormModal";
import DeleteProductCategoryModal from "../../../components/admin/DeleteProductCategoryModal";
import { categoryBadgeStyle } from "@/lib/category-color";

type ApiProductCategory = {
  id: string;
  name: string;
  slug: string;
  colorTag: string | null;
  imageUrl: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number };
};

export default function AdminBelanjaKategoriPage() {
  const [categories, setCategories] = useState<ApiProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<ProductCategoryFormValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<ApiProductCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/product-categories", { cache: "no-store" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Gagal memuat kategori");
      setCategories(Array.isArray(json) ? json : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat kategori");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openAddForm = () => {
    setFormInitial({ id: null, name: "", colorTag: "", imageUrl: "", parentId: "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (category: ApiProductCategory) => {
    setFormInitial({
      id: category.id,
      name: category.name,
      colorTag: category.colorTag ?? "",
      imageUrl: category.imageUrl ?? "",
      parentId: category.parent?.id ?? "",
    });
    setFormError(null);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: {
    name: string;
    colorTag: string;
    imageUrl: string | null;
    parentId: string | null;
  }) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const isEdit = !!formInitial?.id;
      const res = await fetch(
        isEdit ? `/api/admin/product-categories/${formInitial!.id}` : "/api/admin/product-categories",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan kategori");

      setFormOpen(false);
      await fetchCategories();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan kategori");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/admin/product-categories/${toDelete.id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menghapus kategori");
      setToDelete(null);
      await fetchCategories();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Gagal menghapus kategori");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <Link
            href="/admin/belanja"
            className="mb-2 inline-flex items-center gap-1.5 font-body text-sm font-medium text-marica-ink-soft transition hover:text-marica-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Produk
          </Link>
          <h1 className="font-display text-2xl font-semibold text-marica-ink">Kategori Produk</h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Kelola kategori yang dipakai untuk mengelompokkan produk di halaman Belanja.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
        >
          <Plus className="h-4 w-4" />
          Tambah Kategori
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Kategori</th>
                <th className="py-3 pr-4">Induk</th>
                <th className="py-3 pr-4">Slug</th>
                <th className="py-3 pr-4">Jumlah Produk</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-4 pr-4" colSpan={5}>
                      <div className="h-10 animate-pulse rounded-lg bg-black/5" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={5} className="py-10 text-center font-body text-sm text-marica-rose-deep">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center font-body text-sm text-marica-ink-soft">
                    Belum ada kategori. Klik &ldquo;Tambah Kategori&rdquo; untuk membuat yang pertama.
                  </td>
                </tr>
              )}

              {!isLoading &&
                !error &&
                categories.map((category, i) => (
                  <motion.tr
                    key={category.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04 }}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-marica-sky-light/60">
                          {category.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={category.imageUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <ImageOff className="h-4 w-4 text-marica-ink-soft/40" />
                          )}
                        </div>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium"
                          style={categoryBadgeStyle(category.colorTag, category.slug)}
                        >
                          <Tag className="h-3 w-3" />
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {category.parent?.name ?? "-"}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">{category.slug}</td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {category._count.products} produk
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEditForm(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-marica-ink-soft transition hover:bg-marica-sky-light/60 hover:text-marica-ink active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Hapus"
                          onClick={() => {
                            setDeleteError(null);
                            setToDelete(category);
                          }}
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
      </motion.div>

      <ProductCategoryFormModal
        isOpen={formOpen}
        initialValues={formInitial}
        parentOptions={categories.map((c) => ({ id: c.id, name: c.name }))}
        isSaving={isSaving}
        submitError={formError}
        onClose={() => !isSaving && setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteProductCategoryModal
        categoryName={toDelete?.name ?? null}
        productCount={toDelete?._count.products ?? 0}
        isDeleting={isDeleting}
        error={deleteError}
        onCancel={() => {
          setToDelete(null);
          setDeleteError(null);
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
