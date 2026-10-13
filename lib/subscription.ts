import crypto from "crypto";

export function subscriptionNumber(prefix = "SUB") {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export function addSubscriptionPeriod(date: Date, interval: "MONTHLY" | "QUARTERLY") {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + (interval === "QUARTERLY" ? 3 : 1));
  return next;
}
