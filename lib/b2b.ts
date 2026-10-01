import crypto from "crypto";

export function createB2BInquiryNumber() {
  return `B2B-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function createQuotationNumber() {
  return `QT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}

export function parseOptionalDate(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new Error("INVALID_DATE");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new Error("INVALID_DATE");
  return parsed;
}

export function parseInquiryNumber(value: string) {
  const normalized = value.trim();
  if (!normalized || normalized.length > 80) throw new Error("INVALID_INQUIRY_NUMBER");
  return normalized;
}

export function calculateQuotationItems(items: unknown) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 50) throw new Error("INVALID_QUOTATION_ITEMS");
  return items.map((item) => {
    const input = item as { name?: unknown; description?: unknown; quantity?: unknown; unitPrice?: unknown; discount?: unknown };
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const description = typeof input.description === "string" ? input.description.trim() : null;
    const quantity = Number(input.quantity);
    const unitPrice = Number(input.unitPrice);
    const discount = input.discount === undefined ? 0 : Number(input.discount);
    if (!name || name.length > 200 || !Number.isInteger(quantity) || quantity < 1 || !Number.isInteger(unitPrice) || unitPrice < 0 || !Number.isInteger(discount) || discount < 0 || discount > quantity * unitPrice) {
      throw new Error("INVALID_QUOTATION_ITEMS");
    }
    return { name, description: description || null, quantity, unitPrice, discount, subtotal: quantity * unitPrice - discount };
  });
}
