"use client";

// Loads Midtrans' Snap.js popup script once per page and exposes a small
// helper to trigger payment with a snap token returned by POST /api/checkout.
//
// REQUIRES an extra env var: NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
// (lib/midtrans.ts only reads MIDTRANS_CLIENT_KEY server-side — Snap.js runs
// in the browser and needs the *public* client key exposed via a
// NEXT_PUBLIC_ prefixed var to work.)

declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options?: {
          onSuccess?: (result: unknown) => void;
          onPending?: (result: unknown) => void;
          onError?: (result: unknown) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

let loadingPromise: Promise<void> | null = null;

export function loadMidtransSnap(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.snap) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById("midtrans-snap-script") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Gagal memuat Midtrans Snap.js")));
      return;
    }

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true";
    const script = document.createElement("script");
    script.id = "midtrans-snap-script";
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "");
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap.js"));
    document.body.appendChild(script);
  });

  return loadingPromise;
}

export async function payWithSnap(
  token: string,
  handlers: {
    onSuccess?: (result: unknown) => void;
    onPending?: (result: unknown) => void;
    onError?: (result: unknown) => void;
    onClose?: () => void;
  }
) {
  await loadMidtransSnap();
  window.snap?.pay(token, handlers);
}
