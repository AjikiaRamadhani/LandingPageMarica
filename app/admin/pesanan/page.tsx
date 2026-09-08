"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Search,
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

const STATUS_OPTIONS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "PENDING_PAYMENT", label: "Menunggu Pembayaran" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "DELIVERED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
  { value: "EXPIRED", label: "Kedaluwarsa" },
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
        <h1 className="font-display text-2xl font-semibold text-marica-ink">
          Pesanan
        </h1>
        <p className="mt-1 font-body text-sm text-marica-ink-soft">
          Pantau pesanan pelanggan dan perbarui status pengiriman.
        </p>
      </motion.div>

      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-full bg-marica-sky-light/40 p-1">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setStatus(option.value);
                  setPage(1);
                }}
                className={`shrink-0 rounded-full px-3 py-1.5 font-body text-xs font-medium transition ${status === option.value ? "bg-marica-amber-dark text-white" : "text-marica-ink-soft hover:text-marica-ink"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="relative lg:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft/50" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cari nomor atau email"
              className="w-full rounded-full border border-black/10 bg-marica-sky-light/30 py-2 pl-10 pr-4 font-body text-sm text-marica-ink outline-none focus:border-marica-amber focus:bg-white"
            />
          </div>
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

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
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
              {isLoading && (
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
              {!isLoading &&
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-black/5 align-top last:border-0"
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
                    <td className="max-w-[260px] py-4 pr-4 font-body text-sm text-marica-ink-soft">
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
