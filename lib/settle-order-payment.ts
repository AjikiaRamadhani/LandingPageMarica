import { prisma } from "@/lib/prisma";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

type OrderToSettle = {
  id: string;
  userId: string;
  orderNumber: string;
  total: number;
  items: Array<{ productId: string; quantity: number }>;
};

/**
 * Finalizes a verified Midtrans payment exactly once. This is shared by the
 * webhook and the client-triggered status sync used when a local webhook URL
 * cannot be reached by Midtrans Sandbox.
 */
export async function settleOrderPayment(
  order: OrderToSettle,
  transactionId: string,
) {
  await prisma.$transaction(async (transaction) => {
    const lockedOrders = await transaction.$queryRaw<Array<{ id: string; status: string }>>`
      SELECT id, status
      FROM "orders"
      WHERE id = ${order.id}
      FOR UPDATE
    `;

    // Midtrans can send the same notification more than once.
    if (lockedOrders.length === 0 || lockedOrders[0].status !== "PENDING_PAYMENT") {
      return;
    }

    const productIds = order.items.map((item) => item.productId);
    const lockedProducts = await transaction.$queryRaw<
      Array<{ id: string; stock: number }>
    >`
      SELECT id, stock
      FROM "products"
      WHERE id = ANY (${productIds})
      FOR UPDATE
    `;

    const stockMap = new Map(lockedProducts.map((product) => [product.id, product.stock]));
    const shortage = order.items.find(
      (item) => (stockMap.get(item.productId) ?? 0) < item.quantity,
    );

    if (shortage) {
      throw Object.assign(new Error("STOCK_SHORTAGE"), {
        statusCode: 409,
        detail: `Stok produk tidak cukup untuk pesanan ${order.orderNumber}`,
      });
    }

    const paidOrder = await transaction.order.updateMany({
      where: { id: order.id, status: "PENDING_PAYMENT" },
      data: {
        status: "PAID",
        midtransTransactionId: transactionId,
        paidAt: new Date(),
      },
    });

    if (paidOrder.count === 0) return;

    await Promise.all(
      order.items.map((item) =>
        transaction.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        }),
      ),
    );

    await transaction.inventoryMovement.createMany({
      data: order.items.map((item) => ({
        productId: item.productId,
        orderId: order.id,
        type: "SALE" as const,
        quantityDelta: -item.quantity,
        reason: "Midtrans payment settled",
        referenceId: transactionId,
      })),
    });

    await transaction.recommendationEvent.createMany({
      data: order.items.map((item) => ({
        userId: order.userId,
        productId: item.productId,
        type: "PURCHASE" as const,
      })),
    });

    await awardPointsInTransaction(transaction, {
      userId: order.userId,
      points: calculateEarnedPoints(order.total),
      reason: `Pembayaran pesanan: ${order.orderNumber}`,
      referenceType: "ORDER",
      referenceId: order.id,
      idempotencyKey: `order-paid:${order.id}`,
    });
  });
}
