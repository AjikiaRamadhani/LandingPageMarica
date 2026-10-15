"use client";

import { useEffect, useState } from "react";

type Summary = {
  completedTransactions: number;
  completedRevenue: number;
  cashRevenue: number;
  currentShiftCashRevenue: number;
};

type Shift = {
  openingCash: number;
};

const money = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

export default function CashierFinancePage() {
  const [summary, setSummary] = useState<Summary>({
    completedTransactions: 0,
    completedRevenue: 0,
    cashRevenue: 0,
    currentShiftCashRevenue: 0,
  });
  const [shift, setShift] = useState<Shift | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/cashier/sales?limit=1", { cache: "no-store" }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Ringkasan keuangan gagal dimuat.");
        return data;
      }),
      fetch("/api/cashier/shifts", { cache: "no-store" }).then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error ?? "Data shift gagal dimuat.");
        return data;
      }),
    ])
      .then(([salesData, shiftData]) => {
        setSummary({
          completedTransactions: salesData.summary?.completedTransactions ?? 0,
          completedRevenue: salesData.summary?.completedRevenue ?? 0,
          cashRevenue: salesData.summary?.cashRevenue ?? 0,
          currentShiftCashRevenue: salesData.summary?.currentShiftCashRevenue ?? 0,
        });
        setShift(shiftData.shift ?? null);
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Ringkasan keuangan gagal dimuat.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="mx-auto min-h-full max-w-375 pb-10 text-[#1c1b1b]">
      <header className="mb-6">
        <p className="font-body text-xs font-bold uppercase tracking-[0.18em] text-marica-amber-text">
          Marica Point of Sale
        </p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-marica-ink">
          Keuangan
        </h1>
        <p className="mt-1 font-body text-sm text-marica-ink-soft">
          Ringkasan pendapatan dan posisi kas kasir.
        </p>
      </header>

      {isLoading ? (
        <div className="rounded-3xl border border-black/5 bg-white p-10 text-center font-body text-sm text-marica-ink-soft shadow-sm">
          Memuat ringkasan keuangan...
        </div>
      ) : error ? (
        <div className="rounded-3xl bg-marica-rose-deep/10 p-5 font-body text-sm text-marica-rose-deep">
          {error}
        </div>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-marica-amber/25 bg-marica-amber/10 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-marica-amber-text">
              Pendapatan bersih
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-marica-ink">
              {money(summary.completedRevenue)}
            </p>
            <p className="mt-1 font-body text-xs text-marica-ink-soft">
              {summary.completedTransactions.toLocaleString("id-ID")} transaksi selesai
            </p>
          </div>
          <div className="rounded-2xl border border-marica-green/25 bg-marica-green/10 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-green-700">
              Kas tunai masuk
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-marica-ink">
              {money(summary.cashRevenue)}
            </p>
            <p className="mt-1 font-body text-xs text-marica-ink-soft">
              Hanya pembayaran cash
            </p>
          </div>
          <div className="rounded-2xl border border-marica-violet/25 bg-marica-violet/10 p-4">
            <p className="font-body text-xs font-bold uppercase tracking-wide text-marica-ink-soft">
              Perkiraan kas laci
            </p>
            <p className="mt-2 font-display text-xl font-semibold text-marica-ink">
              {money((shift?.openingCash ?? 0) + summary.currentShiftCashRevenue)}
            </p>
            <p className="mt-1 font-body text-xs text-marica-ink-soft">
              Kas awal + {money(summary.currentShiftCashRevenue)} cash shift ini
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
