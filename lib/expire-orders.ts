import { prisma } from "@/lib/prisma";
import { sendOrderExpiredEmailIfNeeded } from "@/lib/order-mailer";

export async function expireStaleOrders() {
  const staleOrders = await prisma.order.findMany({
    where: {
      status: "PENDING_PAYMENT",
      createdAt: { lt: new Date(Date.now() - 30 * 60 * 1000) },
    },
    select: { id: true },
  });

  await prisma.order.updateMany({
    where: { id: { in: staleOrders.map((order) => order.id) }, status: "PENDING_PAYMENT" },
    data: { status: "EXPIRED" },
  });

  await Promise.all(staleOrders.map((order) => sendOrderExpiredEmailIfNeeded(order.id)));
  return staleOrders.length;
}
