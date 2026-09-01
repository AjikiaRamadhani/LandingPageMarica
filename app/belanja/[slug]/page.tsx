"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Bell,
  Smile,
  Sparkles,
  Users,
  Star,
  Minus,
  Plus,
  PlayCircle,
  ChevronRight,
  ChevronDown,
  BadgePercent,
  PackageX,
} from "lucide-react";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import type { ApiProduct, ApiProductImage } from "../../components/belanja/types";

type ApiProductDetail = ApiProduct & {
  category: (ApiProduct["category"] & { parent: { id: string; name: string; slug: string } | null }) | null;
  bundles: {
    id: string;
    name: string;
    bundlePrice: number;
    savings: number;
    otherProducts: ApiProduct[];
  }[];
};

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function ProductDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);

  useEffect(() => {
    if (!params?.slug) return;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/products/${params.slug}`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error ?? "Produk tidak ditemukan");
        return json as ApiProductDetail;
      })
      .then((json) => {
        if (cancelled) return;
        setProduct(json);
        setActiveImageIdx(0);
        setQty(1);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Produk tidak ditemukan");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params?.slug]);

  const inStock = (product?.stock ?? 0) > 0;
  const hasDiscount = !!product?.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent =
    hasDiscount && product ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100) : 0;

  const ageLabel =
    product && (product.ageMin != null || product.ageMax != null)
      ? `${product.ageMin ?? 0}${product.ageMax ? `-${product.ageMax}` : "+"} Thn`
      : null;

  const images: ApiProductImage[] = useMemo(
    () => (product?.images?.length ? product.images : []),
    [product]
  );
  const activeImage = images[activeImageIdx];

  const breadcrumb = useMemo(() => {
    if (!product) return [];
    const crumbs: { label: string; href?: string }[] = [{ label: "Belanja", href: "/belanja" }];
    if (product.category?.parent) {
      crumbs.push({ label: product.category.parent.name, href: `/belanja?category=${product.category.parent.slug}` });
    }
    if (product.category) {
      crumbs.push({ label: product.category.name, href: `/belanja?category=${product.category.slug}` });
    }
    crumbs.push({ label: product.name });
    return crumbs;
  }, [product]);

  const maxQty = Math.min(product?.stock ?? 1, 99);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Mobile compact header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-marica-ink/5 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Kembali"
          className="flex h-9 w-9 items-center justify-center rounded-full text-marica-ink transition hover:bg-marica-cream"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Link
          href="/keranjang"
          aria-label="Keranjang"
          className="flex h-9 w-9 items-center justify-center rounded-full text-marica-amber-dark transition hover:bg-marica-cream"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>
      </div>

      {/* Desktop navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>

      <main className="section-soft-bg flex-1">
        <div className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-10 lg:pt-8">
          {/* Breadcrumb — desktop only */}
          {!isLoading && product && (
            <nav className="mb-6 hidden flex-wrap items-center gap-1.5 font-body text-sm text-marica-ink-soft lg:flex">
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-marica-ink-soft/40" />}
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition hover:text-marica-amber-text">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-marica-ink">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {isLoading && <DetailSkeleton />}

          {!isLoading && error && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-marica-ink/5 bg-white py-20 text-center shadow-sm">
              <PackageX className="h-10 w-10 text-marica-ink-soft/40" />
              <p className="font-display text-base font-semibold text-marica-ink">{error}</p>
              <Link
                href="/belanja"
                className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-marica-amber-dark px-4 py-2 font-body text-sm font-semibold text-white transition hover:brightness-105"
              >
                Kembali ke Belanja
              </Link>
            </div>
          )}

          {!isLoading && !error && product && (
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
              {/* Gallery */}
              <div>
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-marica-ink/5 bg-marica-cream">
                  {activeImage?.isVideo ? (
                    <video
                      key={activeImage.id}
                      src={activeImage.url}
                      controls
                      className="h-full w-full object-cover"
                    />
                  ) : activeImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeImage.url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-sm text-marica-ink-soft/50">
                      {product.name}
                    </div>
                  )}

                  <span
                    className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-body text-[11px] font-semibold uppercase tracking-wide ${
                      product.isBestSeller
                        ? "bg-marica-amber-dark text-white"
                        : inStock
                          ? "bg-marica-green/90 text-white"
                          : "bg-marica-ink/70 text-white"
                    }`}
                  >
                    {product.isBestSeller ? "Best Seller" : inStock ? "Tersedia" : "Stok Habis"}
                  </span>
                </div>

                {images.length > 1 && (
                  <div className="mt-3 flex gap-2.5">
                    {images.map((img, i) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition sm:h-20 sm:w-20 ${
                          i === activeImageIdx ? "border-marica-amber-dark" : "border-transparent"
                        }`}
                      >
                        {img.isVideo ? (
                          <span className="flex h-full w-full items-center justify-center bg-marica-ink/80">
                            <PlayCircle className="h-6 w-6 text-white" />
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img.url} alt="" className="h-full w-full object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col">
                <h1 className="font-display text-xl font-bold leading-tight text-marica-ink sm:text-2xl lg:text-3xl">
                  {product.name}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 font-body text-sm text-marica-ink-soft">
                  <span className="flex items-center gap-1">
                    <Stars rating={product.ratingAvg} />
                    <span className="ml-0.5">({product.reviewCount} Ulasan)</span>
                  </span>
                  {product.soldCount > 0 && (
                    <>
                      <span className="text-marica-ink-soft/40">•</span>
                      <span>Terjual {product.soldCount}+</span>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-baseline gap-2.5">
                  <span className="font-display text-2xl font-bold text-marica-amber-text sm:text-3xl">
                    {formatRupiah(product.price)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="font-body text-sm text-marica-ink-soft/50 line-through">
                        {formatRupiah(product.compareAtPrice as number)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-marica-rose-deep/10 px-2 py-0.5 font-body text-xs font-semibold text-marica-rose-deep">
                        <BadgePercent className="h-3.5 w-3.5" />
                        -{discountPercent}%
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {ageLabel && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-marica-ink/10 px-3 py-1.5 font-body text-xs font-medium text-marica-ink-soft">
                      <Smile className="h-3.5 w-3.5" />
                      {ageLabel}
                    </span>
                  )}
                  {product.skillFocus.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 rounded-full border border-marica-violet-deep/20 bg-marica-violet/15 px-3 py-1.5 font-body text-xs font-medium text-marica-violet-deep"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {skill}
                    </span>
                  ))}
                  {product.playerCount && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-marica-blue/25 bg-marica-sky-light px-3 py-1.5 font-body text-xs font-medium text-marica-ink-soft">
                      <Users className="h-3.5 w-3.5" />
                      {product.playerCount}
                    </span>
                  )}
                </div>

                <div className="mt-6 border-t border-marica-ink/5 pt-6">
                  <h2 className="font-display text-base font-semibold text-marica-ink">Deskripsi Produk</h2>
                  <p
                    className={`mt-2 font-body text-sm leading-relaxed text-marica-ink-soft ${
                      descExpanded ? "" : "line-clamp-4"
                    }`}
                  >
                    {product.description}
                  </p>
                  {product.description.length > 180 && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((v) => !v)}
                      className="mt-1.5 inline-flex items-center gap-1 font-body text-sm font-semibold text-marica-amber-text hover:underline"
                    >
                      {descExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                      <ChevronDown className={`h-4 w-4 transition ${descExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>

                {/* Qty + CTA */}
                <div className="mt-6 rounded-2xl border border-marica-ink/5 bg-white p-4 shadow-[0_10px_28px_rgba(120,60,10,0.06)] sm:p-5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-body text-sm font-medium text-marica-ink">Jumlah</span>
                    {inStock && (
                      <span className="font-body text-xs font-medium text-marica-green">
                        Stok: {product.stock}
                      </span>
                    )}
                  </div>

                  {inStock && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        disabled={qty <= 1}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-marica-ink/15 text-marica-ink transition hover:bg-marica-cream disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-body text-sm font-semibold text-marica-ink">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                        disabled={qty >= maxQty}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-marica-ink/15 text-marica-ink transition hover:bg-marica-cream disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="Tambah jumlah"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <span className="font-body text-xs text-marica-ink-soft sm:hidden">
                        Sisa {product.stock} buah
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                    {inStock ? (
                      <>
                        <button
                          type="button"
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-marica-amber-dark px-4 py-3 font-body text-sm font-semibold text-marica-amber-text transition hover:bg-marica-amber/10"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Keranjang
                        </button>
                        <button
                          type="button"
                          className="flex-1 rounded-full bg-marica-amber-dark px-4 py-3 font-body text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
                        >
                          Beli Sekarang
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-marica-ink/15 bg-marica-cream px-4 py-3 font-body text-sm font-semibold text-marica-ink-soft transition hover:bg-marica-ink/5"
                      >
                        <Bell className="h-4 w-4" />
                        Ingatkan Saya Saat Tersedia
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bundles */}
          {!isLoading && !error && product && product.bundles.length > 0 && (
            <div className="mt-10 rounded-2xl border border-marica-ink/5 bg-white p-5 shadow-[0_10px_28px_rgba(120,60,10,0.06)] sm:p-7">
              <h2 className="font-display text-lg font-bold text-marica-ink sm:text-xl">
                Rekomendasi Paket Hemat
              </h2>

              <div className="mt-5 flex flex-col gap-6">
                {product.bundles.map((bundle) => (
                  <div
                    key={bundle.id}
                    className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-4"
                  >
                    <BundleTile name={product.name} price={product.price} image={product.images[0]?.url} highlighted />
                    {bundle.otherProducts.map((item, i) => (
                      <div key={item.id} className="flex items-center gap-4 sm:contents">
                        <Plus className="h-5 w-5 shrink-0 text-marica-ink-soft/40" />
                        <BundleTile name={item.name} price={item.price} image={item.images[0]?.url} />
                      </div>
                    ))}

                    <div className="hidden text-marica-ink-soft/40 sm:block">
                      <span className="font-display text-xl">=</span>
                    </div>

                    <div className="w-full max-w-[220px] rounded-xl bg-marica-rose-deep/5 p-4 text-center sm:text-left">
                      <p className="inline-flex items-center gap-1 font-body text-xs font-semibold text-marica-rose-deep">
                        <BadgePercent className="h-3.5 w-3.5" />
                        Hemat {formatRupiah(bundle.savings)}
                      </p>
                      <p className="mt-1.5 font-body text-xs text-marica-ink-soft">Total Paket:</p>
                      <p className="font-display text-lg font-bold text-marica-ink">
                        {formatRupiah(bundle.bundlePrice)}
                      </p>
                      <button
                        type="button"
                        className="mt-2.5 w-full rounded-full bg-marica-amber-dark px-3 py-2 font-body text-xs font-semibold text-white shadow-sm transition hover:brightness-105"
                      >
                        Tambah Paket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="hidden lg:block">
        <Footer />
      </div>
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="flex items-center gap-0.5 text-marica-amber-dark">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rounded ? "fill-current" : "text-marica-ink/15"}`}
        />
      ))}
    </span>
  );
}

function BundleTile({
  name,
  price,
  image,
  highlighted,
}: {
  name: string;
  price: number;
  image?: string;
  highlighted?: boolean;
}) {
  return (
    <div className="flex w-32 shrink-0 flex-col items-center gap-2 text-center">
      <div
        className={`relative h-24 w-24 overflow-hidden rounded-xl border-2 bg-marica-cream ${
          highlighted ? "border-marica-amber-dark" : "border-marica-ink/10"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-body text-[10px] text-marica-ink-soft/50">
            {name}
          </div>
        )}
      </div>
      <p className="line-clamp-2 font-body text-xs font-medium text-marica-ink">{name}</p>
      <p className="font-body text-xs font-semibold text-marica-amber-text">{formatRupiah(price)}</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-2 lg:gap-12">
      <div className="aspect-square rounded-2xl bg-marica-ink/5" />
      <div className="flex flex-col gap-3">
        <div className="h-7 w-3/4 rounded bg-marica-ink/5" />
        <div className="h-4 w-1/3 rounded bg-marica-ink/5" />
        <div className="h-8 w-1/2 rounded bg-marica-ink/5" />
        <div className="h-24 w-full rounded bg-marica-ink/5" />
        <div className="h-32 w-full rounded bg-marica-ink/5" />
      </div>
    </div>
  );
}