"use client";

import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowLeftRight, Loader2, Search, Warehouse } from "lucide-react";

type Location = "ONLINE_WAREHOUSE" | "MARICA_STORE";
type InventoryProduct = {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  inventories: { location: Location; quantity: number }[];
};
type Movement = {
  id: string;
  type: string;
  location: Location;
  quantityDelta: number;
  reason: string | null;
  referenceId: string | null;
  createdAt: string;
  product: { id: string; name: string; sku: string | null } | null;
};
type InventoryData = {
  products: InventoryProduct[];
  movements: Movement[];
  productsPagination: { page: number; totalPages: number; total: number };
  pagination: { page: number; totalPages: number; total: number };
  summary: {
    totalProducts: number;
    locations: { location: Location; totalStock: number; lowStockCount: number; outOfStockCount: number }[];
  };
};

const LOCATION_LABELS: Record<Location, string> = {
  ONLINE_WAREHOUSE: "Gudang Online",
  MARICA_STORE: "Marica Experience Store",
};

function getStock(product: InventoryProduct, location: Location) {
  return product.inventories.find((inventory) => inventory.location === location)?.quantity ?? 0;
}

export default function AdminInventoryPage() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [search, setSearch] = useState("");
  const [productsPage, setProductsPage] = useState(1);
  const [movementPage, setMovementPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [mode, setMode] = useState<"ADJUSTMENT" | "TRANSFER">("ADJUSTMENT");
  const [type, setType] = useState("ADJUSTMENT");
  const [location, setLocation] = useState<Location>("ONLINE_WAREHOUSE");
  const [fromLocation, setFromLocation] = useState<Location>("ONLINE_WAREHOUSE");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadInventory = useCallback(async (
    query: string,
    productPage: number,
    historyPage: number,
    signal?: AbortSignal,
  ) => {
    const params = new URLSearchParams({
      productsLimit: "100",
      productsPage: String(productPage),
      limit: "25",
      page: String(historyPage),
    });
    if (query.trim()) params.set("search", query.trim());
    const response = await fetch(`/api/admin/inventory?${params}`, {
      cache: "no-store",
      signal,
    });
    const result = (await response.json()) as InventoryData & { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Gagal memuat inventaris");
    setData(result);
    setSelectedProductId((current) =>
      result.products.some((product) => product.id === current)
        ? current
        : result.products[0]?.id ?? "",
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setIsLoading(true);
      loadInventory(search, productsPage, movementPage, controller.signal)
        .catch((reason: unknown) => {
          if (reason instanceof Error && reason.name !== "AbortError") setError(reason.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }, 250);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [loadInventory, movementPage, productsPage, search]);

  const selectedProduct = data?.products.find((product) => product.id === selectedProductId);
  const sourceLocation = mode === "TRANSFER" ? fromLocation : location;
  const sourceQuantity = selectedProduct ? getStock(selectedProduct, sourceLocation) : 0;

  async function submitChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const quantityValue = Number(quantity);
    if (!selectedProductId || !Number.isInteger(quantityValue) || quantityValue === 0) {
      setError("Pilih produk dan masukkan jumlah stok yang valid.");
      return;
    }
    if (mode === "TRANSFER" && quantityValue < 1) {
      setError("Jumlah transfer harus lebih dari 0.");
      return;
    }
    setIsSaving(true);
    try {
      const payload = mode === "TRANSFER"
        ? {
            productId: selectedProductId,
            type: "TRANSFER",
            quantityDelta: quantityValue,
            fromLocation,
            toLocation: fromLocation === "ONLINE_WAREHOUSE" ? "MARICA_STORE" : "ONLINE_WAREHOUSE",
            reason: reason.trim() || "Transfer stok antarlokasi",
          }
        : {
            productId: selectedProductId,
            type,
            location,
            quantityDelta: quantityValue,
            reason: reason.trim() || null,
          };
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Gagal menyimpan perubahan stok");
      setNotice(mode === "TRANSFER" ? "Transfer stok berhasil dicatat." : "Perubahan stok berhasil dicatat.");
      setQuantity("");
      await loadInventory(search, productsPage, movementPage);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal menyimpan perubahan stok");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-marica-sky/40 text-marica-blue">
          <Warehouse className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-marica-ink">Inventaris per lokasi</h1>
          <p className="font-body text-sm text-marica-ink-soft">Stok Online Warehouse dan Experience Store disinkronkan dalam satu ledger.</p>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        {data?.summary.locations.map((item) => (
          <article key={item.location} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-body text-sm font-semibold text-marica-ink">{LOCATION_LABELS[item.location]}</p>
            <p className="mt-2 font-display text-3xl font-bold text-marica-amber-text">{item.totalStock.toLocaleString("id-ID")}</p>
            <p className="mt-1 font-body text-xs text-marica-ink-soft">
              {item.lowStockCount} stok rendah · {item.outOfStockCount} habis
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-marica-ink">Stok produk</h2>
              <p className="font-body text-xs text-marica-ink-soft">{data?.summary.totalProducts ?? 0} produk aktif</p>
            </div>
            <label className="relative block sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-marica-ink-soft" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setProductsPage(1); }} placeholder="Cari produk..." className="w-full rounded-full border border-black/10 py-2 pl-9 pr-4 font-body text-sm outline-none focus:border-marica-amber" />
            </label>
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 font-body text-sm text-red-700">{error}</p>}
          {isLoading && <p className="mt-5 flex items-center gap-2 font-body text-sm text-marica-ink-soft"><Loader2 className="h-4 w-4 animate-spin" /> Memuat inventaris...</p>}
          {!isLoading && data && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left font-body text-sm">
                <thead className="border-b border-black/10 text-xs text-marica-ink-soft">
                  <tr><th className="pb-2 font-medium">Produk</th><th className="pb-2 font-medium">Gudang Online</th><th className="pb-2 font-medium">Experience Store</th></tr>
                </thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product.id} className="border-b border-black/5 last:border-0">
                      <td className="py-3 pr-3"><p className="font-semibold text-marica-ink">{product.name}</p><p className="text-xs text-marica-ink-soft">{product.sku ?? "Tanpa SKU"}</p></td>
                      <td className="py-3 font-semibold text-marica-ink">{getStock(product, "ONLINE_WAREHOUSE")}</td>
                      <td className="py-3 font-semibold text-marica-ink">{getStock(product, "MARICA_STORE")}</td>
                    </tr>
                  ))}
                  {data.products.length === 0 && <tr><td colSpan={3} className="py-8 text-center text-marica-ink-soft">Produk tidak ditemukan.</td></tr>}
                </tbody>
              </table>
              {data.productsPagination.totalPages > 1 && (
                <div className="mt-3 flex items-center justify-between font-body text-xs text-marica-ink-soft">
                  <span>Halaman {data.productsPagination.page} / {data.productsPagination.totalPages} · {data.productsPagination.total} produk</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={productsPage <= 1} onClick={() => setProductsPage((page) => page - 1)} className="rounded-lg border border-black/10 px-2 py-1 disabled:opacity-40">Sebelumnya</button>
                    <button type="button" disabled={productsPage >= data.productsPagination.totalPages} onClick={() => setProductsPage((page) => page + 1)} className="rounded-lg border border-black/10 px-2 py-1 disabled:opacity-40">Berikutnya</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <form onSubmit={submitChange} className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <div>
            <h2 className="font-display text-lg font-bold text-marica-ink">Penyesuaian stok</h2>
            <p className="mt-1 font-body text-xs text-marica-ink-soft">Setiap perubahan dan transfer tercatat pada riwayat inventaris.</p>
          </div>
          <div className="flex rounded-full bg-marica-sky-light/40 p-1">
            <button type="button" onClick={() => setMode("ADJUSTMENT")} className={`flex-1 rounded-full px-3 py-2 font-body text-xs font-semibold ${mode === "ADJUSTMENT" ? "bg-white text-marica-ink shadow-sm" : "text-marica-ink-soft"}`}>Penyesuaian</button>
            <button type="button" onClick={() => setMode("TRANSFER")} className={`flex-1 rounded-full px-3 py-2 font-body text-xs font-semibold ${mode === "TRANSFER" ? "bg-white text-marica-ink shadow-sm" : "text-marica-ink-soft"}`}><ArrowLeftRight className="mr-1 inline h-3.5 w-3.5" />Transfer</button>
          </div>
          <label className="block font-body text-xs font-semibold text-marica-ink">Produk
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal">
              {data?.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </select>
          </label>
          {mode === "TRANSFER" ? (
            <label className="block font-body text-xs font-semibold text-marica-ink">Dari lokasi
              <select value={fromLocation} onChange={(event) => setFromLocation(event.target.value as Location)} className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal">
                {Object.entries(LOCATION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
          ) : (
            <>
              <label className="block font-body text-xs font-semibold text-marica-ink">Lokasi
                <select value={location} onChange={(event) => setLocation(event.target.value as Location)} className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal">
                  {Object.entries(LOCATION_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
              </label>
              <label className="block font-body text-xs font-semibold text-marica-ink">Jenis pergerakan
                <select value={type} onChange={(event) => setType(event.target.value)} className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm font-normal">
                  <option value="ADJUSTMENT">Penyesuaian (+/-)</option>
                  <option value="PURCHASE">Barang masuk / pembelian (+)</option>
                  <option value="RETURN">Retur masuk (+)</option>
                  <option value="RESERVATION">Reservasi (-)</option>
                  <option value="RELEASE">Lepas reservasi (+)</option>
                </select>
              </label>
            </>
          )}
          <label className="block font-body text-xs font-semibold text-marica-ink">
            {mode === "TRANSFER" ? `Jumlah dipindahkan (stok asal: ${sourceQuantity})` : `Perubahan jumlah stok${type === "ADJUSTMENT" ? " (gunakan nilai negatif untuk mengurangi)" : ""}`}
            <input type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal" />
          </label>
          <label className="block font-body text-xs font-semibold text-marica-ink">Alasan / catatan
            <input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} className="mt-1.5 w-full rounded-xl border border-black/10 px-3 py-2.5 text-sm font-normal" />
          </label>
          {notice && <p role="status" className="rounded-lg bg-green-50 p-2.5 font-body text-xs text-green-800">{notice}</p>}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-2.5 font-body text-xs text-red-700">{error}</p>}
          <button type="submit" disabled={isSaving || !selectedProductId} className="w-full rounded-full bg-marica-amber-dark px-4 py-2.5 font-body text-sm font-semibold text-white disabled:opacity-50">
            {isSaving ? "Menyimpan..." : mode === "TRANSFER" ? "Catat transfer" : "Simpan perubahan"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-bold text-marica-ink">Riwayat pergerakan stok</h2>
        <div className="mt-4 divide-y divide-black/5">
          {data?.movements.map((movement) => (
            <div key={movement.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-body text-sm font-semibold text-marica-ink">{movement.product?.name ?? "Produk dihapus"} · {LOCATION_LABELS[movement.location]}</p>
                <p className="font-body text-xs text-marica-ink-soft">{movement.type}{movement.reason ? ` · ${movement.reason}` : ""}{movement.referenceId ? ` · ${movement.referenceId}` : ""}</p>
              </div>
              <div className="flex gap-4 font-body text-xs text-marica-ink-soft">
                <span className={movement.quantityDelta > 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>{movement.quantityDelta > 0 ? "+" : ""}{movement.quantityDelta}</span>
                <time dateTime={movement.createdAt}>{new Date(movement.createdAt).toLocaleString("id-ID")}</time>
              </div>
            </div>
          ))}
          {data?.movements.length === 0 && <p className="py-8 text-center font-body text-sm text-marica-ink-soft">Belum ada pergerakan stok.</p>}
        </div>
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 font-body text-xs text-marica-ink-soft">
            <span>Halaman {data.pagination.page} / {data.pagination.totalPages} · {data.pagination.total} pergerakan</span>
            <div className="flex gap-2">
              <button type="button" disabled={movementPage <= 1} onClick={() => setMovementPage((page) => page - 1)} className="rounded-lg border border-black/10 px-2 py-1 disabled:opacity-40">Sebelumnya</button>
              <button type="button" disabled={movementPage >= data.pagination.totalPages} onClick={() => setMovementPage((page) => page + 1)} className="rounded-lg border border-black/10 px-2 py-1 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
