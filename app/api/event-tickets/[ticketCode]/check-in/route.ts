import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { ticketCode } = await params;
    const body = (await request.json()) as { qrToken?: string };
    const qrToken = body.qrToken?.trim();

    if (!qrToken) {
      return NextResponse.json({ error: "QR token wajib diisi" }, { status: 400 });
    }

    const updated = await prisma.eventTicket.updateMany({
      where: {
        ticketCode,
        qrToken,
        status: "ACTIVE",
      },
      data: {
        status: "CHECKED_IN",
        checkedInAt: new Date(),
      },
    });

    if (updated.count === 0) {
      const ticket = await prisma.eventTicket.findUnique({
        where: { ticketCode },
        select: { status: true },
      });

      return NextResponse.json(
        {
          error: ticket?.status === "CHECKED_IN" ? "Tiket sudah digunakan" : "QR tiket tidak valid",
        },
        { status: 409 }
      );
    }

    const ticket = await prisma.eventTicket.findUnique({
      where: { ticketCode },
      include: { booking: { include: { event: true } } },
    });

    return NextResponse.json({
      message: "Check-in berhasil",
      ticket: {
        ticketCode: ticket?.ticketCode,
        participantName: ticket?.participantName,
        eventTitle: ticket?.booking.event.title,
        checkedInAt: ticket?.checkedInAt,
      },
    });
  } catch (error) {
    console.error("[POST /api/event-tickets/check-in]", error);
    return NextResponse.json({ error: "Gagal memproses check-in" }, { status: 500 });
  }
}