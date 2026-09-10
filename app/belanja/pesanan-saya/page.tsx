"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ArrowLeft, Store, PackageSearch, Loader2 } from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import FeedbackPopup from "../../components/FeedbackPopup";
import { payWithSnap } from "../../components/belanja/snap";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  type ApiOrder,
  type ApiOrderStatus,
} from "../../components/belanja/types";

const TABS: { key: "Semua" | ApiOrderStatus; label: string }[] = [
  { key: "Semua", label: "Semua Pesanan" },
  { key: "PENDING_PAYMENT", label: ORDER_STATUS_LABEL.PENDING_PAYMENT },
  { key: "PROCESSING", label: ORDER_STATUS_LABEL.PROCESSING },
  { key: "SHIPPED", label: ORDER_STATUS_LABEL.SHIPPED },
  { key: "DELIVERED", label: ORDER_STATUS_LABEL.DELIVERED },
  { key: "CANCELLED", label: ORDER_STATUS_LABEL.CANCELLED },
];

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function PesananSayaPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]["key"]>("Semua");
  const [searchInput, setSearchInput] = useState("");
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const loadOrders = () => {
    setIsLoading(true);
    setError(null);
    fetch("/api/orders")
      .then(async (res) => {
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent("/belanja/pesanan-saya")}`,
          );
          return null;
        }
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Gagal memuat pesanan");
        return json as ApiOrder[];
      })
      .then((json) => {
        if (json) setOrders(json);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesTab = activeTab === "Semua" || order.status === activeTab;
      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.items.some((item) => item.productName.toLowerCase().includes(q));
      return matchesTab && matchesSearch;
    });
  }, [orders, activeTab, searchInput]);

  const handleBayarSekarang = async (order: ApiOrder) => {
    setPayError(null);
    if (!order.midtransSnapToken) {
      setPayError(
        "Token pembayaran untuk pesanan ini tidak ditemukan. Coba muat ulang halaman.",
      );
      return;
    }
    setPayingOrderId(order.id);
    try {
      await payWithSnap(order.midtransSnapToken, {
        onSuccess: () => loadOrders(),
        onPending: () => loadOrders(),
        onError: () =>
          setPayError("Pembayaran gagal diproses. Silakan coba lagi."),
        onClose: () => loadOrders(),
      });
    } catch (err) {
      setPayError(
        err instanceof Error ? err.message : "Gagal membuka halaman pembayaran",
      );
    } finally {
      setPayingOrderId(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="section-soft-bg flex-1">
        <div className="mx-auto max-w-5xl px-5 py-8 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-5 inline-flex items-center gap-1.5 font-body text-sm font-medium text-marica-ink-soft transition hover:text-marica-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="font-display text-2xl font-bold text-marica-ink sm:text-3xl">
              Pesanan Saya
            </h1>

            <div className="relative sm:w-80">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/60" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Cari pesanan atau nama produk"
                className="w-full rounded-full border border-marica-ink/10 bg-white py-2.5 pl-10 pr-4 font-body text-sm text-marica-ink placeholder:text-marica-ink-soft/50 shadow-sm outline-none transition focus:border-marica-amber-dark/50"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-marica-ink/10 pb-px">
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative shrink-0 whitespace-nowrap pb-3 font-body text-sm font-medium transition ${
                    active
                      ? "text-marica-amber-dark"
                      : "text-marica-ink-soft hover:text-marica-ink"
                  }`}
                >
                  {tab.label}
                  {active && (
                    <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-marica-amber-dark" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Orders */}
          <div className="mt-6 flex flex-col gap-5">
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-marica-ink/5"
                />
              ))}

            {!isLoading && error && (
              <div className="rounded-2xl border border-marica-rose-deep/20 bg-marica-rose-deep/5 p-6 text-center font-body text-sm text-marica-rose-deep">
                {error}
              </div>
            )}

            {!isLoading && !error && filteredOrders.length === 0 && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-marica-ink/5 bg-white py-16 text-center shadow-sm">
                <PackageSearch className="h-10 w-10 text-marica-ink-soft/40" />
                <p className="font-display text-base font-semibold text-marica-ink">
                  Tidak ada pesanan
                </p>
                <p className="max-w-xs font-body text-sm text-marica-ink-soft">
                  Belum ada pesanan yang cocok dengan pencarian atau filter ini.
                </p>
              </div>
            )}

            {!isLoading &&
              !error &&
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isPaying={payingOrderId === order.id}
                  onBayarSekarang={handleBayarSekarang}
                />
              ))}
          </div>
        </div>
      </main>

      <Footer />
      <FeedbackPopup message={error} onClose={() => setError(null)} />
      <FeedbackPopup message={payError} onClose={() => setPayError(null)} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Order card                                                                */
