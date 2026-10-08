"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Download,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Plus,
  Search,
  Send,
  X,
} from "lucide-react";

type Status = "NEW" | "CONTACTED" | "QUOTED" | "WON" | "LOST";
type SortBy = "createdAt" | "organizationName" | "eventDate" | "status";
type Inquiry = {
  id: string;
  inquiryNumber: string;
  organizationName: string;
  organizationType: string;
  contactName: string;
  email: string;
  whatsapp: string;
  requestType: string;
  participantCount: number | null;
  eventDate: string | null;
  budget: number | null;
  notes: string | null;
  adminNotes?: string | null;
  status: Status;
  quotationNumber: string | null;
  quotedTotal: number | null;
  validUntil: string | null;
  quotationSentAt: string | null;
  createdAt: string;
  _count?: { quotationItems: number };
  quotationItems?: QuotationItem[];
};
type QuotationItem = {
  id?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal?: number;
};
type Summary = {
  total: number;
  new: number;
  inProgress: number;
  quotationSent: number;
  won: number;
  lost: number;
};
type ListResponse = {
  inquiries: Inquiry[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
};

const LIMIT = 10;
const statuses: { value: "" | Status | "IN_PROGRESS"; label: string }[] = [
  { value: "", label: "Semua status" },
  { value: "NEW", label: "Baru" },
  { value: "IN_PROGRESS", label: "Dalam proses" },
  { value: "QUOTED", label: "Penawaran dibuat" },
  { value: "WON", label: "Berhasil" },
  { value: "LOST", label: "Tidak berhasil" },
];
const statusLabels: Record<Status, string> = {
  NEW: "Baru",
  CONTACTED: "Sudah dihubungi",
  QUOTED: "Penawaran dibuat",
  WON: "Berhasil",
  LOST: "Tidak berhasil",
};
const statusClasses: Record<Status, string> = {
  NEW: "bg-marica-amber/20 text-marica-amber-text",
  CONTACTED: "bg-marica-sky-light text-marica-ink",
  QUOTED: "bg-marica-blue/10 text-marica-blue",
  WON: "bg-marica-green/15 text-marica-green",
  LOST: "bg-marica-rose-deep/10 text-marica-rose-deep",
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatRupiah(value: number | null) {
  return value === null ? "-" : `Rp ${value.toLocaleString("id-ID")}`;
}

function emptyQuotationItem(): QuotationItem {
  return { name: "", description: "", quantity: 1, unitPrice: 0, discount: 0 };
}

export default function AdminB2BPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [data, setData] = useState<ListResponse | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [status, setStatus] = useState<"" | Status | "IN_PROGRESS">("");
  const [organizationType, setOrganizationType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [quotationItems, setQuotationItems] = useState<QuotationItem[]>([]);
  const [validUntil, setValidUntil] = useState("");
  const [isSavingQuotation, setIsSavingQuotation] = useState(false);
  const [isSendingQuotation, setIsSendingQuotation] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const buildParams = useCallback(
    (includeListParams: boolean) => {
      const params = new URLSearchParams();
      if (includeListParams) {
        params.set("page", String(page));
        params.set("limit", String(LIMIT));
        if (debouncedQuery) params.set("search", debouncedQuery);
        if (status) params.set("status", status);
        params.set("sortBy", sortBy);
        params.set("sortOrder", sortOrder);
      }
      if (organizationType) params.set("organizationType", organizationType);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      return params;
    },
    [dateFrom, dateTo, debouncedQuery, organizationType, page, sortBy, sortOrder, status],
  );

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const listParams = buildParams(true);
      const summaryParams = buildParams(false);
      const [listResponse, summaryResponse] = await Promise.all([
        fetch(`/api/admin/b2b/inquiries?${listParams}`, { cache: "no-store" }),
        fetch(`/api/admin/b2b/summary?${summaryParams}`, { cache: "no-store" }),
      ]);
      const [listJson, summaryJson] = await Promise.all([
        listResponse.json(),
        summaryResponse.json(),
      ]);
      if (!listResponse.ok) throw new Error(listJson.error ?? "Gagal memuat inquiry");
      if (!summaryResponse.ok) throw new Error(summaryJson.error ?? "Gagal memuat summary");
      setData(listJson as ListResponse);
      setSummary(summaryJson.summary as Summary);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Gagal memuat data B2B");
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const timer = setTimeout(() => void loadDashboard(), 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  const openDetail = async (inquiry: Inquiry) => {
    setSelected(inquiry);
    setActionError(null);
    setIsDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/b2b/inquiries/${inquiry.inquiryNumber}`, {
        cache: "no-store",
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Gagal memuat detail inquiry");
      const detail = json as Inquiry;
      setSelected(detail);
      setQuotationItems(
        detail.quotationItems?.map((item) => ({
          ...item,
          description: item.description ?? "",
        })) ?? [emptyQuotationItem()],
      );
      setValidUntil(detail.validUntil?.slice(0, 10) ?? "");
    } catch (detailError) {
      setActionError(detailError instanceof Error ? detailError.message : "Gagal memuat detail inquiry");
    } finally {
      setIsDetailLoading(false);
    }
  };

  const updateStatus = async (nextStatus: Status) => {
    if (!selected) return;
    setIsUpdatingStatus(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/b2b/inquiries/${selected.inquiryNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Gagal mengubah status");
      setSelected(json as Inquiry);
      await loadDashboard();
    } catch (statusError) {
      setActionError(statusError instanceof Error ? statusError.message : "Gagal mengubah status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const updateQuotationItem = (index: number, field: keyof QuotationItem, value: string) => {
    setQuotationItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: field === "name" || field === "description" ? value : Math.max(0, Number(value)),
            }
          : item,
      ),
    );
  };

  const saveQuotation = async () => {
    if (!selected) return;
    setIsSavingQuotation(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/b2b/inquiries/${selected.inquiryNumber}/quotation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          validUntil: validUntil || undefined,
          items: quotationItems.map(({ name, description, quantity, unitPrice, discount }) => ({
            name,
            description,
            quantity,
            unitPrice,
            discount,
          })),
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Gagal menyimpan quotation");
      setSelected(json as Inquiry);
      setQuotationItems((json as Inquiry).quotationItems ?? quotationItems);
      await loadDashboard();
    } catch (quotationError) {
      setActionError(quotationError instanceof Error ? quotationError.message : "Gagal menyimpan quotation");
    } finally {
      setIsSavingQuotation(false);
    }
  };

  const sendQuotation = async () => {
    if (!selected) return;
    setIsSendingQuotation(true);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/b2b/inquiries/${selected.inquiryNumber}/quotation/send`, { method: "POST" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Gagal mengirim quotation");
      setSelected((current) => current ? { ...current, quotationSentAt: json.sentAt } : current);
      await loadDashboard();
    } catch (sendError) {
      setActionError(sendError instanceof Error ? sendError.message : "Gagal mengirim quotation");
    } finally {
      setIsSendingQuotation(false);
    }
  };

  const totalPages = data?.pagination.totalPages ?? 1;
  const quotationTotal = quotationItems.reduce(
    (total, item) => total + item.quantity * item.unitPrice - item.discount,
    0,
  );
  const resetFilters = () => {
    setQuery("");
    setStatus("");
    setOrganizationType("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  return (
    <div className="b2b-admin-page pb-10">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.16em] text-marica-amber-dark">Admin Portal / B2B</p>
          <h1 className="mt-1 font-display text-3xl font-semibold text-marica-ink">B2B Inquiry</h1>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">Kelola permintaan kerja sama dan kebutuhan acara dari pelanggan B2B.</p>
        </div>
      </motion.div>

      {error && <p className="mt-5 rounded-xl bg-marica-rose-deep/10 px-4 py-3 font-body text-sm text-marica-rose-deep">{error}</p>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total Inquiry", value: summary?.total ?? 0, icon: BriefcaseBusiness, tone: "bg-marica-amber/20 text-marica-amber-text" },
          { label: "Baru", value: summary?.new ?? 0, icon: MessageCircle, tone: "bg-marica-rose-deep/10 text-marica-rose-deep" },
          { label: "Dalam proses", value: summary?.inProgress ?? 0, icon: ArrowDownUp, tone: "bg-marica-sky-light text-marica-blue" },
          { label: "Penawaran terkirim", value: summary?.quotationSent ?? 0, icon: Send, tone: "bg-marica-blue/10 text-marica-blue" },
          { label: "Berhasil", value: summary?.won ?? 0, icon: Check, tone: "bg-marica-green/15 text-marica-green" },
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/70">{card.label}</p>
                  <p className="mt-2 font-display text-3xl font-semibold text-marica-ink">{card.value}</p>
                </div>
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}><Icon className="h-5 w-5" /></span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.6fr)_repeat(3,minmax(135px,1fr))]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari inquiry, organisasi, PIC..." className="w-full rounded-xl border border-black/10 bg-marica-sky-light/20 py-2.5 pl-10 pr-3 font-body text-sm text-marica-ink outline-none focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/15" />
          </label>
          <select value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 font-body text-sm text-marica-ink outline-none focus:border-marica-amber">
            {statuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select value={organizationType} onChange={(event) => { setOrganizationType(event.target.value); setPage(1); }} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 font-body text-sm text-marica-ink outline-none focus:border-marica-amber">
            <option value="">Semua tipe</option>
            <option value="SCHOOL">School</option>
            <option value="CORPORATE">Corporate</option>
            <option value="COMMUNITY">Community</option>
            <option value="OTHER">Other</option>
          </select>
          <select value={`${sortBy}:${sortOrder}`} onChange={(event) => { const [nextSort, nextOrder] = event.target.value.split(":") as [SortBy, "asc" | "desc"]; setSortBy(nextSort); setSortOrder(nextOrder); setPage(1); }} className="rounded-xl border border-black/10 bg-white px-3 py-2.5 font-body text-sm text-marica-ink outline-none focus:border-marica-amber">
            <option value="createdAt:desc">Terbaru</option>
            <option value="createdAt:asc">Terlama</option>
            <option value="organizationName:asc">Nama organisasi A-Z</option>
            <option value="eventDate:asc">Tanggal acara terdekat</option>
            <option value="status:asc">Status A-Z</option>
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-3 border-t border-black/5 pt-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap items-end gap-3">
            <label className="font-body text-xs text-marica-ink-soft">Dari<input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} className="mt-1 block rounded-lg border border-black/10 px-2.5 py-2 text-sm text-marica-ink" /></label>
            <label className="font-body text-xs text-marica-ink-soft">Sampai<input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} className="mt-1 block rounded-lg border border-black/10 px-2.5 py-2 text-sm text-marica-ink" /></label>
            <button type="button" onClick={resetFilters} className="rounded-lg px-2 py-2 font-body text-xs font-semibold text-marica-ink-soft hover:bg-marica-sky-light/50 hover:text-marica-ink">Reset filter</button>
          </div>
          <p className="font-body text-xs text-marica-ink-soft">{data?.pagination.total ?? 0} inquiry ditemukan</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-225 border-collapse">
            <thead><tr className="border-b border-black/5 bg-marica-sky-light/15 text-left font-body text-[11px] font-semibold uppercase tracking-wide text-marica-ink-soft/70"><th className="px-5 py-3">Inquiry</th><th className="px-4 py-3">Organisasi</th><th className="px-4 py-3">PIC</th><th className="px-4 py-3">Kebutuhan</th><th className="px-4 py-3">Tanggal acara</th><th className="px-4 py-3">Peserta</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody>
              {isLoading && <tr><td colSpan={7} className="py-14 text-center font-body text-sm text-marica-ink-soft"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Memuat inquiry...</td></tr>}
              {!isLoading && data?.inquiries.length === 0 && <tr><td colSpan={7} className="py-14 text-center font-body text-sm text-marica-ink-soft">Belum ada inquiry yang cocok.</td></tr>}
              {!isLoading && data?.inquiries.map((inquiry, index) => <motion.tr key={inquiry.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }} onClick={() => void openDetail(inquiry)} className="cursor-pointer border-b border-black/5 last:border-0 hover:bg-marica-amber/5"><td className="px-5 py-4"><p className="font-body text-sm font-semibold text-marica-amber-dark">{inquiry.inquiryNumber}</p><p className="mt-1 font-body text-xs text-marica-ink-soft">{formatDate(inquiry.createdAt)}</p></td><td className="px-4 py-4"><p className="font-body text-sm font-semibold text-marica-ink">{inquiry.organizationName}</p><p className="mt-1 font-body text-xs text-marica-ink-soft">{inquiry.organizationType}</p></td><td className="px-4 py-4"><p className="font-body text-sm text-marica-ink">{inquiry.contactName}</p><a href={`https://wa.me/${inquiry.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="mt-1 inline-flex items-center gap-1 font-body text-xs text-marica-blue hover:underline"><MessageCircle className="h-3 w-3" />{inquiry.whatsapp}</a></td><td className="px-4 py-4"><span className="rounded-full bg-marica-sky-light/60 px-2.5 py-1 font-body text-xs text-marica-ink-soft">{inquiry.requestType}</span></td><td className="px-4 py-4 font-body text-sm text-marica-ink-soft">{formatDate(inquiry.eventDate)}</td><td className="px-4 py-4 font-body text-sm text-marica-ink-soft">{inquiry.participantCount ?? "-"}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 font-body text-xs font-semibold ${statusClasses[inquiry.status]}`}>{statusLabels[inquiry.status]}</span></td></motion.tr>)}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 px-5 py-3"><p className="font-body text-xs text-marica-ink-soft">Halaman {data?.pagination.page ?? 1} dari {totalPages}</p><div className="flex gap-1"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} title="Halaman sebelumnya" className="rounded-lg p-2 text-marica-ink-soft hover:bg-marica-sky-light disabled:opacity-30"><ArrowLeft className="h-4 w-4" /></button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)} title="Halaman berikutnya" className="rounded-lg p-2 text-marica-ink-soft hover:bg-marica-sky-light disabled:opacity-30"><ArrowRight className="h-4 w-4" /></button></div></div>
      </div>

      {selected && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-marica-ink/30 p-3 backdrop-blur-sm sm:p-6" role="dialog" aria-modal="true" onClick={() => !isSavingQuotation && setSelected(null)}><div className="my-4 w-full max-w-5xl rounded-2xl bg-white shadow-2xl sm:my-8" onClick={(event) => event.stopPropagation()}><div className="flex items-start justify-between border-b border-black/5 p-5 sm:p-7"><div><p className="font-body text-xs font-semibold uppercase tracking-wide text-marica-amber-dark">Detail inquiry</p><h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">{selected.inquiryNumber}</h2><p className="mt-1 font-body text-sm text-marica-ink-soft">Dibuat {formatDate(selected.createdAt)}</p></div><button type="button" onClick={() => setSelected(null)} title="Tutup detail" className="rounded-lg p-2 text-marica-ink-soft hover:bg-black/5"><X className="h-5 w-5" /></button></div>
        {isDetailLoading ? <div className="p-12 text-center font-body text-sm text-marica-ink-soft"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Memuat detail...</div> : <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_1.15fr]"><div><div className="grid gap-3 sm:grid-cols-2"><Info label="Organisasi" value={`${selected.organizationName} (${selected.organizationType})`} /><Info label="PIC" value={selected.contactName} /><Info label="Email" value={selected.email} /><Info label="WhatsApp" value={selected.whatsapp} /><Info label="Jenis kebutuhan" value={selected.requestType} /><Info label="Peserta" value={selected.participantCount?.toString() ?? "-"} /><Info label="Tanggal acara" value={formatDate(selected.eventDate)} /><Info label="Budget" value={formatRupiah(selected.budget)} /></div><div className="mt-5 rounded-xl bg-marica-sky-light/20 p-4"><p className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">Catatan pemohon</p><p className="mt-2 whitespace-pre-wrap font-body text-sm text-marica-ink">{selected.notes || "Tidak ada catatan."}</p></div><div className="mt-5"><label className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">Status inquiry<select value={selected.status} onChange={(event) => void updateStatus(event.target.value as Status)} disabled={isUpdatingStatus} className="mt-2 block w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 font-body text-sm text-marica-ink outline-none focus:border-marica-amber">{(statuses.filter((item) => item.value && item.value !== "IN_PROGRESS") as { value: Status; label: string }[]).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label></div></div><div className="rounded-2xl border border-black/5 bg-marica-sky-light/15 p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-lg font-semibold text-marica-ink">Quotation</h3><p className="mt-1 font-body text-xs text-marica-ink-soft">Tambah item dan kirim penawaran ke PIC.</p></div><FileText className="h-5 w-5 text-marica-amber-dark" /></div><div className="mt-4 space-y-3">{quotationItems.map((item, index) => <div key={item.id ?? index} className="rounded-xl border border-black/10 bg-white p-3"><div className="grid gap-2 sm:grid-cols-[1.4fr_0.7fr_1fr_1fr]"><input value={item.name} onChange={(event) => updateQuotationItem(index, "name", event.target.value)} placeholder="Nama item" className="field" /><input type="number" min="1" value={item.quantity} onChange={(event) => updateQuotationItem(index, "quantity", event.target.value)} placeholder="Qty" className="field" /><input type="number" min="0" value={item.unitPrice} onChange={(event) => updateQuotationItem(index, "unitPrice", event.target.value)} placeholder="Harga" className="field" /><input type="number" min="0" value={item.discount} onChange={(event) => updateQuotationItem(index, "discount", event.target.value)} placeholder="Diskon" className="field" /></div><div className="mt-2 flex items-center gap-2"><input value={item.description} onChange={(event) => updateQuotationItem(index, "description", event.target.value)} placeholder="Deskripsi item (opsional)" className="field flex-1" />{quotationItems.length > 1 && <button type="button" onClick={() => setQuotationItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} title="Hapus item" className="rounded-lg p-2 text-marica-rose-deep hover:bg-marica-rose-deep/10"><X className="h-4 w-4" /></button>}</div></div>)}</div><button type="button" onClick={() => setQuotationItems((current) => [...current, emptyQuotationItem()])} className="mt-3 inline-flex items-center gap-1.5 font-body text-sm font-semibold text-marica-amber-dark hover:underline"><Plus className="h-4 w-4" />Tambah item</button><div className="mt-4 flex items-end justify-between border-t border-black/10 pt-4"><label className="font-body text-xs text-marica-ink-soft">Berlaku sampai<input type="date" value={validUntil} onChange={(event) => setValidUntil(event.target.value)} className="mt-1 block rounded-lg border border-black/10 bg-white px-2.5 py-2 text-sm text-marica-ink" /></label><div className="text-right"><p className="font-body text-xs text-marica-ink-soft">Total</p><p className="font-display text-xl font-semibold text-marica-ink">{formatRupiah(quotationTotal)}</p></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => void saveQuotation()} disabled={isSavingQuotation || isSendingQuotation} className="inline-flex items-center gap-2 rounded-full bg-marica-amber-dark px-4 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-50">{isSavingQuotation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Simpan quotation</button>{selected.quotationNumber && <><button type="button" onClick={() => window.open(`/api/admin/b2b/inquiries/${selected.inquiryNumber}/quotation/pdf`, "_blank")} title="Download PDF" className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 font-body text-sm font-semibold text-marica-ink-soft hover:bg-white"><Download className="h-4 w-4" />PDF</button><button type="button" onClick={() => void sendQuotation()} disabled={isSendingQuotation} className="inline-flex items-center gap-2 rounded-full border border-marica-blue/30 px-4 py-2.5 font-body text-sm font-semibold text-marica-blue hover:bg-marica-blue/5 disabled:opacity-50">{isSendingQuotation ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{selected.quotationSentAt ? "Kirim ulang" : "Kirim email"}</button></>}</div></div></div>}
        {actionError && <p className="mx-5 mb-5 rounded-xl bg-marica-rose-deep/10 px-4 py-3 font-body text-sm text-marica-rose-deep sm:mx-7">{actionError}</p>}
      </div></div>}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><p className="font-body text-xs text-marica-ink-soft">{label}</p><p className="mt-1 wrap-break-word font-body text-sm font-medium text-marica-ink">{value}</p></div>;
}