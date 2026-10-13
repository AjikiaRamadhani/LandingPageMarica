"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Loader2, Package, XCircle } from "lucide-react";

type Subscription = {
  id: string;
  subscriptionNumber: string;
  status: string;
  startDate: string;
  nextBillingAt: string;
  nextDeliveryAt: string;
  plan: { name: string; price: number; interval: string };
  cycles: { cycleNumber: string; amount: number; status: string; periodStart: string; delivery?: { status: string } | null }[];
};

const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;
const date = (value: string) => new Date(value).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });

export default function ProfileSubscriptionPage() {
  const [items, setItems] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/subscriptions", { cache: "no-store" });
    const data = await response.json().catch(() => []);
    if (!response.ok) throw new Error(data.error ?? "Silakan login terlebih dahulu");
    setItems(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load().catch((error) => setMessage(error instanceof Error ? error.message : "Gagal memuat subscription")).finally(() => setLoading(false));
  }, []);

  async function cancelSubscription(subscriptionNumber: string) {
    if (!window.confirm("Batalkan subscription ini? Tindakan ini tidak dapat dibatalkan.")) return;
    setActionId(subscriptionNumber);
    setMessage(null);
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionNumber}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CANCEL" }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Subscription gagal dibatalkan");
      setMessage("Subscription berhasil dibatalkan.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Subscription gagal dibatalkan");
    } finally {
      setActionId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#fff9f3] px-5 py-10 text-marica-ink sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <Link href="/profil" className="text-sm font-semibold text-marica-amber-dark">← Kembali ke profil</Link>
        <h1 className="mt-5 font-display text-4xl font-bold">Subscription Saya</h1>
        <p className="mt-2 text-sm text-marica-ink-soft">Kelola paket Edu-Kit dan lihat jadwal pengirimanmu.</p>
        {message && <p className="mt-5 rounded-xl bg-white px-4 py-3 text-sm text-marica-ink-soft shadow-sm">{message}</p>}
        {loading ? <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin" /></div> : items.length === 0 ? (
          <div className="mt-8 rounded-3xl bg-white p-10 text-center shadow-sm"><Package className="mx-auto h-12 w-12 text-marica-amber-dark" /><p className="mt-4 font-display text-xl font-bold">Belum ada subscription</p><Link href="/subscription" className="mt-5 inline-flex rounded-full bg-marica-amber-dark px-5 py-3 text-sm font-bold text-white">Lihat Paket</Link></div>
        ) : <div className="mt-8 space-y-5">{items.map((item) => (
          <article key={item.id} className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(120,60,10,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-wider text-marica-amber-dark">{item.subscriptionNumber}</p><h2 className="mt-2 font-display text-2xl font-bold">{item.plan.name}</h2><p className="mt-1 text-sm text-marica-ink-soft">{money(item.plan.price)} / {item.plan.interval === "MONTHLY" ? "bulan" : "3 bulan"}</p></div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : item.status === "CANCELLED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{item.status}</span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-marica-cream/60 p-4 text-sm"><CalendarDays className="mb-2 h-4 w-4 text-marica-amber-dark" />Mulai<br /><strong>{date(item.startDate)}</strong></div><div className="rounded-xl bg-marica-cream/60 p-4 text-sm"><CalendarDays className="mb-2 h-4 w-4 text-marica-amber-dark" />Tagihan berikutnya<br /><strong>{date(item.nextBillingAt)}</strong></div><div className="rounded-xl bg-marica-cream/60 p-4 text-sm"><Package className="mb-2 h-4 w-4 text-marica-amber-dark" />Pengiriman berikutnya<br /><strong>{date(item.nextDeliveryAt)}</strong></div></div>
            <div className="mt-4 rounded-xl border border-marica-ink/10 p-4"><p className="text-xs font-bold uppercase tracking-wider text-marica-ink-soft">Riwayat siklus</p><div className="mt-3 space-y-2">{item.cycles.map((cycle) => <div key={cycle.cycleNumber} className="flex flex-wrap items-center justify-between gap-2 text-sm"><span>{cycle.cycleNumber} · {date(cycle.periodStart)}</span><span className="font-semibold text-marica-amber-dark">{money(cycle.amount)} · {cycle.status}</span></div>)}</div></div>
            <div className="mt-6 flex justify-end">{item.status !== "CANCELLED" && <button type="button" disabled={actionId === item.subscriptionNumber} onClick={() => void cancelSubscription(item.subscriptionNumber)} className="inline-flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 disabled:opacity-50"><XCircle className="h-4 w-4" />{actionId === item.subscriptionNumber ? "Membatalkan..." : "Batalkan Subscription"}</button>}</div>
          </article>
        ))}</div>}
      </div>
    </main>
  );
}