/* -------------------------------------------------------------------------- */

function OrderCard({
  order,
  isPaying,
  onBayarSekarang,
}: {
  order: ApiOrder;
  isPaying: boolean;
  onBayarSekarang: (order: ApiOrder) => void;
}) {
  return (
    <div className="rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-[0_10px_28px_rgba(120,60,10,0.06)] sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-marica-ink/5 pb-4">
        <span className="flex items-center gap-2 font-body text-sm font-semibold text-marica-ink">
          <Store className="h-4 w-4 text-marica-ink-soft" />
          Marica Official Store
          <span className="font-normal text-marica-ink-soft">
            · {formatDate(order.createdAt)}
          </span>
        </span>

        <span className="flex items-center gap-2.5">
          <span className="font-body text-xs text-marica-ink-soft">
            {order.orderNumber}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-body text-[11px] font-semibold ${ORDER_STATUS_STYLE[order.status]}`}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </span>
        </span>
      </div>

      {/* Items */}
      <div className="flex flex-col gap-4 py-4">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-marica-cream">
              {item.productImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.productImageUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-body text-sm font-semibold text-marica-ink sm:text-base">
                {item.productName}
              </p>
              <p className="mt-0.5 font-body text-xs text-marica-ink-soft sm:text-sm">
                {item.quantity} barang x {formatRupiah(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Total + actions */}
      <div className="flex flex-col items-end gap-3 border-t border-marica-ink/5 pt-4">
        <div className="text-right">
          <p className="font-body text-xs text-marica-ink-soft">
            Total Pesanan
          </p>
          <p className="font-display text-xl font-bold text-marica-amber-text">
            {formatRupiah(order.total)}
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-2.5">
          <Link
            href={`/belanja/pesanan-saya/${order.id}`}
            className="rounded-full border-2 border-marica-amber-dark/40 px-5 py-2 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
          >
            Detail Pesanan
          </Link>

          {order.status === "PENDING_PAYMENT" && (
            <button
              type="button"
              disabled={isPaying}
              onClick={() => onBayarSekarang(order)}
              className="inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPaying && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Bayar Sekarang
            </button>
          )}

          {order.status === "PROCESSING" && (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-full border-2 border-marica-ink/10 px-5 py-2 font-body text-sm font-semibold text-marica-ink-soft/50"
            >
              Sedang Diproses
            </button>
          )}

          {order.status === "SHIPPED" && (
            <Link
              href={`/belanja/pesanan-saya/${order.id}/lacak`}
              className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Lacak Pesanan
            </Link>
          )}

          {order.status === "DELIVERED" && (
            <>
              <Link
                href="/belanja"
                className="rounded-full border-2 border-marica-amber-dark/40 px-5 py-2 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
              >
                Beli Lagi
              </Link>
              <button
                type="button"
                className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
              >
                Beri Ulasan
              </button>
            </>
          )}

          {(order.status === "CANCELLED" || order.status === "EXPIRED") && (
            <Link
              href="/belanja"
              className="rounded-full bg-marica-amber-dark px-5 py-2 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
            >
              Beli Lagi
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
