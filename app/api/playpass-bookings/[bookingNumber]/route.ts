import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";
import { settlePlaypassBooking } from "@/lib/playpass-booking";
import { sendPlaypassTicketEmailIfNeeded } from "@/lib/playpass-ticket-mailer";

type MidtransStatus = { transaction_status?: string; transaction_id?: string; gross_amount?: string; fraud_status?: string };

async function syncPayment(booking: { id: string; status: string; midtransOrderId: string | null; totalPrice: number }) {
  if (booking.status !== "PENDING_PAYMENT" || !booking.midtransOrderId) return;
  const transactionApi = (coreApi as unknown as { transaction: { status: (id: string) => Promise<unknown> } }).transaction;
  const payment = (await transactionApi.status(booking.midtransOrderId)) as MidtransStatus;
  const isPaid = payment.transaction_status === "settlement" || (payment.transaction_status === "capture" && payment.fraud_status !== "deny");
  if (!isPaid) return;
  if (payment.gross_amount && Number(payment.gross_amount) !== booking.totalPrice) throw new Error("Nominal pembayaran tidak sesuai");
  await settlePlaypassBooking(booking.id, payment.transaction_id ?? booking.midtransOrderId);
  await sendPlaypassTicketEmailIfNeeded(booking.id);
}

export async function GET(_request: Request, { params }: { params: Promise<{ bookingNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { bookingNumber } = await params;
  const booking = await prisma.playpassBooking.findFirst({ where: { bookingNumber, userId: session.user.id }, include: { package: true, tickets: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
  if (!booking) return NextResponse.json({ error: "Booking Playpass tidak ditemukan" }, { status: 404 });
  try {
    await syncPayment(booking);
    if (booking.status === "PENDING_PAYMENT") {
      const refreshed = await prisma.playpassBooking.findUnique({ where: { id: booking.id }, include: { package: true, tickets: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
      return NextResponse.json(refreshed ?? booking);
    }
  } catch (error) {
    console.error("[GET /api/playpass-bookings/[bookingNumber]] payment sync", error);
  }
  return NextResponse.json(booking);
}

export async function POST(_request: Request, { params }: { params: Promise<{ bookingNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { bookingNumber } = await params;
  const booking = await prisma.playpassBooking.findFirst({ where: { bookingNumber, userId: session.user.id } });
  if (!booking) return NextResponse.json({ error: "Booking Playpass tidak ditemukan" }, { status: 404 });
  try {
    await syncPayment(booking);
    const updated = await prisma.playpassBooking.findUnique({ where: { id: booking.id }, include: { package: true, tickets: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
    return NextResponse.json(updated ?? booking);
  } catch (error) {
    console.error("[POST /api/playpass-bookings/[bookingNumber]] payment sync", error);
    return NextResponse.json({ error: "Status pembayaran belum dapat diverifikasi" }, { status: 502 });
  }
}
