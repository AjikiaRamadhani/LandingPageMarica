import crypto from "crypto";

export function preorderReservationNumber() {
  return `POR-${Date.now().toString(36).toUpperCase()}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export function preorderIsOpen(openAt: Date, closeAt: Date | null, now = new Date()) {
  return now >= openAt && (!closeAt || now <= closeAt);
}
