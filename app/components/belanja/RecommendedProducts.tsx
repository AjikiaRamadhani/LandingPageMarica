"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import type { ApiProduct } from "./types";
import { getRecommendationSessionId } from "./recommendation-tracking";

type RecommendedProductsProps = {
  productId: string;
  limit?: number;
};

export default function RecommendedProducts({
  productId,
  limit = 5,
}: RecommendedProductsProps) {
  const requestKey = `${productId}:${limit}`;
  const [loaded, setLoaded] = useState<{
    key: string;
    products: ApiProduct[];
  } | null>(null);
  const isLoading = loaded?.key !== requestKey;
  const products = loaded?.key === requestKey ? loaded.products : [];

  useEffect(() => {
    const controller = new AbortController();
    const sessionId = getRecommendationSessionId();
    const query = new URLSearchParams({ limit: String(limit) });
    if (sessionId) query.set("sessionId", sessionId);

    fetch(`/api/recommendations/${productId}?${query.toString()}`, {
      signal: controller.signal,
    })
      .then(async (response) => {
        const json = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(json?.error ?? "Gagal memuat rekomendasi");
        }
        return json;
      })
      .then((json) => {
        if (!controller.signal.aborted) {
          setLoaded({
            key: requestKey,
            products: Array.isArray(json.products) ? json.products : [],
          });
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load product recommendations", error);
          setLoaded({ key: requestKey, products: [] });
        }
      });

    return () => controller.abort();
  }, [productId, limit, requestKey]);

  if (!isLoading && products.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="recommended-products-heading">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2
            id="recommended-products-heading"
            className="font-display text-lg font-bold text-marica-ink sm:text-xl"
          >
            Mungkin Anda Juga Suka
          </h2>
          <p className="mt-1 font-body text-sm text-marica-ink-soft">
            Pilihan lain yang cocok untuk kebutuhan belajar si kecil.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
            <div
              key={index}
              className="h-[360px] animate-pulse rounded-2xl bg-marica-ink/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
