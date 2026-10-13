"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "MONTHLY" | "QUARTERLY";
};

const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString("id-ID")}`;

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/subscriptions/plans", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(data?.error ?? "Paket subscription gagal dimuat");
        }
        return data;
      })
      .then((data: SubscriptionPlan[]) => {
        setPlans(Array.isArray(data) ? data : []);
      })
      .catch((loadError) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Paket subscription gagal dimuat",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f3] font-body text-marica-ink">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-5 pb-10 pt-8 sm:px-8 lg:px-10 lg:pb-16 lg:pt-14">
          <div className="grid items-center gap-8 rounded-[2rem] bg-white p-7 shadow-[0_14px_35px_rgba(120,60,10,0.08)] sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:p-14">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-marica-amber-dark">
                Subscription Edu-Kit Marica
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
                Temukan aktivitas seru setiap bulan.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-6 text-marica-ink-soft sm:text-base">
                Paket edukatif pilihan yang dikirim rutin ke rumah untuk
                menemani anak belajar, bereksplorasi, dan bermain bersama
                keluarga.
              </p>
              <div className="mt-7 flex flex-wrap gap-3 text-xs font-semibold text-marica-ink-soft">
                <span className="rounded-full bg-marica-green/10 px-4 py-2">
                  <ShieldCheck className="mr-1.5 inline h-4 w-4 text-marica-green" />
                  Aman dan terkurasi
                </span>
                <span className="rounded-full bg-marica-sky-light px-4 py-2">
                  <Truck className="mr-1.5 inline h-4 w-4 text-marica-blue" />
                  Dikirim ke rumah
                </span>
              </div>
            </div>
            <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-gradient-to-br from-marica-cream via-[#fff6e8] to-marica-sky-light/60">
              <Image
                src="/images/subcribe.png"
                alt="Keluarga menikmati aktivitas Edu-Kit Marica"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent px-6 pb-6 pt-16 text-left text-white">
                <p className="font-display text-2xl font-bold">
                  Satu kotak, banyak pengalaman
                </p>
                <p className="mt-2 text-sm leading-6 text-white/90">
                  Materi belajar dan aktivitas baru untuk menemani tumbuh
                  kembang si kecil.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-marica-amber-dark">
              Pilih paket
            </p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Paket subscription untuk keluarga
            </h2>
            <p className="mt-2 text-sm text-marica-ink-soft">
              Pilih durasi yang paling sesuai dengan kebutuhanmu.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16 text-sm text-marica-ink-soft">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Memuat paket subscription...
            </div>
          ) : error ? (
            <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-red-50 p-5 text-center text-sm text-red-700">
              {error}
            </p>
          ) : plans.length === 0 ? (
            <p className="mx-auto mt-8 max-w-xl rounded-2xl bg-white p-8 text-center text-sm text-marica-ink-soft shadow-sm">
              Belum ada paket subscription yang tersedia.
            </p>
          ) : (
            <div className="mx-auto mt-10 grid max-w-4xl gap-6 md:grid-cols-2">
              {plans.map((plan, index) => (
                <article
                  key={plan.id}
                  className={`relative flex flex-col rounded-3xl border bg-white p-7 shadow-[0_12px_30px_rgba(120,60,10,0.08)] ${
                    index === 0
                      ? "border-marica-amber-dark ring-2 ring-marica-amber/20"
                      : "border-marica-ink/10"
                  }`}
                >
                  {index === 0 && (
                    <span className="absolute -top-3 left-6 rounded-full bg-marica-amber-dark px-3 py-1 text-[11px] font-bold text-white">
                      Pilihan populer
                    </span>
                  )}
                  <h3 className="font-display text-2xl font-bold">{plan.name}</h3>
                  <p className="mt-3 min-h-12 text-sm leading-5 text-marica-ink-soft">
                    {plan.description}
                  </p>
                  <div className="mt-6 border-y border-black/5 py-5">
                    <span className="font-display text-3xl font-bold text-marica-amber-text">
                      {formatRupiah(plan.price)}
                    </span>
                    <span className="ml-1 text-sm text-marica-ink-soft">
                      / {plan.interval === "MONTHLY" ? "bulan" : "3 bulan"}
                    </span>
                  </div>
                  <ul className="mt-5 space-y-3 text-sm text-marica-ink-soft">
                    <li><CheckCircle2 className="mr-2 inline h-4 w-4 text-marica-green" />Aktivitas edukatif terkurasi</li>
                    <li><CheckCircle2 className="mr-2 inline h-4 w-4 text-marica-green" />Dikirim rutin ke rumah</li>
                    <li><CheckCircle2 className="mr-2 inline h-4 w-4 text-marica-green" />Pembayaran aman melalui Midtrans</li>
                  </ul>
                  <Link
                    href={`/subscription/${encodeURIComponent(plan.id)}`}
                    className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-marica-amber-dark px-5 py-3 text-sm font-bold text-white transition hover:brightness-105"
                  >
                    Lihat Detail <ArrowRight className="h-4 w-4" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
