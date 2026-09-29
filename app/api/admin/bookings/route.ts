import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [events, playpasses, tableReservations] = await Promise.all([
      prisma.eventBooking.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          event: { select: { id: true, title: true, eventDate: true, startTime: true, endTime: true } },
          tickets: { select: { ticketCode: true, participantName: true, status: true, checkedInAt: true } },
        },
      }),
      prisma.playpassBooking.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          package: { select: { id: true, name: true, durationMinutes: true, price: true } },
          tickets: { select: { ticketNumber: true, status: true, checkedInAt: true } },
        },
      }),
      prisma.tableReservation.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          package: { select: { id: true, name: true, durationMinutes: true, price: true, maxPlayers: true } },
        },
      }),
    ]);

    return NextResponse.json({ events, playpasses, tableReservations });
  } catch (error) {
    console.error("[GET /api/admin/bookings]", error);
    return NextResponse.json({ error: "Gagal mengambil data booking" }, { status: 500 });
  }
}
