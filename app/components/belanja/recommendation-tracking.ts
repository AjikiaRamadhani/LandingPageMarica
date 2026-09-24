"use client";

export type RecommendationEventType = "VIEW" | "CLICK" | "CART";

const SESSION_STORAGE_KEY = "marica-recommendation-session";

export function getRecommendationSessionId() {
  if (typeof window === "undefined") return null;

  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing && /^[A-Za-z0-9_-]{16,100}$/.test(existing)) return existing;

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
}

export function trackRecommendationEvent(
  productId: string,
  type: RecommendationEventType,
) {
  const sessionId = getRecommendationSessionId();
  if (!sessionId) return;

  void fetch("/api/recommendations/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, type, sessionId }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never interrupt shopping.
  });
}
