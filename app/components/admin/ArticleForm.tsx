"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  ImageIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Loader2,
  X,
} from "lucide-react";

type ApiCategory = { id: string; name: string; slug: string; colorTag: string | null };

export type ArticleFormInitialData = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  coverImageUrl: string | null;
  categoryId: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
};

function toDateInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export default function ArticleForm({ initialData }: { initialData?: ArticleFormInitialData }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [publishedAt, setPublishedAt] = useState(toDateInputValue(initialData?.publishedAt ?? null));
  const [excerpt, setExcerpt] = useState(initialData?.excerpt ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(initialData?.coverImageUrl ?? "");

  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const contentImageInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedContent = useRef(false);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"draft" | "publish" | null>(null);

  useEffect(() => {
    fetch("/api/article-categories")
      .then((res) => res.json())
      .then((json: ApiCategory[]) => setCategories(Array.isArray(json) ? json : []))
      .catch(() => setCategories([]));
  }, []);

  // contentEditable diisi sekali dari initialData (edit mode) supaya kursor
  // tidak lompat tiap re-render. Perubahan berikutnya dibaca lewat onInput.
  useEffect(() => {
    if (contentRef.current && !hasInitializedContent.current) {
      contentRef.current.innerHTML = initialData?.content ?? "";
      hasInitializedContent.current = true;
    }
  }, [initialData?.content]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Gagal mengunggah gambar");
    return json.url as string;
  }, []);

  const handleCoverFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setIsUploadingCover(true);
    try {
      const url = await uploadFile(file);
      setCoverImageUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleCoverFile(e.dataTransfer.files?.[0]);
  };

  const exec = (command: string, value?: string) => {
    contentRef.current?.focus();
    document.execCommand(command, false, value);
  };

  const handleInsertLink = () => {
    const url = window.prompt("Masukkan URL tautan:");
    if (url) exec("createLink", url);
  };

  const handleInsertContentImage = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await uploadFile(file);
      exec("insertImage", url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah gambar");
    }
  };

  const buildPayload = (status: "DRAFT" | "PUBLISHED") => ({
    title: title.trim(),
    excerpt: excerpt.trim() || null,
    content: contentRef.current?.innerHTML ?? "",
    coverImageUrl: coverImageUrl || null,
    categoryId: categoryId || null,
    status,
    publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
  });

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    setSubmitError(null);

    const content = contentRef.current?.innerHTML?.trim() ?? "";
    if (!title.trim()) {
      setSubmitError("Judul artikel wajib diisi");
      return;
    }
    if (!content) {
      setSubmitError("Konten artikel wajib diisi");
      return;
    }

    setSubmitting(status === "PUBLISHED" ? "publish" : "draft");
    try {
      const res = await fetch(
        isEdit ? `/api/admin/articles/${initialData!.id}` : "/api/admin/articles",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload(status)),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan artikel");

      router.push("/admin/artikel");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan artikel");
      setSubmitting(null);
    }
  };

  const toolbarButtons = [
    { icon: Bold, label: "Tebal", action: () => exec("bold") },
    { icon: Italic, label: "Miring", action: () => exec("italic") },
    { icon: Underline, label: "Garis bawah", action: () => exec("underline") },
    { icon: List, label: "Daftar poin", action: () => exec("insertUnorderedList") },
    { icon: ListOrdered, label: "Daftar bernomor", action: () => exec("insertOrderedList") },
    { icon: Link2, label: "Tautan", action: handleInsertLink },
    { icon: ImageIcon, label: "Sisipkan gambar", action: () => contentImageInputRef.current?.click() },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-3xl"
    >
      <h1 className="font-display text-2xl font-semibold text-marica-ink">
        {isEdit ? "Edit Artikel" : "Tambah Artikel Baru"}
      </h1>
      <p className="mt-1 font-body text-sm text-marica-ink-soft">
        {isEdit ? "Perbarui isi artikel di bawah ini." : "Isi detail artikel yang ingin dipublikasikan."}
      </p>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6">
          <div>
            <label htmlFor="title" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Judul Artikel
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tulis judul artikel di sini..."
              className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Kategori
              </label>
              <select
                id="category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              >
                <option value="">Pilih kategori</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="publishedAt" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Tanggal Publish
              </label>
              <input
                id="publishedAt"
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-marica-ink">Cover Image</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative flex min-h-[140px] flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging ? "border-marica-amber bg-marica-amber/5" : "border-black/15 bg-marica-sky-light/20"
              }`}
            >
              {coverImageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coverImageUrl} alt="Cover artikel" className="h-32 w-full rounded-lg object-cover" />
                  <button
                    type="button"
                    onClick={() => setCoverImageUrl("")}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : isUploadingCover ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-marica-amber-dark" />
                  <span className="font-body text-sm text-marica-ink-soft">Mengunggah gambar...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-marica-ink-soft/60" />
                  <p className="font-body text-sm text-marica-ink-soft">
                    Drag &amp; drop gambar di sini, atau
                  </p>
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="font-body text-sm font-semibold text-marica-amber-text underline underline-offset-2"
                  >
                    pilih file
                  </button>
                  <span className="font-body text-xs text-marica-ink-soft/50">JPG, PNG, WEBP, maks. 5MB</span>
                </>
              )}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCoverFile(e.target.files?.[0])}
              />
            </div>
            {uploadError && <p className="mt-1.5 font-body text-xs text-marica-rose-deep">{uploadError}</p>}
          </div>

          <div>
            <label htmlFor="excerpt" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Ringkasan Singkat
            </label>
            <textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Ringkasan singkat artikel (opsional, tampil di daftar artikel)"
              className="w-full resize-none rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-marica-ink">Konten Artikel</label>
            <div className="overflow-hidden rounded-xl border border-black/10 bg-white focus-within:border-marica-amber focus-within:ring-4 focus-within:ring-marica-amber/15">
              <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-marica-sky-light/20 px-2 py-1.5">
                {toolbarButtons.map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    type="button"
                    title={label}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={action}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-marica-ink-soft transition hover:bg-white hover:text-marica-ink"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
                <input
                  ref={contentImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    handleInsertContentImage(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                data-placeholder="Mulai menulis artikel kamu di sini..."
                className="prose-content min-h-[240px] px-4 py-3 font-body text-[15px] leading-relaxed text-marica-ink outline-none [&_a]:text-marica-amber-text [&_a]:underline [&_img]:my-2 [&_img]:max-w-full [&_img]:rounded-lg [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              />
            </div>
            <p className="mt-1.5 font-body text-xs text-marica-ink-soft/50">
              Editor sederhana: tebal, miring, garis bawah, daftar, tautan, dan gambar.
            </p>
          </div>

          {submitError && <p className="font-body text-sm text-marica-rose-deep">{submitError}</p>}

          <div className="flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/artikel")}
              className="rounded-full border border-black/10 px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-black/3"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={submitting !== null}
              onClick={() => handleSubmit("DRAFT")}
              className="flex items-center justify-center gap-2 rounded-full border border-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10 disabled:opacity-60"
            >
              {submitting === "draft" && <Loader2 className="h-4 w-4 animate-spin" />}
              Simpan sebagai Draft
            </button>
            <button
              type="button"
              disabled={submitting !== null}
              onClick={() => handleSubmit("PUBLISHED")}
              className="flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:opacity-70"
            >
              {submitting === "publish" && <Loader2 className="h-4 w-4 animate-spin" />}
              Publish Sekarang
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
