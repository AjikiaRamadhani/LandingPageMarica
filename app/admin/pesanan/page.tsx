"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  Package,
  ReceiptText,
  Search,
  Settings2,
  Truck,
  XCircle,
} from "lucide-react";

type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED";

type OrderItem = {
  id: string;
  productName: string;
  quantity: number;
  subtotal: number;
};

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  shippingName: string;
  shippingPhone: string;
  shippingCity: string;
  shippingProvince: string;
  shippingPostalCode: string;
  total: number;
  createdAt: string;
  user: { id: string; name: string | null; email: string | null };
  items: OrderItem[];
};

type OrdersResponse = {
  orders: AdminOrder[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const STATUS_OPTIONS: {
  value: "" | OrderStatus;
  label: string;
  description: string;
  icon: typeof ReceiptText;
}[] = [
  {
    value: "",
    label: "Semua",
    description: "Seluruh pesanan",
    icon: ReceiptText,
  },
  {
    value: "PENDING_PAYMENT",
    label: "Menunggu",
    description: "Belum dibayar",
    icon: Clock3,
  },
  {
    value: "PAID",
    label: "Dibayar",
    description: "Pembayaran masuk",
    icon: CreditCard,
  },
  {
    value: "PROCESSING",
    label: "Diproses",
    description: "Sedang disiapkan",
    icon: Settings2,
  },
  {
    value: "SHIPPED",
    label: "Dikirim",
    description: "Dalam perjalanan",
    icon: Truck,
  },
  {
    value: "DELIVERED",
    label: "Selesai",
    description: "Sudah diterima",
    icon: CheckCircle2,
  },
  {
    value: "CANCELLED",
    label: "Dibatalkan",
    description: "Pesanan dibatalkan",
    icon: XCircle,
  },
  {
    value: "EXPIRED",
    label: "Kedaluwarsa",
    description: "Melewati batas bayar",
    icon: Clock3,
  },
];

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "bg-marica-amber/20 text-marica-amber-text",
  PAID: "bg-marica-sky-light text-marica-blue",
  PROCESSING: "bg-marica-sky-light text-marica-blue",
  SHIPPED: "bg-marica-violet/20 text-marica-violet-deep",
  DELIVERED: "bg-marica-green/15 text-marica-green",
  CANCELLED: "bg-marica-rose-deep/10 text-marica-rose-deep",
  EXPIRED: "bg-marica-rose-deep/10 text-marica-rose-deep",
};

const LIMIT = 10;

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: OrderStatus) {
  return (
    STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status
  );
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
      });
      if (status) params.set("status", status);
      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await response.json().catch(() => null);
      if (response.status === 401 || response.status === 403)
        throw new Error("Akses admin diperlukan");
      if (!response.ok) throw new Error(json?.error ?? "Gagal memuat pesanan");
      setData(json as OrdersResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat pesanan");
    } finally {
      setIsLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    setUpdatingId(orderId);
    setActionError(null);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.error ?? "Gagal memperbarui status pesanan");
      await loadOrders();
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Gagal memperbarui status pesanan",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = (data?.orders ?? []).filter((order) => {
    const value = query.trim().toLowerCase();
    return (
      !value ||
      order.orderNumber.toLowerCase().includes(value) ||
      order.user?.email?.toLowerCase().includes(value)
    );
  });
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marica-amber/20 text-marica-amber-text">
            <ReceiptText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold text-marica-ink">
              Pesanan
            </h1>
            <p className="mt-1 font-body text-sm text-marica-ink-soft">
              Pantau pesanan pelanggan dan perbarui status pengiriman.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-8 rounded-3xl border border-black/5 bg-white p-4 shadow-[0_12px_32px_rgba(80,50,10,0.06)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-body text-xs font-semibold uppercase tracking-[0.14em] text-marica-amber-text">
              Status pesanan
            </p>
            <h2 className="mt-1 font-display text-xl font-semibold text-marica-ink">
              Kelola alur pesanan
            </h2>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-marica-ink-soft/50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor pesanan atau email..."
              className="w-full rounded-2xl border border-black/10 bg-marica-sky-light/25 py-3 pl-11 pr-4 font-body text-sm text-marica-ink outline-none transition placeholder:text-marica-ink-soft/50 focus:border-marica-amber focus:bg-white focus:ring-4 focus:ring-marica-amber/10"
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setStatus(option.value);
                setPage(1);
              }}
              className={`group relative min-h-20 rounded-2xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-marica-amber/20 ${status === option.value ? "border-marica-amber-dark bg-marica-amber-dark text-white shadow-md" : "border-black/5 bg-marica-sky-light/25 text-marica-ink-soft hover:border-marica-amber/40 hover:bg-marica-amber/10 hover:text-marica-ink"}`}
            >
              <option.icon
                className={`h-4.5 w-4.5 ${status === option.value ? "text-white" : "text-marica-amber-text"}`}
              />
              <span className="mt-2 block font-body text-xs font-semibold">
                {option.label}
              </span>
              <span
                className={`mt-0.5 block font-body text-[10px] leading-tight ${status === option.value ? "text-white/75" : "text-marica-ink-soft/70"}`}
              >
                {option.description}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
            {error}
          </p>
        )}
        {actionError && (
          <p className="mt-4 rounded-xl bg-marica-rose-deep/10 px-4 py-2.5 font-body text-sm text-marica-rose-deep">
            {actionError}
          </p>
        )}

        <div className="relative mt-6 min-h-80 overflow-x-auto rounded-2xl border border-black/5">
          {isLoading && data && (
            <div className="absolute inset-0 z-10 flex items-start justify-center bg-white/55 pt-24 backdrop-blur-[1px]">
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-body text-xs font-semibold text-marica-ink-soft shadow-sm ring-1 ring-black/5">
                <Loader2 className="h-4 w-4 animate-spin text-marica-amber-dark" />
                Memuat pesanan...
              </div>
            </div>
          )}
          <table
            className={`w-full min-w-225 border-collapse transition-opacity duration-200 ${isLoading && data ? "opacity-55" : "opacity-100"}`}
          >
            <thead className="bg-marica-sky-light/25">
              <tr className="border-b border-black/5 text-left font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft/60">
                <th className="py-3 pr-4">Pesanan</th>
                <th className="py-3 pr-4">Pelanggan</th>
                <th className="py-3 pr-4">Produk</th>
                <th className="py-3 pr-4">Total</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && !data && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center font-body text-sm text-marica-ink-soft"
                  >
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              )}
              {!isLoading && filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center font-body text-sm text-marica-ink-soft"
                  >
                    <Package className="mx-auto mb-2 h-6 w-6 opacity-40" />
                    Belum ada pesanan.
                  </td>
                </tr>
              )}
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-black/5 align-top transition-colors last:border-0 hover:bg-marica-sky-light/20"
                >
                  <td className="py-4 pr-4">
                    <p className="font-body text-sm font-semibold text-marica-ink">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 font-body text-xs text-marica-ink-soft">
                      {formatDate(order.createdAt)}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <p className="font-body text-sm text-marica-ink">
                      {order.user?.name ?? order.shippingName}
                    </p>
                    <p className="mt-1 font-body text-xs text-marica-ink-soft">
                      {order.user?.email ?? order.shippingPhone}
                    </p>
                    <p className="mt-1 font-body text-xs text-marica-ink-soft">
                      {order.shippingCity}, {order.shippingProvince}
                    </p>
                  </td>
                  <td className="max-w-65 py-4 pr-4 font-body text-sm text-marica-ink-soft">
                    {order.items.map((item) => (
                      <p key={item.id}>
                        {item.productName} x {item.quantity}
                      </p>
                    ))}
                  </td>
                  <td className="py-4 pr-4 whitespace-nowrap font-body text-sm font-semibold text-marica-ink">
                    {formatRupiah(order.total)}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 font-body text-xs font-semibold ${STATUS_STYLE[order.status]}`}
                    >
                      {statusLabel(order.status)}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        void updateStatus(
                          order.id,
                          event.target.value as OrderStatus,
                        )
                      }
                      className="rounded-lg border border-black/10 bg-white px-2.5 py-2 font-body text-xs text-marica-ink outline-none focus:border-marica-amber disabled:opacity-50"
                      aria-label={`Ubah status ${order.orderNumber}`}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value).map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!isLoading && data && data.pagination.total > 0 && (
          <div className="mt-5 flex items-center justify-between font-body text-sm text-marica-ink-soft">
            <span>
              Menampilkan{" "}
              {(data.pagination.page - 1) * data.pagination.limit + 1}–
              {Math.min(
                data.pagination.page * data.pagination.limit,
                data.pagination.total,
              )}{" "}
              dari {data.pagination.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-lg p-2 hover:bg-black/5 disabled:opacity-30"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span>
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-lg p-2 hover:bg-black/5 disabled:opacity-30"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
