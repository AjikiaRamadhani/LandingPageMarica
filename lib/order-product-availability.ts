import { prisma } from "@/lib/prisma";

type OrderWithItems<TItem extends { productId: string | null }> = {
  items: TItem[];
};

export async function addProductAvailability<TOrder extends OrderWithItems<{ productId: string | null }>>(
  orders: TOrder[],
) {
  const productIds = [
    ...new Set(
      orders
        .flatMap((order) => order.items.map((item) => item.productId))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const availableProducts = productIds.length
    ? await prisma.product.findMany({
        where: { id: { in: productIds }, isActive: true },
        select: { id: true },
      })
    : [];
  const availableIds = new Set(availableProducts.map((product) => product.id));

  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => ({
      ...item,
      productAvailable: Boolean(item.productId && availableIds.has(item.productId)),
    })),
  }));
}
