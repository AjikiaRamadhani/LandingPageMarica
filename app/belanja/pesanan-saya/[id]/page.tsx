"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Package, Store, XCircle } from "lucide-react";

import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { payWithSnap } from "../../../components/belanja/snap";
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_STYLE,
  type ApiOrder,
} from "../../../components/belanja/types";

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      const json = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent(`/belanja/pesanan-saya/${params.id}`)}`,
        );
        return;
      }
      if (!response.ok)
        throw new Error(json?.error ?? "Pesanan tidak ditemukan");
      setOrder(json as ApiOrder);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal memuat detail pesanan",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.id) void loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handlePay = async () => {
    if (!order?.midtransSnapToken) {
      setError("Token pembayaran tidak ditemukan. Silakan muat ulang halaman.");
      return;
    }
    setIsPaying(true);
    setError(null);
    try {
      await payWithSnap(order.midtransSnapToken, {
        onSuccess: () => void loadOrder(),
        onPending: () => void loadOrder(),
        onError: () =>
          setError("Pembayaran gagal diproses. Silakan coba lagi."),
        onClose: () => void loadOrder(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuka pembayaran");
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    if (
      !order ||
      !window.confirm(
        "Batalkan pesanan ini? Pesanan yang dibatalkan tidak dapat dibayar lagi.",
      )
    )
      return;
    setIsCancelling(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.error ?? "Gagal membatalkan pesanan");
      setOrder(json as ApiOrder);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal membatalkan pesanan",
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="section-soft-bg flex-1">
        <div className="mx-auto max-w-4xl px-5 py-8 sm:px-6 lg:px-10">
          <Link
            href="/belanja/pesanan-saya"
            className="mb-6 inline-flex items-center gap-1.5 font-body text-sm font-medium text-marica-ink-soft hover:text-marica-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Pesanan Saya
          </Link>

          {isLoading && (
            <div className="h-72 animate-pulse rounded-2xl bg-marica-ink/5" />
          )}
          {!isLoading && error && !order && (
            <div className="rounded-2xl bg-marica-rose-deep/5 p-6 font-body text-sm text-marica-rose-deep">
              {error}
            </div>
          )}

          {!isLoading && order && (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="flex items-center gap-2 font-body text-sm font-semibold text-marica-ink">
                    <Store className="h-4 w-4 text-marica-ink-soft" /> Marica
                    Official Store
                  </p>
                  <h1 className="mt-2 font-display text-2xl font-bold text-marica-ink">
                    Detail Pesanan
                  </h1>
                  <p className="mt-1 font-body text-sm text-marica-ink-soft">
                    {order.orderNumber} · {formatDate(order.createdAt)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold ${ORDER_STATUS_STYLE[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              {error && (
                <p className="mt-4 rounded-xl bg-marica-rose-deep/5 p-3 font-body text-sm text-marica-rose-deep">
                  {error}
                </p>
              )}

              <section className="mt-6 rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="font-display text-lg font-bold text-marica-ink">
                  Produk
                </h2>
                <div className="mt-4 flex flex-col gap-4">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 border-b border-marica-ink/5 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-marica-cream">
                        {item.productImageUrl && (
                          <img
                            src={item.productImageUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-body text-sm font-semibold text-marica-ink">
                          {item.productName}
                        </p>
                        <p className="mt-1 font-body text-xs text-marica-ink-soft">
                          {item.quantity} barang x {formatRupiah(item.price)}
                        </p>
                      </div>
                      <p className="font-body text-sm font-bold text-marica-ink">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-sm">
                  <h2 className="font-display text-lg font-bold text-marica-ink">
                    Alamat Pengiriman
                  </h2>
                  <div className="mt-3 font-body text-sm text-marica-ink">
                    <p className="font-semibold">{order.shippingName}</p>
                    <p className="mt-1 text-marica-ink-soft">
                      {order.shippingPhone}
                    </p>
                    <p className="mt-2 leading-relaxed">
                      {order.shippingAddress}
                    </p>
                    <p className="leading-relaxed">
                      {order.shippingCity}, {order.shippingProvince}{" "}
                      {order.shippingPostalCode}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-marica-ink/10 pt-3">
                    <p className="font-body text-sm font-semibold text-marica-ink">
                      Kurir
                    </p>
                    <p className="mt-1 font-body text-sm text-marica-ink-soft">
                      {order.shippingCourier?.toUpperCase() ?? "Kurir"}{" "}
                      {order.shippingService ?? ""}
                    </p>
                    <p className="mt-1 font-body text-sm text-marica-ink-soft">
                      Ongkir {formatRupiah(order.shippingCost)}
                    </p>
                  </div>
                </section>
                <section className="rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-sm">
                  <h2 className="font-display text-lg font-bold text-marica-ink">
                    Ringkasan Pembayaran
                  </h2>
                  <div className="mt-3 flex justify-between font-body text-sm text-marica-ink-soft">
                    <span>Subtotal</span>
                    <span>{formatRupiah(order.subtotal)}</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-marica-ink/10 pt-2 font-body font-bold text-marica-ink">
                    <span>Total</span>
                    <span>{formatRupiah(order.total)}</span>
                  </div>
                </section>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                {order.status === "PENDING_PAYMENT" && (
                  <>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isCancelling || isPaying}
                      className="inline-flex items-center gap-1.5 rounded-full border-2 border-marica-rose-deep/30 px-5 py-2.5 font-body text-sm font-semibold text-marica-rose-deep disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />{" "}
                      {isCancelling ? "Membatalkan..." : "Batalkan Pesanan"}
                    </button>
                    <button
                      type="button"
                      onClick={handlePay}
                      disabled={isPaying || isCancelling}
                      className="inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-50"
                    >
                      {isPaying && <Loader2 className="h-4 w-4 animate-spin" />}{" "}
                      Bayar Sekarang
                    </button>
                  </>
                )}
                {order.status !== "PENDING_PAYMENT" && (
                  <Package className="h-5 w-5 text-marica-ink-soft" />
                )}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
