import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { qrToken?: string };
    const qrToken = body.qrToken?.trim();

    if (!qrToken) {
      return NextResponse.json({ error: "QR token wajib diisi" }, { status: 400 });
    }

    const ticket = await prisma.eventTicket.findUnique({
      where: { qrToken },
      include: {
        booking: {
          include: { event: true },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "QR tiket tidak valid" }, { status: 404 });
    }

    if (ticket.status === "CHECKED_IN") {
      return NextResponse.json(
        {
          error: "Tiket sudah digunakan",
          ticket: {
            ticketCode: ticket.ticketCode,
            participantName: ticket.participantName,
            eventTitle: ticket.booking.event.title,
            checkedInAt: ticket.checkedInAt,
          },
        },
        { status: 409 }
      );
    }

    if (ticket.status === "CANCELLED" || ticket.booking.status !== "PAID") {
      return NextResponse.json({ error: "Tiket tidak aktif" }, { status: 409 });
    }

    const checkedInAt = new Date();
    const updated = await prisma.eventTicket.updateMany({
      where: {
        id: ticket.id,
        qrToken,
        status: "ACTIVE",
      },
      data: {
        status: "CHECKED_IN",
        checkedInAt,
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Tiket baru saja digunakan oleh petugas lain" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      message: "Check-in berhasil",
      ticket: {
        ticketCode: ticket.ticketCode,
        participantName: ticket.participantName,
        eventTitle: ticket.booking.event.title,
        eventDate: ticket.booking.event.eventDate,
        locationName: ticket.booking.event.locationName,
        checkedInAt,
      },
    });
  } catch (error) {
    console.error("[POST /api/event-tickets/check-in]", error);
    return NextResponse.json({ error: "Gagal memproses check-in" }, { status: 500 });
  }
}
