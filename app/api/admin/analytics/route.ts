import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import type { OrderStatus } from "@/app/generated/prisma/index.js";
import { aggregatePosRetailSales } from "@/lib/omnichannel-sales";

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

    const [events, bookings, orders, printableLeads, ticketSummary, paidOrders, topProducts, paymentMethods, lowStockInventories, legacyPosTransactions, cashierTransactions] = await Promise.all([
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
      }),
      prisma.order.groupBy({
        by: ["paymentMethod"],
        where: paidOrderWhere,
        _count: { paymentMethod: true },
      }),
      prisma.productInventory.findMany({
        where: { quantity: { lte: 10 }, product: { isActive: true } },
        orderBy: [{ quantity: "asc" }, { product: { name: "asc" } }],
        take: 10,
        include: { product: { select: { id: true, name: true, sku: true } } },
      }),
      prisma.posTransaction.findMany({
        where: { status: "COMPLETED", createdAt: { gte: from, lt: until } },
        select: {
          createdAt: true,
          subtotal: true,
          discountAmount: true,
          paymentMethod: true,
          items: { select: { productId: true, quantity: true, subtotal: true } },
        },
      }),
      prisma.cashierTransaction.findMany({
        where: { status: "COMPLETED", createdAt: { gte: from, lt: until } },
        select: {
          createdAt: true,
          subtotal: true,
          discountAmount: true,
          paymentMethod: true,
          items: {
            where: { type: "PRODUCT" },
            select: { productId: true, type: true, quantity: true, subtotal: true },
          },
        },
      }),
    ]);
    const posRetail = aggregatePosRetailSales([
      ...legacyPosTransactions,
      ...cashierTransactions,
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

    const [playpassSummary, tableFeeSummary] = await Promise.all([
      prisma.playpassTicket.aggregate({
        where: { createdAt: { gte: from, lt: until }, status: { in: ["ACTIVE", "CHECKED_IN"] } },
        _count: { _all: true },
        _sum: { total: true },
      }),
      prisma.tableFeeSession.aggregate({
        where: { createdAt: { gte: from, lt: until }, status: { in: ["ACTIVE", "COMPLETED"] } },
        _count: { _all: true },
        _sum: { total: true },
      }),
    ]);

    const onlineProductSales = new Map(
      topProducts.map((item) => [
        item.productId,
        {
          quantity: item._sum.quantity ?? 0,
          revenue: item._sum.subtotal ?? 0,
        },
      ]),
    );
    for (const [productId, sale] of posRetail.products) {
      const existing = onlineProductSales.get(productId) ?? { quantity: 0, revenue: 0 };
      onlineProductSales.set(productId, {
        quantity: existing.quantity + sale.quantity,
        revenue: existing.revenue + sale.revenue,
      });
    }
    const productIds = [...onlineProductSales.keys()].filter((id): id is string => Boolean(id));
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productNames = new Map(products.map((product) => [product.id, product.name]));
    const combinedTopProducts = [...onlineProductSales.entries()]
      .map(([productId, sales]) => ({
        name: productId ? productNames.get(productId) ?? "Produk tidak ditemukan" : "Produk dihapus",
        quantity: sales.quantity,
        revenue: sales.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);

    const combinedPaymentMethods = new Map<string, number>();
    for (const method of paymentMethods) {
      const key = method.paymentMethod ?? "Tidak diketahui";
      combinedPaymentMethods.set(key, (combinedPaymentMethods.get(key) ?? 0) + (method._count.paymentMethod ?? 0));
    }
    for (const [method, count] of posRetail.paymentCounts) {
      combinedPaymentMethods.set(method, (combinedPaymentMethods.get(method) ?? 0) + count);
    }
    const totalOnlineProductRevenue = paidOrdersRevenue._sum?.total ?? 0;

    return NextResponse.json({
      period: { days, from: from.toISOString(), until: until.toISOString() },
      metrics: {
        activeEvents: events,
        totalBookings: bookings,
        totalOrders: orders,
        totalPrintableLeads: printableLeads,
        totalEventRevenue: totalRevenue._sum.totalPrice ?? 0,
        totalProductRevenue: totalOnlineProductRevenue + posRetail.revenue,
        totalPosRetailRevenue: posRetail.revenue,
        totalPosRetailTransactions: posRetail.transactionCount,
        totalPlaypassRevenue: playpassSummary._sum.total ?? 0,
        totalTableFeeRevenue: tableFeeSummary._sum.total ?? 0,
      },
      posServiceSummary: {
        playpass: { count: playpassSummary._count._all, revenue: playpassSummary._sum.total ?? 0 },
        tableFee: { count: tableFeeSummary._count._all, revenue: tableFeeSummary._sum.total ?? 0 },
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
        return { date: key, revenue: orderRevenue + (posRetail.dailyRevenue.get(key) ?? 0) };
      }),
      topProducts: combinedTopProducts,
      paymentMethodSummary: [...combinedPaymentMethods].map(([method, count]) => ({ method, count })),
      leadSummary: { total: printableLeads },
      lowStockProducts: lowStockInventories.map((inventory) => ({
        ...inventory.product,
        location: inventory.location,
        stock: inventory.quantity,
      })),
      salesChannels: [
        { channel: "ONLINE", revenue: totalOnlineProductRevenue },
        { channel: "POS", revenue: posRetail.revenue },
      ],
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Gagal mengambil data analytics" }, { status: 500 });
  }
}
