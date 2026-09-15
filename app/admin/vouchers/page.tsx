"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  TicketPercent,
  Trash2,
  X,
} from "lucide-react";

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  pointsCost: number;
  discountAmount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type FormState = {
  code: string;
  title: string;
  description: string;
  pointsCost: string;
  discountAmount: string;
  expiresAt: string;
};

type StatusFilter = "ALL" | "ACTIVE" | "DRAFT" | "INACTIVE";

const emptyForm: FormState = {
  code: "",
  title: "",
  description: "",
  pointsCost: "",
  discountAmount: "",
  expiresAt: "",
};

const money = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

function formatDate(value: string | null) {
  if (!value) return "Tidak ada batas";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadVouchers() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/vouchers", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat voucher");
      setVouchers(Array.isArray(data) ? data : []);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Gagal memuat voucher");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadVouchers();
  }, []);

  const counts = useMemo(() => ({
    all: vouchers.length,
    active: vouchers.filter((voucher) => voucher.isActive).length,
    inactive: vouchers.filter((voucher) => !voucher.isActive).length,
    draft: 0,
  }), [vouchers]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return vouchers.filter((voucher) => {
      const matchesQuery = !normalized || `${voucher.code} ${voucher.title}`.toLowerCase().includes(normalized);
      const matchesStatus = status === "ALL" || (status === "ACTIVE" && voucher.isActive) || (status === "INACTIVE" && !voucher.isActive) || status === "DRAFT";
      return matchesQuery && matchesStatus;
    });
  }, [query, status, vouchers]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setIsFormOpen(true);
  }

  function openEdit(voucher: Voucher) {
    setEditing(voucher);
    setForm({
      code: voucher.code,
      title: voucher.title,
      description: voucher.description ?? "",
      pointsCost: String(voucher.pointsCost),
      discountAmount: String(voucher.discountAmount),
      expiresAt: voucher.expiresAt ? voucher.expiresAt.slice(0, 10) : "",
    });
    setIsFormOpen(true);
  }

  async function saveVoucher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setNotice(null);
    const payload = {
      code: form.code.trim(),
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      pointsCost: Number(form.pointsCost),
      discountAmount: Number(form.discountAmount),
      expiresAt: form.expiresAt ? new Date(`${form.expiresAt}T23:59:59`).toISOString() : null,
    };
    const response = await fetch(editing ? `/api/admin/vouchers/${editing.id}` : "/api/admin/vouchers", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    setIsSaving(false);
    if (!response.ok) {
      setNotice(data.error ?? "Gagal menyimpan voucher");
      return;
    }
    setIsFormOpen(false);
    setNotice(editing ? "Voucher berhasil diperbarui." : "Voucher berhasil dibuat.");
    await loadVouchers();
  }

  async function toggleVoucher(voucher: Voucher) {
    setActionId(voucher.id);
    const response = await fetch(`/api/admin/vouchers/${voucher.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !voucher.isActive }),
    });
    const data = await response.json().catch(() => ({}));
    setActionId(null);
    if (!response.ok) {
      setNotice(data.error ?? "Gagal mengubah status voucher");
      return;
    }
    setVouchers((current) => current.map((item) => item.id === voucher.id ? { ...item, isActive: !item.isActive } : item));
  }

  async function deleteVoucher(voucher: Voucher) {
    if (!window.confirm(`Hapus voucher ${voucher.code}?`)) return;
    setActionId(voucher.id);
    const response = await fetch(`/api/admin/vouchers/${voucher.id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));
    setActionId(null);
    if (!response.ok) {
      setNotice(data.error ?? "Gagal menghapus voucher");
      return;
    }
    setVouchers((current) => current.filter((item) => item.id !== voucher.id));
  }

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-5 border-b border-black/8 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-body text-xs font-semibold text-marica-ink-soft">Overview <span className="mx-1 text-marica-rose-deep">/</span> Vouchers</p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-marica-ink">Kelola Voucher</h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">Buat dan atur voucher Marica Points yang digunakan pengguna.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-black/5 px-3 py-2 font-body text-xs font-semibold text-marica-ink-soft">{counts.all} voucher di katalog</span>
          <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-marica-amber-dark px-4 py-2.5 font-body text-sm font-bold text-white shadow-sm transition hover:brightness-105"><Plus className="h-4 w-4" /> Buat Voucher</button>
        </div>
      </div>

      {notice && <div className="mt-4 flex items-center justify-between rounded-xl bg-marica-amber/10 px-4 py-3 font-body text-sm text-marica-amber-text"><span>{notice}</span><button type="button" onClick={() => setNotice(null)} aria-label="Tutup pesan"><X className="h-4 w-4" /></button></div>}

      <div className="mt-6 flex flex-wrap items-center gap-1 border-b border-black/8">
        {([ ["ALL", "Semua Voucher", counts.all], ["ACTIVE", "Aktif", counts.active], ["DRAFT", "Draft", counts.draft], ["INACTIVE", "Nonaktif", counts.inactive] ] as const).map(([value, label, count]) => <button key={value} type="button" onClick={() => setStatus(value)} className={`border-b-2 px-3 py-3 font-body text-sm font-semibold ${status === value ? "border-marica-rose-deep text-marica-rose-deep" : "border-transparent text-marica-ink-soft hover:text-marica-ink"}`}>{label} <span className="ml-1 rounded-full bg-black/5 px-1.5 py-0.5 text-[11px]">{count}</span></button>)}
      </div>

      <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-black/8 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama voucher..." className="w-full rounded-xl border border-black/10 bg-marica-cream/35 py-2.5 pl-9 pr-3 font-body text-sm outline-none focus:border-marica-amber-dark focus:ring-4 focus:ring-marica-amber/10" /></div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 px-3 py-2 font-body text-sm font-semibold text-marica-ink-soft hover:bg-marica-cream"><Filter className="h-4 w-4" /> Filter</button>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-black/8 bg-white shadow-sm">
        <div className="overflow-x-auto"><table className="w-full min-w-212.5 text-left"><thead className="bg-marica-cream/45"><tr className="font-body text-[11px] font-bold uppercase tracking-[0.08em] text-marica-ink-soft"><th className="px-4 py-4">Voucher</th><th className="px-4 py-4">Nilai</th><th className="px-4 py-4">Biaya poin</th><th className="px-4 py-4">Batas berlaku</th><th className="px-4 py-4">Status</th><th className="px-4 py-4 text-right">Aksi</th></tr></thead><tbody>{isLoading ? <tr><td colSpan={6} className="py-14 text-center font-body text-sm text-marica-ink-soft"><Loader2 className="mx-auto h-5 w-5 animate-spin" /></td></tr> : filtered.length === 0 ? <tr><td colSpan={6} className="py-14 text-center font-body text-sm text-marica-ink-soft">Belum ada voucher yang sesuai.</td></tr> : filtered.map((voucher) => <tr key={voucher.id} className="border-t border-black/6 transition hover:bg-marica-cream/20"><td className="px-4 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-12 items-center justify-center rounded-lg bg-marica-rose/20 font-body text-[11px] font-bold text-marica-rose-deep">{voucher.code.length > 8 ? "VOUCHER" : voucher.code}</span><div><p className="font-body text-sm font-bold text-marica-ink">{voucher.title}</p><p className="font-body text-xs text-marica-ink-soft">{voucher.code}</p></div></div></td><td className="px-4 py-4 font-body text-sm font-semibold text-marica-ink">{money(voucher.discountAmount)}</td><td className="px-4 py-4 font-body text-sm font-semibold text-marica-rose-deep">{voucher.pointsCost.toLocaleString("id-ID")} Poin</td><td className="px-4 py-4 font-body text-sm text-marica-ink-soft">{formatDate(voucher.expiresAt)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 font-body text-xs font-bold ${voucher.isActive ? "bg-marica-green/15 text-green-700" : "bg-black/6 text-marica-ink-soft"}`}>{voucher.isActive ? "Aktif" : "Nonaktif"}</span></td><td className="px-4 py-4"><div className="flex justify-end gap-1"><button type="button" title="Lihat voucher" aria-label="Lihat voucher" className="flex h-8 w-8 items-center justify-center rounded-lg text-marica-ink-soft hover:bg-marica-sky-light"><Eye className="h-4 w-4" /></button><button type="button" title="Edit voucher" aria-label="Edit voucher" onClick={() => openEdit(voucher)} className="flex h-8 w-8 items-center justify-center rounded-lg text-marica-ink-soft hover:bg-marica-sky-light"><Pencil className="h-4 w-4" /></button><button type="button" title={voucher.isActive ? "Nonaktifkan" : "Aktifkan"} aria-label={voucher.isActive ? "Nonaktifkan" : "Aktifkan"} disabled={actionId === voucher.id} onClick={() => void toggleVoucher(voucher)} className="flex h-8 w-8 items-center justify-center rounded-lg text-marica-ink-soft hover:bg-marica-sky-light disabled:opacity-40"><Check className="h-4 w-4" /></button><button type="button" title="Hapus voucher" aria-label="Hapus voucher" disabled={actionId === voucher.id} onClick={() => void deleteVoucher(voucher)} className="flex h-8 w-8 items-center justify-center rounded-lg text-marica-rose-deep hover:bg-marica-rose-deep/10 disabled:opacity-40"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody></table></div>
        <div className="flex items-center justify-between border-t border-black/6 px-4 py-3 font-body text-xs text-marica-ink-soft"><span>Menampilkan {filtered.length} dari {vouchers.length} voucher</span><div className="flex items-center gap-1"><button type="button" disabled className="rounded-lg border border-black/8 px-2 py-1 opacity-50"><ChevronLeft className="h-3.5 w-3.5" /></button><span className="rounded-lg bg-marica-amber-dark px-2.5 py-1 font-bold text-white">1</span><button type="button" disabled className="rounded-lg border border-black/8 px-2 py-1 opacity-50"><ChevronRight className="h-3.5 w-3.5" /></button></div></div>
      </div>

      <div className="mt-5 rounded-2xl border border-marica-blue/20 bg-marica-sky-light/50 p-4"><p className="font-body text-sm font-semibold text-marica-blue">Terhubung dengan Katalog Voucher</p><p className="mt-1 font-body text-xs text-marica-blue/80">Voucher aktif akan tersedia di katalog Marica Points setelah disimpan.</p></div>

      {isFormOpen && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-marica-ink/35 p-4 pt-10 backdrop-blur-sm"><form onSubmit={saveVoucher} className="w-full max-w-3xl rounded-3xl bg-marica-cream/95 p-5 shadow-[0_24px_80px_rgba(28,27,27,0.22)] sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-body text-xs font-bold uppercase tracking-[0.14em] text-marica-amber-text">Voucher</p><h2 className="mt-1 font-display text-2xl font-semibold text-marica-ink">{editing ? "Edit Voucher" : "Buat Voucher Baru"}</h2><p className="mt-1 font-body text-sm text-marica-ink-soft">Lengkapi informasi voucher yang akan ditampilkan kepada pengguna.</p></div><button type="button" onClick={() => setIsFormOpen(false)} aria-label="Tutup form" className="flex h-9 w-9 items-center justify-center rounded-full text-marica-ink-soft hover:bg-white"><X className="h-5 w-5" /></button></div><div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]"><div className="space-y-5"><section className="rounded-2xl border border-black/8 bg-white p-5"><h3 className="font-display text-lg font-semibold text-marica-ink">Informasi Dasar</h3><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="font-body text-xs font-bold text-marica-ink-soft">Kode voucher<input required maxLength={60} value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="Contoh: HEMAT10" className="mt-1 w-full rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label><label className="font-body text-xs font-bold text-marica-ink-soft">Nama voucher<input required maxLength={120} value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Voucher Belanja" className="mt-1 w-full rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label></div><label className="mt-4 block font-body text-xs font-bold text-marica-ink-soft">Deskripsi singkat<textarea maxLength={240} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Jelaskan manfaat voucher secara singkat." className="mt-1 min-h-24 w-full resize-y rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label></section><section className="rounded-2xl border border-black/8 bg-white p-5"><h3 className="font-display text-lg font-semibold text-marica-ink">Nilai & Ketentuan</h3><div className="mt-4 grid gap-4 sm:grid-cols-3"><label className="font-body text-xs font-bold text-marica-ink-soft">Nilai manfaat<input required min="1" type="number" value={form.discountAmount} onChange={(event) => setForm((current) => ({ ...current, discountAmount: event.target.value }))} placeholder="10000" className="mt-1 w-full rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label><label className="font-body text-xs font-bold text-marica-ink-soft">Biaya penukaran<input required min="1" type="number" value={form.pointsCost} onChange={(event) => setForm((current) => ({ ...current, pointsCost: event.target.value }))} placeholder="500" className="mt-1 w-full rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label><label className="font-body text-xs font-bold text-marica-ink-soft">Berlaku sampai<input type="date" value={form.expiresAt} onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))} className="mt-1 w-full rounded-xl border border-black/10 bg-marica-cream/45 px-3 py-3 font-body text-sm outline-none focus:border-marica-amber-dark" /></label></div></section></div><aside className="rounded-2xl border border-black/8 bg-white p-5"><p className="font-display text-lg font-semibold text-marica-ink">Pratinjau Voucher</p><div className="mt-4 rounded-2xl border border-marica-amber/20 bg-marica-cream/50 p-4"><span className="rounded-md bg-marica-rose/25 px-2 py-1 font-body text-[10px] font-bold text-marica-rose-deep">{form.code || "KODE"}</span><p className="mt-4 font-body text-sm font-bold text-marica-ink">{form.title || "Nama voucher"}</p><p className="mt-1 font-body text-xs text-marica-ink-soft">{form.description || "Deskripsi voucher"}</p><div className="mt-5 flex items-center justify-between border-t border-black/8 pt-3"><span className="font-body text-xs font-bold text-marica-rose-deep">{form.pointsCost ? `${Number(form.pointsCost).toLocaleString("id-ID")} Poin` : "0 Poin"}</span><span className="font-body text-xs font-bold text-marica-ink-soft">{form.discountAmount ? money(Number(form.discountAmount)) : "Rp--"}</span></div></div><p className="mt-4 font-body text-xs leading-relaxed text-marica-ink-soft">Voucher aktif akan muncul di katalog Marica Points.</p></aside></div><div className="mt-6 flex justify-end gap-2 border-t border-black/8 pt-5"><button type="button" onClick={() => setIsFormOpen(false)} className="rounded-xl px-4 py-2.5 font-body text-sm font-semibold text-marica-ink-soft hover:bg-white">Batal</button><button disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-bold text-white disabled:opacity-50">{isSaving && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? "Simpan perubahan" : "Simpan Voucher"}</button></div></form></div>}
    </div>
  );
}
