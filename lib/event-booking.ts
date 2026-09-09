import { prisma } from "@/lib/prisma";

export async function expireStalePendingBookings() {
  const now = new Date();

  return prisma.eventBooking.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export async function getActiveBookedQuantity(eventId: string) {
  await expireStalePendingBookings();

  const activeBookings = await prisma.eventBooking.aggregate({
    where: {
      eventId,
      OR: [
        { status: "PAID" },
        { status: "PENDING_PAYMENT", expiresAt: { gt: new Date() } },
      ],
    },
    _sum: { quantity: true },
  });

  return activeBookings._sum.quantity ?? 0;
}

export async function transitionExpiredPendingOrders() {
  const now = new Date();

  await prisma.order.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      createdAt: { lt: new Date(now.getTime() - 30 * 60 * 1000) },
    },
    data: { status: "EXPIRED" },
  });

  await prisma.eventBooking.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      expiresAt: { lt: now },
    },
    data: { status: "EXPIRED" },
  });
}

export async function runCleanupJobs() {
  await transitionExpiredPendingOrders();
  await expireStalePendingBookings();
}
