"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { isValidHexColor, FALLBACK_PALETTE } from "@/lib/category-color";

export type CategoryFormValues = {
  id: string | null;
  name: string;
  colorTag: string;
};

const DEFAULT_COLOR = FALLBACK_PALETTE[0];

export default function CategoryFormModal({
  initialValues,
  isOpen,
  isSaving,
  submitError,
  onClose,
  onSubmit,
}: {
  initialValues: CategoryFormValues | null;
  isOpen: boolean;
  isSaving: boolean;
  submitError?: string | null;
  onClose: () => void;
  onSubmit: (values: { name: string; colorTag: string }) => Promise<void> | void;
}) {
  const isEdit = !!initialValues?.id;

  const [name, setName] = useState("");
  const [colorTag, setColorTag] = useState(DEFAULT_COLOR);
  const [error, setError] = useState<string | null>(null);
  const displayError = error ?? submitError ?? null;

  // Reset form tiap kali modal dibuka, baik buat "tambah" (initialValues.id
  // null) maupun "edit" (terisi dari kategori yang diklik).
  useEffect(() => {
    if (!isOpen) return;
    setName(initialValues?.name ?? "");
    setColorTag(
      initialValues?.colorTag && isValidHexColor(initialValues.colorTag)
        ? initialValues.colorTag
        : DEFAULT_COLOR
    );
    setError(null);
  }, [isOpen, initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nama kategori wajib diisi");
      return;
    }
    if (!isValidHexColor(colorTag)) {
      setError("Pilih warna kategori yang valid");
      return;
    }
    setError(null);
    await onSubmit({ name: name.trim(), colorTag });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => !isSaving && onClose()}
        >
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold text-marica-ink">
                {isEdit ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex h-9 w-9 items-center justify-center rounded-full text-marica-ink-soft transition hover:bg-black/5 active:scale-[0.95] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-ink/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
              <div>
                <label htmlFor="cat-name" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                  Nama Kategori
                </label>
                <input
                  id="cat-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="mis. Tips Parenting"
                  autoFocus
                  className="w-full rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                />
              </div>

              <div>
                <label htmlFor="cat-color" className="mb-1.5 block font-body text-sm font-medium text-marica-ink">
                  Warna Badge
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="cat-color"
                    type="color"
                    value={colorTag}
                    onChange={(e) => setColorTag(e.target.value)}
                    className="h-10 w-14 shrink-0 cursor-pointer rounded-lg border border-black/10 bg-white p-1"
                  />
                  <input
                    type="text"
                    value={colorTag}
                    onChange={(e) => setColorTag(e.target.value)}
                    placeholder="#66a7c7"
                    className="min-w-[120px] flex-1 rounded-xl border border-black/10 bg-marica-sky-light/30 px-4 py-2.5 font-body text-[15px] uppercase text-marica-ink outline-none transition focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
                  />
                  <span
                    className="shrink-0 rounded-full px-3 py-1.5 font-body text-xs font-semibold"
                    style={{
                      backgroundColor: isValidHexColor(colorTag) ? `${colorTag}1A` : "#0000000d",
                      color: isValidHexColor(colorTag) ? colorTag : "#6b7280",
                    }}
                  >
                    {name.trim() || "Pratinjau"}
                  </span>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {FALLBACK_PALETTE.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => setColorTag(hex)}
                      title={hex}
                      style={{ backgroundColor: hex }}
                      className={`h-6 w-6 rounded-full transition ${
                        colorTag.toLowerCase() === hex.toLowerCase()
                          ? "ring-2 ring-marica-ink ring-offset-2"
                          : "hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {displayError && <p className="font-body text-sm text-marica-rose-deep">{displayError}</p>}

              <div className="mt-1 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="rounded-full border border-black/10 px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-black/3 active:scale-[0.97] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-ink/10"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 active:scale-[0.97] disabled:opacity-70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/25"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEdit ? "Simpan Perubahan" : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
