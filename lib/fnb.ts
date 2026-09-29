import { prisma } from "@/lib/prisma";

export type FnbSelection = {
  productId: string;
  quantity: number;
};

export type BookingParticipantInput = {
  name: string;
  age?: number;
  relationship?: string;
};

export async function getActiveFnbProducts() {
  return prisma.fnbProduct.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, description: true, price: true, stock: true, imageUrl: true },
  });
}

export async function resolveFnbItems(items: FnbSelection[] | undefined) {
  const normalized = (items ?? []).filter(
    (item) => typeof item?.productId === "string" && Number.isInteger(item.quantity) && item.quantity > 0,
  );
  if (normalized.length > 10) throw new Error("FNB_TOO_MANY_ITEMS");

  const productIds = [...new Set(normalized.map((item) => item.productId))];
  if (productIds.length === 0) return { total: 0, items: [] as Array<{ fnbProductId: string; quantity: number; unitPrice: number; subtotal: number }> };

  const products = await prisma.fnbProduct.findMany({ where: { id: { in: productIds }, isActive: true } });
  const productMap = new Map(products.map((product) => [product.id, product]));
  const quantities = new Map<string, number>();
  for (const item of normalized) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);

  const resolved = [...quantities.entries()].map(([productId, quantity]) => {
    const product = productMap.get(productId);
    if (!product) throw new Error("FNB_PRODUCT_NOT_FOUND");
    if (quantity > product.stock) throw new Error("FNB_STOCK_SHORTAGE");
    return { fnbProductId: product.id, quantity, unitPrice: product.price, subtotal: product.price * quantity };
  });

  return { total: resolved.reduce((sum, item) => sum + item.subtotal, 0), items: resolved };
}

export function normalizeParticipants(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return [] as BookingParticipantInput[];
  if (value.length > 20) throw new Error("TOO_MANY_PARTICIPANTS");
  return value.map((item) => {
    const participant = item as { name?: unknown; age?: unknown; relationship?: unknown };
    const name = typeof participant.name === "string" ? participant.name.trim() : "";
    if (!name || name.length > 100) throw new Error("PARTICIPANT_INVALID");
    const age = participant.age === undefined || participant.age === null ? undefined : Number(participant.age);
    if (age !== undefined && (!Number.isInteger(age) || age < 0 || age > 120)) throw new Error("PARTICIPANT_INVALID");
    const relationship = typeof participant.relationship === "string" ? participant.relationship.trim().slice(0, 50) : undefined;
    return { name, age, relationship };
  });
}
