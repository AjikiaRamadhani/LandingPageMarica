"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Bell, Smile, Sparkles, Users } from "lucide-react";
import type { ApiProduct } from "./types";
import AddressModal, { type ShippingAddress } from "./AddressModal";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

// Mock saved addresses — replace with a fetch to /api/addresses once that
// endpoint exists. If you show this modal from multiple places (product
// card, product detail, cart), consider lifting this state up to a shared
// context/provider instead of duplicating it per component.
const MOCK_ADDRESSES: ShippingAddress[] = [
  {
    id: "addr-1",
    label: "Rumah",
    isPrimary: true,
    recipientName: "Budi Santoso",
    phone: "081234567890",
    province: "Jawa Tengah",
    city: "Kota Magelang",
    district: "Magelang Tengah",
    postalCode: "56117",
    fullAddress: "Jl. Pahlawan No. 12, RT 03/RW 05",
  },
];

export default function ProductCard({ product }: { product: ApiProduct }) {
  const router = useRouter();
  const image = product.images[0]?.url;
  const inStock = product.stock > 0;
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  const ageLabel =
    product.ageMin != null || product.ageMax != null
      ? `${product.ageMin ?? 0}${product.ageMax ? `-${product.ageMax}` : "+"} Thn`
      : null;

  // --- Shipping address modal state -----------------------------------
  const [addresses, setAddresses] = useState<ShippingAddress[]>(MOCK_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    MOCK_ADDRESSES[0]?.id ?? null
  );
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const handleBeli = () => {
    setAddressModalOpen(true);
  };

  const handleConfirmAddress = (address: ShippingAddress) => {
    setAddressModalOpen(false);

    // TODO: replace with your real checkout call, e.g.:
    // const res = await fetch("/api/checkout", {
    //   method: "POST",
    //   body: JSON.stringify({ productId: product.id, qty: 1, shippingAddressId: address.id }),
    // });
    // const { orderId } = await res.json();
    // router.push(`/belanja/pesanan-saya/${orderId}/bayar`);
    console.log("Lanjut ke pembayaran:", { product: product.slug, address });
    router.push("/belanja/pesanan-saya");
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-marica-ink/5 bg-white shadow-[0_10px_28px_rgba(120,60,10,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(120,60,10,0.14)]">
      <Link href={`/belanja/${product.slug}`} className="relative block aspect-square overflow-hidden bg-marica-cream">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-sm text-marica-ink-soft/50">
            {product.name}
          </div>
        )}

        <span
          className={`absolute left-2.5 top-2.5 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide ${
            inStock
              ? "bg-marica-green/90 text-white"
              : "bg-marica-ink/70 text-white"
          }`}
        >
          {inStock ? "Tersedia" : "Stok Habis"}
        </span>

        {hasDiscount && (
          <span className="absolute right-2.5 top-2.5 rounded-full bg-marica-rose-deep px-2.5 py-1 font-body text-[11px] font-semibold text-white">
            -{discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {ageLabel && (
            <span className="inline-flex items-center gap-1 rounded-full border border-marica-ink/10 px-2 py-0.5 font-body text-[11px] font-medium text-marica-ink-soft">
              <Smile className="h-3 w-3" />
              {ageLabel}
            </span>
          )}
          {product.skillFocus.slice(0, 1).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-marica-violet-deep/20 bg-marica-violet/15 px-2 py-0.5 font-body text-[11px] font-medium text-marica-violet-deep"
            >
              <Sparkles className="h-3 w-3" />
              {skill}
            </span>
          ))}
          {product.playerCount && (
            <span className="inline-flex items-center gap-1 rounded-full border border-marica-blue/25 bg-marica-sky-light px-2 py-0.5 font-body text-[11px] font-medium text-marica-ink-soft">
              <Users className="h-3 w-3" />
              {product.playerCount}
            </span>
          )}
        </div>

        <Link href={`/belanja/${product.slug}`} className="min-h-[2.6rem]">
          <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-snug text-marica-ink transition group-hover:text-marica-amber-text sm:text-base">
            {product.name}
          </h3>
        </Link>

        <p className="line-clamp-1 font-body text-xs text-marica-ink-soft">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <div className="flex flex-col leading-tight">
            <span className="font-display text-base font-bold text-marica-amber-text sm:text-lg">
              {formatRupiah(product.price)}
            </span>
            {hasDiscount && (
              <span className="font-body text-[11px] text-marica-ink-soft/60 line-through">
                {formatRupiah(product.compareAtPrice as number)}
              </span>
            )}
          </div>

          {inStock ? (
            <button
              type="button"
              onClick={handleBeli}
              className="inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-3.5 py-2 font-body text-xs font-semibold text-white shadow-sm transition hover:brightness-105 sm:text-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Beli
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-marica-ink/15 bg-marica-cream px-3.5 py-2 font-body text-xs font-semibold text-marica-ink-soft transition hover:bg-marica-ink/5 sm:text-sm"
            >
              <Bell className="h-3.5 w-3.5" />
              Ingatkan
            </button>
          )}
        </div>
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        onAddAddress={(addr) => {
          setAddresses((prev) => [...prev, addr]);
          setSelectedAddressId(addr.id);
          // TODO: persist to your backend, e.g. POST /api/addresses
        }}
        onConfirm={handleConfirmAddress}
      />
    </div>
  );
}