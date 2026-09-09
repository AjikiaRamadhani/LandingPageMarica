import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [events, bookings, orders, printableLeads, ticketSummary] = await Promise.all([
      prisma.event.count({ where: { isActive: true } }),
      prisma.eventBooking.count({}),
      prisma.order.count({}),
      prisma.printableLead.count({}),
      prisma.eventTicket.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ]);

    const totalRevenue = await prisma.eventBooking.aggregate({
      _sum: { totalPrice: true },
      where: { status: "PAID" },
    });

    const paidOrdersRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: "PAID" },
    });

    const orderStatusSummary = await prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const bookingStatusSummary = await prisma.eventBooking.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    return NextResponse.json({
      metrics: {
        activeEvents: events,
        totalBookings: bookings,
        totalOrders: orders,
        totalPrintableLeads: printableLeads,
        totalEventRevenue: totalRevenue._sum.totalPrice ?? 0,
        totalProductRevenue: paidOrdersRevenue._sum.total ?? 0,
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
    });
  } catch (error) {
    console.error("[GET /api/admin/analytics]", error);
    return NextResponse.json({ error: "Gagal mengambil data analytics" }, { status: 500 });
  }
}
