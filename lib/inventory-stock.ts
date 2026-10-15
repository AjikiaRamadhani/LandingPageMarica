import type { Prisma } from "@/app/generated/prisma/index.js";

export const INVENTORY_LOCATIONS = [
  "ONLINE_WAREHOUSE",
  "MARICA_STORE",
] as const;

export type InventoryLocation = (typeof INVENTORY_LOCATIONS)[number];

export async function changeInventoryQuantity(
  tx: Prisma.TransactionClient,
  productId: string,
  location: InventoryLocation,
  quantityDelta: number,
) {
  const changed = await tx.productInventory.updateMany({
    where: {
      productId,
      location,
      ...(quantityDelta < 0 ? { quantity: { gte: -quantityDelta } } : {}),
    },
    data: { quantity: { increment: quantityDelta } },
  });

  if (changed.count !== 1) throw new Error("STOCK_SHORTAGE");

  if (location === "ONLINE_WAREHOUSE") {
    await tx.product.update({
      where: { id: productId },
      data: { stock: { increment: quantityDelta } },
    });
  }
}

export async function lockInventoryProducts(
  tx: Prisma.TransactionClient,
  productIds: string[],
  location: InventoryLocation,
) {
  if (productIds.length === 0) return [];
  return tx.$queryRaw<
    Array<{ id: string; name: string; price: number; stock: number }>
  >`
    SELECT p.id, p.name, p.price, i.quantity AS stock
    FROM "products" p
    INNER JOIN "product_inventories" i ON i."productId" = p.id
    WHERE p.id = ANY (${productIds})
      AND p."isActive" = true
      AND i.location = ${location}::"InventoryLocation"
    FOR UPDATE OF p, i
  `;
}
