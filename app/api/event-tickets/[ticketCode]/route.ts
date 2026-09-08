import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketCode: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const { ticketCode } = await params;
  const ticket = await prisma.eventTicket.findUnique({
    where: { ticketCode },
    include: {
      booking: {
        include: {
          event: true,
        },
      },
    },
  });

  if (!ticket || ticket.booking.userId !== session.user.id) {
    return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
  }

  const qrDataUrl = await QRCode.toDataURL(ticket.qrToken, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 320,
  });

  return NextResponse.json({
    ticket: {
      ticketCode: ticket.ticketCode,
      participantName: ticket.participantName,
      status: ticket.status,
      checkedInAt: ticket.checkedInAt,
      event: {
        title: ticket.booking.event.title,
        eventDate: ticket.booking.event.eventDate,
        startTime: ticket.booking.event.startTime,
        endTime: ticket.booking.event.endTime,
        locationName: ticket.booking.event.locationName,
        locationAddress: ticket.booking.event.locationAddress,
      },
    },
    qrDataUrl,
  });
}