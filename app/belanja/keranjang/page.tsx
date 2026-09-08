"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import AddressModal, {
  loadSavedAddresses,
  saveAddresses,
  type ShippingAddress,
} from "../../components/belanja/AddressModal";
import type {
  ApiCart,
  ApiCartItem,
  ShippingCourierOption,
} from "../../components/belanja/types";

const DEFAULT_ITEM_WEIGHT_GRAMS = 500;

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<ApiCart>({ items: [], subtotal: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCart = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/cart");
      const json = await response.json().catch(() => null);
      if (response.status === 401) {
        router.push(
          `/login?callbackUrl=${encodeURIComponent("/belanja/keranjang")}`,
        );
        return;
      }
      if (!response.ok)
        throw new Error(json?.error ?? "Gagal memuat keranjang");
      setCart(json as ApiCart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat keranjang");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCart(); // eslint-disable-line react-hooks/set-state-in-effect
    const saved = loadSavedAddresses();
    setAddresses(saved);
    setSelectedAddressId(
      saved.find((address) => address.isPrimary)?.id ?? saved[0]?.id ?? null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalWeightGrams = useMemo(
    () =>
      cart.items.reduce(
        (total, item) => total + item.quantity * DEFAULT_ITEM_WEIGHT_GRAMS,
        0,
      ),
    [cart.items],
  );

  const updateItem = async (item: ApiCartItem, quantity: number) => {
    if (quantity < 1) return removeItem(item.id);
    setBusyItemId(item.id);
    setError(null);
    try {
      const response = await fetch(`/api/cart/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.error ?? "Gagal mengubah jumlah produk");
      await loadCart();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal mengubah jumlah produk",
      );
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setBusyItemId(itemId);
    setError(null);
    try {
      const response = await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
      const json = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(json?.error ?? "Gagal menghapus produk");
      await loadCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus produk");
    } finally {
      setBusyItemId(null);
    }
  };

  const confirmCheckout = async (
    address: ShippingAddress,
    shipping: ShippingCourierOption,
  ) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingName: address.recipientName,
          shippingPhone: address.phone,
          shippingAddress: address.fullAddress,
          shippingCity: address.city,
          shippingProvince: address.province,
          shippingPostalCode: address.postalCode,
          shippingCourier: shipping.courier,
          shippingService: shipping.service,
          shippingCost: shipping.cost,
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.error ?? "Gagal membuat pesanan");

      setAddressModalOpen(false);
      router.push("/belanja/pesanan-saya");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
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
            className="mb-5 inline-flex items-center gap-1.5 font-body text-sm font-medium text-marica-ink-soft hover:text-marica-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Kembali
          </button>

          <div className="flex items-center justify-between gap-4">
            <h1 className="font-display text-2xl font-bold text-marica-ink sm:text-3xl">
              Keranjang
            </h1>
            <Link
              href="/belanja"
              className="font-body text-sm font-semibold text-marica-amber-text hover:underline"
            >
              Lanjut Belanja
            </Link>
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-marica-rose-deep/5 p-3 font-body text-sm text-marica-rose-deep">
              {error}
            </p>
          )}

          {!isLoading && cart.items.length === 0 ? (
            <div className="mt-8 flex flex-col items-center gap-3 rounded-2xl border border-marica-ink/5 bg-white py-16 text-center shadow-sm">
              <ShoppingBag className="h-10 w-10 text-marica-ink-soft/40" />
              <h2 className="font-display text-lg font-semibold text-marica-ink">
                Keranjang masih kosong
              </h2>
              <Link
                href="/belanja"
                className="rounded-full bg-marica-amber-dark px-5 py-2.5 font-body text-sm font-semibold text-white"
              >
                Pilih Produk
              </Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
              <div className="flex flex-col gap-3">
                {isLoading && (
                  <div className="h-40 animate-pulse rounded-2xl bg-marica-ink/5" />
                )}
                {cart.items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    busy={busyItemId === item.id}
                    onChange={updateItem}
                    onRemove={removeItem}
                  />
                ))}
              </div>

              <aside className="h-fit rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-sm">
                <h2 className="font-display text-lg font-bold text-marica-ink">
                  Ringkasan Pesanan
                </h2>
                <div className="mt-4 flex items-center justify-between font-body text-sm text-marica-ink-soft">
                  <span>{cart.items.length} produk</span>
                  <span>{formatRupiah(cart.subtotal)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-marica-ink/10 pt-3 font-body font-bold text-marica-ink">
                  <span>Subtotal</span>
                  <span>{formatRupiah(cart.subtotal)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  disabled={isLoading || cart.items.length === 0}
                  className="mt-5 w-full rounded-full bg-marica-amber-dark py-3 font-body text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Lanjut ke Pesanan
                </button>
                <p className="mt-3 text-center font-body text-xs text-marica-ink-soft">
                  Pembayaran dilakukan setelah pesanan dibuat.
                </p>
              </aside>
            </div>
          )}
        </div>
      </main>
      <Footer />

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        onAddAddress={(address) => {
          const next = address.isPrimary
            ? [
                ...addresses.map((saved) => ({ ...saved, isPrimary: false })),
                address,
              ]
            : [...addresses, address];
          saveAddresses(next);
          setAddresses(next);
          setSelectedAddressId(address.id);
        }}
        totalWeightGrams={totalWeightGrams}
        onConfirm={confirmCheckout}
        isSubmitting={isSubmitting}
        submitError={error}
      />
    </div>
  );
}

function CartItemRow({
  item,
  busy,
  onChange,
  onRemove,
}: {
  item: ApiCartItem;
  busy: boolean;
  onChange: (item: ApiCartItem, quantity: number) => void;
  onRemove: (itemId: string) => void;
}) {
  const image = item.product.images[0]?.url;
  return (
    <div className="flex gap-3 rounded-2xl border border-marica-ink/5 bg-white p-3 shadow-sm sm:gap-4 sm:p-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-marica-cream sm:h-24 sm:w-24">
        {image && (
          <img
            src={image}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-marica-ink sm:text-base">
          {item.product.name}
        </p>
        <p className="mt-1 font-body text-sm font-bold text-marica-amber-text">
          {formatRupiah(item.product.price)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Kurangi jumlah"
            disabled={busy}
            onClick={() => onChange(item, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-marica-ink/10 text-marica-ink-soft disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-6 text-center font-body text-sm font-semibold text-marica-ink">
            {item.quantity}
          </span>
          <button
            type="button"
            aria-label="Tambah jumlah"
            disabled={busy || item.quantity >= item.product.stock}
            onClick={() => onChange(item, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-marica-ink/10 text-marica-ink-soft disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          {busy && (
            <Loader2 className="h-4 w-4 animate-spin text-marica-ink-soft" />
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
        <p className="font-body text-sm font-bold text-marica-ink">
          {formatRupiah(item.product.price * item.quantity)}
        </p>
        <button
          type="button"
          aria-label={`Hapus ${item.product.name}`}
          disabled={busy}
          onClick={() => onRemove(item.id)}
          className="text-marica-rose-deep transition hover:brightness-75 disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
