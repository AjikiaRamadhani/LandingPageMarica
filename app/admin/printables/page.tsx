"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { motion } from "framer-motion";
import {
  FileImage,
  FileUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import ConfirmActionModal from "../../components/admin/ConfirmActionModal";

type Printable = {
  id: string;
  title: string;
  slug: string;
  description: string;
  subject: string;
  ageMin: number | null;
  ageMax: number | null;
  thumbnailUrl: string | null;
  fileUrl: string;
  price: number;
  isFeatured: boolean;
  downloadCount: number;
  isActive: boolean;
  createdAt: string;
  _count?: { leads: number };
};
type Lead = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  printable: { title: string };
};
type FormState = Omit<
  Printable,
  "id" | "downloadCount" | "createdAt" | "_count"
>;

const EMPTY_FORM: FormState = {
  title: "",
  slug: "",
  description: "",
  subject: "",
  ageMin: null,
  ageMax: null,
  thumbnailUrl: null,
  fileUrl: "",
  price: 0,
  isFeatured: false,
  isActive: true,
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAge(item: Printable) {
  if (item.ageMin === null && item.ageMax === null) return "Semua usia";
  return `${item.ageMin ?? "?"}-${item.ageMax ?? "?"} tahun`;
}

export default function AdminPrintablesPage() {
  const [printables, setPrintables] = useState<Printable[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Printable | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [printableToDelete, setPrintableToDelete] = useState<Printable | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPrintables = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/printables", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat printable");
      setPrintables(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat printable",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadLeads = useCallback(async () => {
    setIsLeadsLoading(true);
    try {
      const response = await fetch("/api/admin/printable-leads?limit=10", {
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat leads");
      setLeads(data.leads ?? []);
    } catch (loadError) {
      setActionError(
        loadError instanceof Error ? loadError.message : "Gagal memuat leads",
      );
    } finally {
      setIsLeadsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function load() {
      await Promise.all([loadPrintables(), loadLeads()]);
    }
    load();
  }, [loadLeads, loadPrintables]);

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };
  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActionError(null);
    setIsFormOpen(true);
  };
  const openEdit = (item: Printable) => {
    setEditing(item);
    setActionError(null);
    setIsFormOpen(true);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      subject: item.subject,
      ageMin: item.ageMin,
      ageMax: item.ageMax,
      thumbnailUrl: item.thumbnailUrl,
      fileUrl: item.fileUrl,
      price: item.price,
      isFeatured: item.isFeatured,
      isActive: item.isActive,
    });
  };
  const updateField = (
    field: keyof FormState,
    value: string | number | boolean | null,
  ) => setForm((current) => ({ ...current, [field]: value }));

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setActionError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/printables/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal upload PDF");
      updateField("fileUrl", data.fileUrl);
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error ? uploadError.message : "Gagal upload PDF",
      );
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleThumbnailUpload = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploadingThumbnail(true);
    setActionError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal upload thumbnail");
      updateField("thumbnailUrl", data.url);
    } catch (uploadError) {
      setActionError(
        uploadError instanceof Error
          ? uploadError.message
          : "Gagal upload thumbnail",
      );
    } finally {
      setIsUploadingThumbnail(false);
      event.target.value = "";
    }
  };

  const handleSave = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.subject.trim() ||
      !form.fileUrl.trim()
    ) {
      setActionError("Judul, deskripsi, subject, dan file PDF wajib diisi");
      return;
    }
    setIsSaving(true);
    setActionError(null);
    try {
      const response = await fetch(
        editing
          ? `/api/admin/printables/${editing.id}`
          : "/api/admin/printables",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Gagal menyimpan printable");
      closeForm();
      await loadPrintables();
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan printable",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openDelete = (item: Printable) => {
    setActionError(null);
    setPrintableToDelete(item);
  };

  const handleDelete = async () => {
    if (!printableToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/printables/${printableToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Gagal menonaktifkan printable");
      setPrintableToDelete(null);
      await loadPrintables();
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Gagal menonaktifkan printable",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPrintables = printables.filter((item) =>
    `${item.title} ${item.subject}`.toLowerCase().includes(query.toLowerCase()),
  );
  const fieldClass =
    "mt-1 w-full rounded-xl border border-black/10 bg-marica-sky-light/20 px-3.5 py-2.5 font-body text-sm text-marica-ink outline-none focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15";

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-marica-ink">
            Printable
          </h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Kelola materi download dan data leads dari aktivitas Printable.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" /> Tambah Printable
        </button>
      </div>
      {(error || actionError) && (
        <p className="mt-5 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
          {error ?? actionError}
        </p>
      )}
      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari judul atau subject..."
            className="w-full rounded-full border border-black/10 bg-marica-sky-light/30 py-2 pl-10 pr-4 font-body text-sm text-marica-ink outline-none focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15"
          />
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-190 border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Printable</th>
                <th className="py-3 pr-4">Usia</th>
                <th className="py-3 pr-4">Download</th>
                <th className="py-3 pr-4">Leads</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center font-body text-sm text-marica-ink-soft"
                  >
                    Memuat printable...
                  </td>
                </tr>
              )}
              {!isLoading && filteredPrintables.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-10 text-center font-body text-sm text-marica-ink-soft"
                  >
                    Belum ada printable yang cocok.
                  </td>
                </tr>
              )}
              {!isLoading &&
                filteredPrintables.map((item, index) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-body text-sm font-semibold text-marica-ink">
                        {item.title}
                      </p>
                      <p className="mt-0.5 font-body text-xs text-marica-ink-soft">
                        {item.subject} · {formatDate(item.createdAt)}
                      </p>
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {formatAge(item)}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink">
                      {item.downloadCount}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink">
                      {item._count?.leads ?? 0}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${item.isActive ? "bg-marica-green/15 text-marica-green" : "bg-black/5 text-marica-ink-soft"}`}
                      >
                        {item.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          title="Edit printable"
                          className="rounded-lg p-2 text-marica-ink-soft hover:bg-marica-sky-light/60 hover:text-marica-ink"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {item.isActive && (
                          <button
                            type="button"
                            onClick={() => openDelete(item)}
                            title="Nonaktifkan printable"
                            className="rounded-lg p-2 text-marica-ink-soft hover:bg-marica-rose-deep/10 hover:text-marica-rose-deep"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-marica-amber-dark" />
          <h2 className="font-display text-base font-semibold text-marica-ink">
            Lead Download Terbaru
          </h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-155 border-collapse">
            <thead>
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Nama</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Printable</th>
                <th className="py-3">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {isLeadsLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center font-body text-sm text-marica-ink-soft"
                  >
                    Memuat leads...
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-3 pr-4 font-body text-sm font-medium text-marica-ink">
                      {lead.name}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {lead.email}
                    </td>
                    <td className="py-3 pr-4 font-body text-sm text-marica-ink-soft">
                      {lead.printable.title}
                    </td>
                    <td className="py-3 font-body text-sm text-marica-ink-soft">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-marica-ink/30 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <form
            onSubmit={handleSave}
            className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-xl sm:p-7"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-marica-ink">
                  {editing ? "Edit Printable" : "Tambah Printable"}
                </h2>
                <p className="mt-1 font-body text-sm text-marica-ink-soft">
                  Lengkapi data materi dan file PDF.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                title="Tutup"
                className="rounded-lg p-2 text-marica-ink-soft hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="font-body text-sm font-medium text-marica-ink">
                  Thumbnail aktivitas
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-marica-sky-light/50">
                    {form.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={form.thumbnailUrl}
                        alt="Preview thumbnail"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FileImage className="h-6 w-6 text-marica-ink-soft/40" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-marica-sky-light px-4 py-2.5 font-body text-sm font-semibold text-marica-ink">
                      <FileImage className="h-4 w-4" />
                      {isUploadingThumbnail ? "Upload..." : "Pilih gambar"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleThumbnailUpload}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 font-body text-xs text-marica-ink-soft">
                      JPG, PNG, WEBP, atau GIF maksimal 2MB.
                    </p>
                  </div>
                </div>
              </label>
              <label className="sm:col-span-2">
                <span className="font-body text-sm font-medium text-marica-ink">
                  Judul
                </span>
                <input
                  required
                  value={form.title}
                  onChange={(event) => updateField("title", event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label>
                <span className="font-body text-sm font-medium text-marica-ink">
                  Slug (opsional)
                </span>
                <input
                  value={form.slug}
                  onChange={(event) => updateField("slug", event.target.value)}
                  className={fieldClass}
                />
              </label>
              <label>
                <span className="font-body text-sm font-medium text-marica-ink">
                  Subject
                </span>
                <input
                  required
                  value={form.subject}
                  onChange={(event) =>
                    updateField("subject", event.target.value)
                  }
                  className={fieldClass}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="font-body text-sm font-medium text-marica-ink">
                  Deskripsi
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  className={`${fieldClass} resize-y`}
                />
              </label>
              <label>
                <span className="font-body text-sm font-medium text-marica-ink">
                  Usia minimum
                </span>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={form.ageMin ?? ""}
                  onChange={(event) =>
                    updateField(
                      "ageMin",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className={fieldClass}
                />
              </label>
              <label>
                <span className="font-body text-sm font-medium text-marica-ink">
                  Usia maksimum
                </span>
                <input
                  type="number"
                  min="0"
                  max="18"
                  value={form.ageMax ?? ""}
                  onChange={(event) =>
                    updateField(
                      "ageMax",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                  className={fieldClass}
                />
              </label>
              <label className="sm:col-span-2">
                <span className="font-body text-sm font-medium text-marica-ink">
                  File PDF
                </span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={form.fileUrl}
                    placeholder="Upload PDF maksimal 15MB"
                    className={`${fieldClass} flex-1`}
                  />
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl bg-marica-sky-light px-4 py-2.5 font-body text-sm font-semibold text-marica-ink">
                    <FileUp className="h-4 w-4" />{" "}
                    {isUploading ? "Upload..." : "Pilih PDF"}
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(event) =>
                    updateField("isFeatured", event.target.checked)
                  }
                  className="h-4 w-4 accent-marica-amber-dark"
                />
                <span className="font-body text-sm text-marica-ink">
                  Tampilkan sebagai featured
                </span>
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField("isActive", event.target.checked)
                  }
                  className="h-4 w-4 accent-marica-amber-dark"
                />
                <span className="font-body text-sm text-marica-ink">
                  Aktif di halaman publik
                </span>
              </label>
            </div>
            {actionError && (
              <p className="mt-4 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
                {actionError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-black/10 px-5 py-2.5 font-body text-sm font-semibold text-marica-ink-soft"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading || isUploadingThumbnail}
                className="rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}
      <ConfirmActionModal
        isOpen={printableToDelete !== null}
        title="Nonaktifkan Printable?"
        description={
          <>
            Printable{" "}
            <span className="font-semibold text-marica-ink">&ldquo;{printableToDelete?.title}&rdquo;</span>{" "}
            tidak akan ditampilkan lagi kepada pengguna.
          </>
        }
        confirmLabel="Ya, Nonaktifkan"
        loadingLabel="Menonaktifkan..."
        isProcessing={isDeleting}
        error={actionError}
        onCancel={() => {
          setPrintableToDelete(null);
          setActionError(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
}
