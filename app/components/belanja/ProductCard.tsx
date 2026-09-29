"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Bell,
  Smile,
  Sparkles,
  Users,
  Loader2,
} from "lucide-react";
import type { ApiProduct } from "./types";
import { trackRecommendationEvent } from "./recommendation-tracking";
import AddressModal, {
  loadSavedAddresses,
  saveAddresses,
  type ShippingAddress,
} from "./AddressModal";
import { useBuyNow } from "./useBuyNow";

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function ProductCard({ product }: { product: ApiProduct }) {
  const image = product.images[0]?.url;
  const inStock = product.stock > 0;
  const hasDiscount =
    !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  const ageLabel =
    product.ageMin != null || product.ageMax != null
      ? `${product.ageMin ?? 0}${product.ageMax ? `-${product.ageMax}` : "+"} Thn`
      : null;

  const [addresses, setAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );

  const {
    isAdding,
    isCheckingOut,
    error,
    addressModalOpen,
    setAddressModalOpen,
    totalWeightGrams,
    startBuyNow,
    confirmCheckout,
  } = useBuyNow();

  useEffect(() => {
    const saved = loadSavedAddresses();
    setAddresses(saved);
    setSelectedAddressId(
      saved.find((address) => address.isPrimary)?.id ?? saved[0]?.id ?? null,
    );
  }, []);

  const handleBeli = () => {
    startBuyNow(product.id, 1);
  };

  return (
    <div className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-marica-ink/5 bg-white shadow-[0_10px_28px_rgba(120,60,10,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(120,60,10,0.14)]">
      <Link
        href={`/belanja/${product.slug}`}
        onClick={() => trackRecommendationEvent(product.id, "CLICK")}
        className="relative block aspect-square overflow-hidden bg-marica-cream"
      >
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
          className={`absolute left-2 top-2 rounded-full px-2 py-0.5 font-body text-[9px] font-semibold uppercase tracking-wide sm:left-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[11px] ${
            inStock
              ? "bg-marica-green/90 text-white"
              : "bg-marica-ink/70 text-white"
          }`}
        >
          {inStock ? "Tersedia" : "Stok Habis"}
        </span>

        {hasDiscount && (
          <span className="absolute right-2 top-2 rounded-full bg-marica-rose-deep px-2 py-0.5 font-body text-[9px] font-semibold text-white sm:right-2.5 sm:top-2.5 sm:px-2.5 sm:py-1 sm:text-[11px]">
            -{discountPercent}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-2.5 sm:gap-2.5 sm:p-4">
        <div className="flex min-h-5 flex-wrap items-center gap-1 sm:min-h-6 sm:gap-1.5">
          {ageLabel && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate rounded-full border border-marica-ink/10 px-1.5 py-0.5 font-body text-[9px] font-medium text-marica-ink-soft sm:gap-1 sm:px-2 sm:text-[11px]">
              <Smile className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
              {ageLabel}
            </span>
          )}
          {product.skillFocus.slice(0, 1).map((skill) => (
            <span
              key={skill}
              className="inline-flex max-w-full items-center gap-0.5 truncate rounded-full border border-marica-violet-deep/20 bg-marica-violet/15 px-1.5 py-0.5 font-body text-[9px] font-medium text-marica-violet-deep sm:gap-1 sm:px-2 sm:text-[11px]"
            >
              <Sparkles className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
              {skill}
            </span>
          ))}
          {product.playerCount && (
            <span className="inline-flex max-w-full items-center gap-0.5 truncate rounded-full border border-marica-blue/25 bg-marica-sky-light px-1.5 py-0.5 font-body text-[9px] font-medium text-marica-ink-soft sm:gap-1 sm:px-2 sm:text-[11px]">
              <Users className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />
              {product.playerCount}
            </span>
          )}
        </div>

        <Link
          href={`/belanja/${product.slug}`}
          onClick={() => trackRecommendationEvent(product.id, "CLICK")}
          className="min-h-[2.4rem] sm:min-h-[2.6rem]"
        >
          <h3 className="line-clamp-2 font-display text-[13px] font-semibold leading-snug text-marica-ink transition group-hover:text-marica-amber-text sm:text-[15px] lg:text-base">
            {product.name}
          </h3>
        </Link>

        <p className="min-h-[2rem] line-clamp-2 font-body text-[10px] leading-4 text-marica-ink-soft sm:text-xs">
          {product.description}
        </p>

        <div className="mt-auto flex flex-col items-stretch gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate whitespace-nowrap font-display text-[13px] font-bold text-marica-amber-text sm:text-lg">
              {formatRupiah(product.price)}
            </span>
            {hasDiscount && (
              <span className="truncate whitespace-nowrap font-body text-[10px] text-marica-ink-soft/60 line-through sm:text-[11px]">
                {formatRupiah(product.compareAtPrice as number)}
              </span>
            )}
          </div>

          {inStock ? (
            <button
              type="button"
              onClick={handleBeli}
              disabled={isAdding}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-marica-amber-dark px-3 py-2.5 font-body text-xs font-semibold text-white shadow-sm transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-3.5 sm:py-2 sm:text-sm"
            >
              {isAdding ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="h-3.5 w-3.5" />
              )}
              Beli
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-marica-ink/15 bg-marica-cream px-3 py-2.5 font-body text-xs font-semibold text-marica-ink-soft transition hover:bg-marica-ink/5 sm:w-auto sm:px-3.5 sm:py-2 sm:text-sm"
            >
              <Bell className="h-3.5 w-3.5" />
              Ingatkan
            </button>
          )}
        </div>

        {error && (
          <p className="font-body text-xs text-marica-rose-deep">{error}</p>
        )}
      </div>

      <AddressModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        addresses={addresses}
        selectedId={selectedAddressId}
        onSelect={setSelectedAddressId}
        onAddAddress={(addr) => {
          setAddresses((prev) => {
            const next = addr.isPrimary
              ? [
                  ...prev.map((address) => ({ ...address, isPrimary: false })),
                  addr,
                ]
              : [...prev, addr];
            saveAddresses(next);
            return next;
          });
          setSelectedAddressId(addr.id);
        }}
        totalWeightGrams={totalWeightGrams}
        onConfirm={confirmCheckout}
        isSubmitting={isCheckingOut}
        submitError={error}
      />
    </div>
  );
}
