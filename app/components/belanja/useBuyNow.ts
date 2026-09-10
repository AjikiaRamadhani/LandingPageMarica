"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ShippingAddress } from "./AddressModal";
import type { ShippingCourierOption } from "./types";

// schema.prisma's Product model has no `weight` field yet, but
// POST /api/shipping/cost requires a weightGrams figure to quote a price.
// Using a flat per-unit placeholder until a real weight field is added —
// swap this out (and the sum below) once that's in the schema.
const DEFAULT_ITEM_WEIGHT_GRAMS = 500;

// Adjust this to wherever your login page actually lives.
const LOGIN_PATH = "/login";

export function useBuyNow() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [totalWeightGrams] = useState(DEFAULT_ITEM_WEIGHT_GRAMS);

  const redirectToLogin = () => {
    if (typeof window !== "undefined") {
      router.push(`${LOGIN_PATH}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  };

  /** Adds a product to the cart only (for a plain "Keranjang" button). */
  const addToCart = async (productId: string, quantity: number, bundleId?: string) => {
    setError(null);
    setIsAdding(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity, bundleId }),
      });
      if (res.status === 401) {
        redirectToLogin();
        return false;
      }
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error ?? "Gagal menambah ke keranjang");
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah ke keranjang");
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  /** Adds the product to the cart and lets the user review it before checkout. */
  const startBuyNow = async (productId: string, quantity: number) => {
    setError(null);
    setIsAdding(true);
    try {
      const addRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (addRes.status === 401) {
        redirectToLogin();
        return;
      }
      const addJson = await addRes.json().catch(() => null);
      if (!addRes.ok) throw new Error(addJson?.error ?? "Gagal menambah ke keranjang");

      router.push("/belanja/keranjang");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah ke keranjang");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmCheckout = async (address: ShippingAddress, shipping: ShippingCourierOption) => {
    void address;
    void shipping;
    setError("Checkout dilakukan dari halaman keranjang.");
  };

  return {
    isAdding,
    isCheckingOut,
    error,
    setError,
    addressModalOpen,
    setAddressModalOpen,
    totalWeightGrams,
    addToCart,
    startBuyNow,
    confirmCheckout,
  };
}
