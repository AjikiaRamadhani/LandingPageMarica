"use client";

import { useCallback, useEffect, useRef, useState, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  UploadCloud,
  Loader2,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Video,
  ImageIcon,
  Wand2,
} from "lucide-react";

type ApiCategory = { id: string; name: string; slug: string; colorTag: string | null };

export type ProductFormImage = {
  id: string;
  url: string;
  isVideo: boolean;
};

export type ProductFormInitialData = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  ageMin: number | null;
  ageMax: number | null;
  skillFocus: string[];
  playerCount: string | null;
  isBestSeller: boolean;
  isActive: boolean;
  categoryId: string | null;
  images: ProductFormImage[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toNumberOrNull(value: string): number | null {
  if (value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export default function ProductForm({ initialData }: { initialData?: ProductFormInitialData }) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [price, setPrice] = useState(initialData ? String(initialData.price) : "");
  const [compareAtPrice, setCompareAtPrice] = useState(
    initialData?.compareAtPrice != null ? String(initialData.compareAtPrice) : ""
  );
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : "0");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "");
  const [ageMin, setAgeMin] = useState(initialData?.ageMin != null ? String(initialData.ageMin) : "");
  const [ageMax, setAgeMax] = useState(initialData?.ageMax != null ? String(initialData.ageMax) : "");
  const [playerCount, setPlayerCount] = useState(initialData?.playerCount ?? "");
  const [skillFocus, setSkillFocus] = useState<string[]>(initialData?.skillFocus ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [isBestSeller, setIsBestSeller] = useState(initialData?.isBestSeller ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [images, setImages] = useState<ProductFormImage[]>(initialData?.images ?? []);

  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/product-categories")
      .then((res) => res.json())
      .then((json: ApiCategory[]) => setCategories(Array.isArray(json) ? json : []))
      .catch(() => setCategories([]));
  }, []);

  // Auto-slug dari nama sampai user pertama kali edit slug secara manual
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name));
  }, [name, slugTouched]);

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error ?? "Gagal mengunggah file");
    return json.url as string;
  }, []);

  const handleFiles = async (fileList: FileList | File[] | undefined) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setUploadError(null);
    setIsUploadingImage(true);
    try {
      for (const file of files) {
        const url = await uploadFile(file);
        setImages((prev) => [
          ...prev,
          { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, url, isVideo: file.type.startsWith("video/") },
        ]);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengunggah file");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setImages((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const addSkill = () => {
    const value = skillInput.trim();
    if (!value || skillFocus.includes(value)) {
      setSkillInput("");
      return;
    }
    setSkillFocus((prev) => [...prev, value]);
    setSkillInput("");
  };

  const removeSkill = (value: string) => {
    setSkillFocus((prev) => prev.filter((s) => s !== value));
  };

  const buildPayload = () => ({
    name: name.trim(),
    slug: slug.trim(),
    description: description.trim(),
    price: Number(price),
    compareAtPrice: toNumberOrNull(compareAtPrice),
    stock: Number(stock) || 0,
    categoryId: categoryId || null,
    ageMin: toNumberOrNull(ageMin),
    ageMax: toNumberOrNull(ageMax),
    playerCount: playerCount.trim() || null,
    skillFocus,
    isBestSeller,
    isActive,
    images: images.map((img, i) => ({ url: img.url, isVideo: img.isVideo, order: i })),
  });

  const handleSubmit = async () => {
    setSubmitError(null);

    if (!name.trim()) {
      setSubmitError("Nama produk wajib diisi");
      return;
    }
    if (!slug.trim()) {
      setSubmitError("Slug produk wajib diisi");
      return;
    }
    if (!price || Number(price) <= 0) {
      setSubmitError("Harga produk wajib diisi dan lebih dari 0");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${initialData!.id}` : "/api/admin/products", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error ?? "Gagal menyimpan produk");

      router.push("/admin/belanja");
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal menyimpan produk");
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-marica-ink">
          {isEdit ? "Edit Produk" : "Tambah Produk Baru"}
        </h1>
        <p className="mt-1 font-body text-sm text-marica-ink-soft">
          Kelola detail produk yang tampil di halaman Belanja.
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-5">
          <div>
            <label htmlFor="p-name" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Nama Produk
            </label>
            <input
              id="p-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="mis. Animal Adventure Trail Board Game"
              className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            />
          </div>

          <div>
            <label htmlFor="p-slug" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Slug (URL)
            </label>
            <div className="flex gap-2">
              <input
                id="p-slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="animal-adventure-trail"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
              <button
                type="button"
                title="Buat ulang dari nama"
                onClick={() => {
                  setSlug(slugify(name));
                  setSlugTouched(false);
                }}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-black/10 px-3 font-body text-sm text-marica-ink-soft transition hover:bg-black/3"
              >
                <Wand2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 font-body text-xs text-marica-ink-soft/60">
              Tampil di: /belanja/{slug || "..."}
            </p>
          </div>

          <div>
            <label htmlFor="p-desc" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Deskripsi
            </label>
            <textarea
              id="p-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Ceritakan manfaat dan fitur produk ini..."
              className="w-full resize-none rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="p-price" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Harga (Rp)
              </label>
              <input
                id="p-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="125000"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
            <div>
              <label htmlFor="p-compare" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Harga Coret (opsional)
              </label>
              <input
                id="p-compare"
                type="number"
                min={0}
                value={compareAtPrice}
                onChange={(e) => setCompareAtPrice(e.target.value)}
                placeholder="180000"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
            <div>
              <label htmlFor="p-stock" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Stok
              </label>
              <input
                id="p-stock"
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-category" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Kategori
            </label>
            <select
              id="p-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
            >
              <option value="">Tanpa kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="p-agemin" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Usia Minimal (thn)
              </label>
              <input
                id="p-agemin"
                type="number"
                min={0}
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="4"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
            <div>
              <label htmlFor="p-agemax" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Usia Maksimal (thn)
              </label>
              <input
                id="p-agemax"
                type="number"
                min={0}
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="6"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
            <div>
              <label htmlFor="p-players" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                Jumlah Pemain
              </label>
              <input
                id="p-players"
                type="text"
                value={playerCount}
                onChange={(e) => setPlayerCount(e.target.value)}
                placeholder="2-4 Pemain"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="p-skill" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Fokus Skill
            </label>
            <div className="flex gap-2">
              <input
                id="p-skill"
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="mis. Kognitif, lalu Enter"
                className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
              />
              <button
                type="button"
                onClick={addSkill}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-black/10 px-4 font-body text-sm font-medium text-marica-ink-soft transition hover:bg-black/3"
              >
                <Plus className="h-4 w-4" />
                Tambah
              </button>
            </div>
            {skillFocus.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {skillFocus.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-full bg-marica-violet/15 px-3 py-1 font-body text-xs font-medium text-marica-violet-deep"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-marica-violet-deep/60 hover:text-marica-violet-deep"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Gambar & video produk */}
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
              Gambar &amp; Video Produk
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                isDragging ? "border-marica-amber bg-marica-amber/5" : "border-black/15 bg-marica-sky-light/20"
              }`}
            >
              {isUploadingImage ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-marica-amber-dark" />
                  <span className="font-body text-sm text-marica-ink-soft">Mengunggah...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-6 w-6 text-marica-ink-soft/60" />
                  <p className="font-body text-sm text-marica-ink-soft">
                    Drag &amp; drop gambar/video di sini, atau
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-body text-sm font-semibold text-marica-amber-text underline underline-offset-2"
                  >
                    pilih file
                  </button>
                  <span className="font-body text-xs text-marica-ink-soft/50">
                    Bisa pilih beberapa sekaligus. Gambar tampil pertama sebagai cover.
                  </span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  handleFiles(e.target.files ?? undefined);
                  e.target.value = "";
                }}
              />
            </div>
            {uploadError && <p className="mt-1.5 font-body text-xs text-marica-rose-deep">{uploadError}</p>}

            {images.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {images.map((img, i) => (
                  <div
                    key={img.id}
                    className="relative flex w-24 flex-col items-center gap-1.5 rounded-xl border border-black/10 bg-white p-2"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-lg bg-marica-sky-light/40">
                      {img.isVideo ? (
                        <span className="flex h-full w-full items-center justify-center">
                          <Video className="h-6 w-6 text-marica-ink-soft/50" />
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img.url} alt="" className="h-full w-full object-cover" />
                      )}
                      {i === 0 && (
                        <span className="absolute left-1 top-1 rounded bg-marica-amber-dark px-1.5 py-0.5 font-body text-[9px] font-semibold text-white">
                          Cover
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Pindah ke kiri"
                        disabled={i === 0}
                        onClick={() => moveImage(i, -1)}
                        className="flex h-6 w-6 items-center justify-center rounded text-marica-ink-soft transition hover:bg-black/5 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        title="Pindah ke kanan"
                        disabled={i === images.length - 1}
                        onClick={() => moveImage(i, 1)}
                        className="flex h-6 w-6 items-center justify-center rounded text-marica-ink-soft transition hover:bg-black/5 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3 -rotate-90" />
                      </button>
                      <button
                        type="button"
                        title="Hapus"
                        onClick={() => removeImage(img.id)}
                        className="flex h-6 w-6 items-center justify-center rounded text-marica-rose-deep transition hover:bg-marica-rose-deep/10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-marica-sky-light/20 px-4 py-3">
              <span className="flex items-center gap-2 font-body text-sm font-medium text-marica-ink">
                <ImageIcon className="h-4 w-4 text-marica-ink-soft" />
                Tampilkan di Toko
              </span>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-5 w-5 accent-marica-amber-dark"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-black/10 bg-marica-sky-light/20 px-4 py-3">
              <span className="font-body text-sm font-medium text-marica-ink">Tandai sebagai Best Seller</span>
              <input
                type="checkbox"
                checked={isBestSeller}
                onChange={(e) => setIsBestSeller(e.target.checked)}
                className="h-5 w-5 accent-marica-amber-dark"
              />
            </label>
          </div>

          {submitError && <p className="font-body text-sm text-marica-rose-deep">{submitError}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-black/5 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => router.push("/admin/belanja")}
              className="rounded-full border border-black/10 px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-black/3 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-ink/10"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={submitting || isUploadingImage}
              onClick={handleSubmit}
              className="flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Simpan Perubahan" : "Tambah Produk"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
