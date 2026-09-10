import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/client";

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = new URL(request.url).searchParams;
    const requestedDays = Number(params.get("days") ?? 30);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 30;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(today);
    from.setDate(from.getDate() - days + 1);
    const until = new Date(today);
    until.setDate(until.getDate() + 1);
    const paidOrderStatuses: OrderStatus[] = [
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
    ];
    const paidOrderWhere = {
      status: { in: paidOrderStatuses },
      OR: [
        { paidAt: { gte: from, lt: until } },
        { paidAt: null, createdAt: { gte: from, lt: until } },
      ],
    };

    const [events, bookings, orders, printableLeads, ticketSummary, paidOrders, topProducts, paymentMethods] = await Promise.all([
      prisma.event.count({ where: { isActive: true } }),
      prisma.eventBooking.count({ where: { createdAt: { gte: from, lt: until } } }),
      prisma.order.count({ where: { createdAt: { gte: from, lt: until } } }),
      prisma.printableLead.count({ where: { createdAt: { gte: from, lt: until } } }),
      prisma.eventTicket.groupBy({ by: ["status"], _count: { status: true } }),
      prisma.order.findMany({
        where: paidOrderWhere,
        select: { paidAt: true, createdAt: true, total: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        where: { order: paidOrderWhere },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { subtotal: "desc" } },
        take: 3,
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: paidOrderWhere,
        _count: { paymentMethod: true },
      }),
    ]);

    const totalRevenue = await prisma.eventBooking.aggregate({
      _sum: { totalPrice: true },
      where: { status: "PAID", paidAt: { gte: from, lt: until } },
    });

    const paidOrdersRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: paidOrderWhere,
    });

    const orderStatusSummary = await prisma.order.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lt: until } },
      _count: { status: true },
    });

    const bookingStatusSummary = await prisma.eventBooking.groupBy({
      by: ["status"],
      where: { createdAt: { gte: from, lt: until } },
      _count: { status: true },
    });

    return NextResponse.json({
      period: { days, from: from.toISOString(), until: until.toISOString() },
      metrics: {
        activeEvents: events,
        totalBookings: bookings,
        totalOrders: orders,
        totalPrintableLeads: printableLeads,
        totalEventRevenue: totalRevenue._sum.totalPrice ?? 0,
        totalProductRevenue: paidOrdersRevenue._sum?.total ?? 0,
      },
      ticketSummary: ticketSummary.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      orderStatusSummary: orderStatusSummary.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      bookingStatusSummary: bookingStatusSummary.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      salesTrend: Array.from({ length: days }, (_, index) => {
        const date = new Date(from);
        date.setDate(from.getDate() + index);
        const key = date.toISOString().slice(0, 10);
        const orderRevenue = paidOrders
          .filter((item) => (item.paidAt ?? item.createdAt).toISOString().slice(0, 10) === key)
          .reduce((sum, item) => sum + item.total, 0);
        return { date: key, revenue: orderRevenue };
      }),
      topProducts: await (async () => {
        const products = await prisma.product.findMany({
          where: { id: { in: topProducts.map((item) => item.productId) } },
          select: { id: true, name: true },
        });
        const productMap = new Map(products.map((product) => [product.id, product.name]));
        return topProducts.map((item) => ({
          name: productMap.get(item.productId) ?? "Produk tidak ditemukan",
          quantity: item._sum?.quantity ?? 0,
          revenue: item._sum?.subtotal ?? 0,
        }));
      })(),
      paymentMethodSummary: paymentMethods.map((item) => ({
        method: item.paymentMethod ?? "Tidak diketahui",
        count: item._count?.paymentMethod ?? 0,
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Gagal mengambil data analytics" }, { status: 500 });
  }
}
