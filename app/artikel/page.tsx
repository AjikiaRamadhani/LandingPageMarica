"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Tag } from "lucide-react";
import CategoryFormModal, { type CategoryFormValues } from "../components/admin/CategoryFormModal";
import DeleteCategoryModal from "../components/admin/DeleteCategoryModal";
import { categoryBadgeStyle } from "@/lib/category-color";

type ApiCategory = {
  id: string;
  name: string;
  slug: string;
  colorTag: string | null;
  _count: { articles: number };
};

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<CategoryFormValues | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [toDelete, setToDelete] = useState<ApiCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/article-categories", { cache: "no-store" });
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
    setFormInitial({ id: null, name: "", colorTag: "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openEditForm = (category: ApiCategory) => {
    setFormInitial({ id: category.id, name: category.name, colorTag: category.colorTag ?? "" });
    setFormError(null);
    setFormOpen(true);
  };

  const openDeleteModal = (category: ApiCategory) => {
    setDeleteError(null);
    setToDelete(category);
  };

  const handleFormSubmit = async (values: { name: string; colorTag: string }) => {
    setIsSaving(true);
    setFormError(null);
    try {
      const isEdit = !!formInitial?.id;
      const res = await fetch(
        isEdit ? `/api/admin/article-categories/${formInitial!.id}` : "/api/admin/article-categories",
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
      const res = await fetch(`/api/admin/article-categories/${toDelete.id}`, { method: "DELETE" });
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
          <h1 className="font-display text-2xl font-semibold text-marica-ink">Kategori Artikel</h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Kelola kategori yang dipakai untuk mengelompokkan artikel blog Marica.
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
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Kategori</th>
                <th className="py-3 pr-4">Slug</th>
                <th className="py-3 pr-4">Jumlah Artikel</th>
                <th className="py-3 pr-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-black/5">
                    <td className="py-4 pr-4" colSpan={4}>
                      <div className="h-10 animate-pulse rounded-lg bg-black/5" />
                    </td>
                  </tr>
                ))}

              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="py-10 text-center font-body text-sm text-marica-rose-deep">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && categories.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center font-body text-sm text-marica-ink-soft">
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
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-body text-xs font-medium"
                        style={categoryBadgeStyle(category.colorTag, category.slug)}
                      >
                        <Tag className="h-3 w-3" />
                        {category.name}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">{category.slug}</td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {category._count.articles} artikel
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
                          onClick={() => openDeleteModal(category)}
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

      <CategoryFormModal
        isOpen={formOpen}
        initialValues={formInitial}
        isSaving={isSaving}
        submitError={formError}
        onClose={() => !isSaving && setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <DeleteCategoryModal
        categoryName={toDelete?.name ?? null}
        articleCount={toDelete?._count.articles ?? 0}
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