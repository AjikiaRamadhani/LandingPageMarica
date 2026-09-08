import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { sendEventTicketEmailIfNeeded } from "@/lib/event-ticket-mailer";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ bookingNumber: string }> }
) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { bookingNumber } = await params;
  const booking = await prisma.eventBooking.findUnique({ where: { bookingNumber } });
  if (!booking) return NextResponse.json({ error: "Booking tidak ditemukan" }, { status: 404 });
  if (booking.status !== "PAID") {
    return NextResponse.json(
      { error: "Email tiket hanya bisa dikirim untuk booking paid" },
      { status: 409 }
    );
  }

  await prisma.eventBooking.update({
    where: { id: booking.id },
    data: { ticketEmailSentAt: null },
  });
  const sent = await sendEventTicketEmailIfNeeded(booking.id);
  if (!sent) return NextResponse.json({ error: "Gagal mengirim email tiket" }, { status: 502 });
  return NextResponse.json({ message: "Email tiket berhasil dikirim ulang" });
}
