"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  CircleDollarSign,
  MoreVertical,
  ShoppingCart,
  Ticket,
  UserPlus,
  TrendingUp,
} from "lucide-react";

type Status = { status: string; count: number };
type AnalyticsData = {
  period: { days: number };
  metrics: {
    totalBookings: number;
    totalOrders: number;
    totalPrintableLeads: number;
    totalEventRevenue: number | string;
    totalProductRevenue: number | string;
  };
  salesTrend: { date: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
  paymentMethodSummary: { method: string; count: number }[];
  orderStatusSummary: Status[];
  bookingStatusSummary: Status[];
  ticketSummary: Status[];
};

type Period = 7 | 30 | 90;

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function shortRupiah(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}K`;
  return formatRupiah(value);
}

function formatDate(value: string, days: number) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: days > 30 ? "short" : undefined,
  });
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/analytics?days=${period}`, { cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("Gagal memuat data analytics");
        return response.json() as Promise<AnalyticsData>;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((reason: unknown) => {
        if (!cancelled)
          setError(
            reason instanceof Error
              ? reason.message
              : "Gagal memuat data analytics",
          );
      });
    return () => {
      cancelled = true;
    };
  }, [period]);

  const revenue = data ? Number(data.metrics.totalProductRevenue) : 0;
  const maxRevenue = Math.max(
    ...(data?.salesTrend.map((item) => item.revenue) ?? [0]),
    1,
  );
  const totalPaymentMethods =
    data?.paymentMethodSummary.reduce((sum, item) => sum + item.count, 0) ?? 0;
  const cards = [
    {
      label: "Pendapatan produk",
      value: data ? shortRupiah(revenue) : null,
      detail: data
        ? `Event: ${shortRupiah(Number(data.metrics.totalEventRevenue))}`
        : "Dari transaksi berhasil",
      icon: CircleDollarSign,
      accent: "bg-marica-green/15 text-marica-green",
    },
    {
      label: "Total pesanan",
      value: data?.metrics.totalOrders,
      detail: "Pesanan periode ini",
      icon: ShoppingCart,
      accent: "bg-marica-sky/60 text-marica-blue",
    },
    {
      label: "Booking event",
      value: data?.metrics.totalBookings,
      detail: "Booking periode ini",
      icon: Ticket,
      accent: "bg-marica-violet/25 text-marica-violet-deep",
    },
    {
      label: "Lead printable",
      value: data?.metrics.totalPrintableLeads,
      detail: "Lead periode ini",
      icon: UserPlus,
      accent: "bg-marica-rose/35 text-marica-rose-deep",
    },
  ];

  return (
    <div>
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-marica-amber/20 text-marica-amber-text">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-semibold text-marica-ink">
              Analitik &amp; Laporan
            </h1>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              Pantau performa bisnis Marica secara berkala.
            </p>
          </div>
        </div>
        <label className="flex w-fit items-center gap-2 rounded-xl border border-marica-amber/30 bg-white px-3 py-2.5 font-body text-sm text-marica-ink shadow-sm">
          <CalendarDays className="h-4 w-4 text-marica-amber-text" />
          <select
            value={period}
            onChange={(event) =>
              setPeriod(Number(event.target.value) as Period)
            }
            className="bg-transparent outline-none"
          >
            <option value={7}>7 Hari Terakhir</option>
            <option value={30}>30 Hari Terakhir</option>
            <option value={90}>90 Hari Terakhir</option>
          </select>
        </label>
      </motion.header>

      {error && (
        <p className="mt-6 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="rounded-2xl border border-marica-rose-deep/10 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start justify-between">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${card.accent}`}
              >
                <card.icon className="h-4.5 w-4.5" />
              </div>
              <TrendingUp className="h-4 w-4 text-marica-green" />
            </div>
            <p className="mt-4 font-body text-xs font-medium uppercase tracking-wide text-marica-ink-soft">
              {card.label}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold text-marica-ink">
              {card.value == null ? (
                <span className="inline-block h-7 w-24 animate-pulse rounded bg-black/5" />
              ) : typeof card.value === "number" ? (
                card.value.toLocaleString("id-ID")
              ) : (
                card.value
              )}
            </p>
            <p className="mt-1 font-body text-xs text-marica-green">
              {card.detail}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-marica-rose-deep/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
                Performa periode
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
                Tren Penjualan
              </h2>
            </div>
            <button
              type="button"
              aria-label="Opsi tren penjualan"
              className="rounded-lg p-1 text-marica-rose-deep hover:bg-marica-rose/20"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 h-64 rounded-xl bg-linear-to-b from-marica-rose/15 to-white p-3">
            <div className="flex h-full items-end gap-1.5 border-b border-l border-marica-ink/10 px-2 sm:gap-2">
              {data?.salesTrend.map((item) => (
                <div
                  key={item.date}
                  title={`${item.date}: ${formatRupiah(item.revenue)}`}
                  className="group relative flex h-full flex-1 items-end"
                >
                  <div
                    className="w-full rounded-t-md bg-marica-rose-deep/75 transition group-hover:bg-marica-amber-dark"
                    style={{
                      height: `${Math.max((item.revenue / maxRevenue) * 92, item.revenue ? 6 : 1)}%`,
                    }}
                  />
                </div>
              )) ??
                Array.from({ length: period }).map((_, index) => (
                  <div
                    key={index}
                    className="h-1 w-full animate-pulse rounded-t bg-black/5"
                  />
                ))}
            </div>
          </div>
          <div className="mt-2 flex justify-between pl-3 font-body text-[10px] text-marica-ink-soft">
            <span>
              {data?.salesTrend[0]
                ? formatDate(data.salesTrend[0].date, period)
                : ""}
            </span>
            <span>
              {data?.salesTrend.at(-1)
                ? formatDate(data.salesTrend.at(-1)!.date, period)
                : ""}
            </span>
          </div>
        </section>
        <section className="rounded-2xl border border-marica-rose-deep/10 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
                Distribusi
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
                Sumber Pesanan
              </h2>
            </div>
            <ShoppingCart className="h-5 w-5 text-marica-rose-deep" />
          </div>
          <div className="mt-6 flex items-center justify-center">
            <div className="flex h-36 w-36 items-center justify-center rounded-full border-18 border-marica-amber/80 shadow-inner">
              <div className="text-center">
                <p className="font-body text-xs text-marica-ink-soft">Total</p>
                <p className="font-display text-xl font-semibold text-marica-ink">
                  {data?.metrics.totalOrders?.toLocaleString("id-ID") ?? "-"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {data?.paymentMethodSummary.map((item, index) => (
              <div
                key={item.method}
                className="flex items-center justify-between font-body text-xs"
              >
                <span className="flex items-center gap-2 text-marica-ink-soft">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${index === 0 ? "bg-marica-rose-deep" : "bg-marica-amber"}`}
                  />
                  {item.method}
                </span>
                <span className="font-semibold text-marica-ink">
                  {totalPaymentMethods
                    ? Math.round((item.count / totalPaymentMethods) * 100)
                    : 0}
                  %
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-5 rounded-2xl border border-marica-rose-deep/10 bg-white p-5 shadow-sm sm:p-6">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.12em] text-marica-amber-text">
          Produk terlaris
        </p>
        <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
          Top Produk
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {data?.topProducts.map((product, index) => (
            <div
              key={product.name}
              className="flex items-center justify-between rounded-xl bg-marica-sky-light/35 px-4 py-3"
            >
              <div>
                <p className="font-body text-sm font-medium text-marica-ink">
                  {index + 1}. {product.name}
                </p>
                <p className="mt-1 font-body text-xs text-marica-ink-soft">
                  {product.quantity} unit terjual
                </p>
              </div>
              <span className="font-body text-xs font-semibold text-marica-rose-deep">
                {shortRupiah(product.revenue)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
