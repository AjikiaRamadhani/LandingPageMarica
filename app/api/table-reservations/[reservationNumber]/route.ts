import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";
import { settleTableReservation } from "@/lib/table-reservation";
import { sendTableReservationEmailIfNeeded } from "@/lib/table-reservation-mailer";

type MidtransStatus = { transaction_status?: string; transaction_id?: string; gross_amount?: string; fraud_status?: string };

async function syncPayment(reservation: { id: string; status: string; midtransOrderId: string | null; totalPrice: number }) {
  if (reservation.status !== "PENDING_PAYMENT" || !reservation.midtransOrderId) return;
  const transactionApi = (coreApi as unknown as { transaction: { status: (id: string) => Promise<unknown> } }).transaction;
  const payment = (await transactionApi.status(reservation.midtransOrderId)) as MidtransStatus;
  const isPaid = payment.transaction_status === "settlement" || (payment.transaction_status === "capture" && payment.fraud_status !== "deny");
  if (!isPaid) return;
  if (payment.gross_amount && Number(payment.gross_amount) !== reservation.totalPrice) throw new Error("Nominal pembayaran tidak sesuai");
  await settleTableReservation(reservation.id, payment.transaction_id ?? reservation.midtransOrderId);
  await sendTableReservationEmailIfNeeded(reservation.id);
}

export async function GET(_request: Request, { params }: { params: Promise<{ reservationNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { reservationNumber } = await params;
  const reservation = await prisma.tableReservation.findFirst({ where: { reservationNumber, userId: session.user.id }, include: { package: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
  if (!reservation) return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
  try {
    await syncPayment(reservation);
    if (reservation.status === "PENDING_PAYMENT") {
      const refreshed = await prisma.tableReservation.findUnique({ where: { id: reservation.id }, include: { package: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
      return NextResponse.json(refreshed ?? reservation);
    }
  } catch (error) {
    console.error("[GET /api/table-reservations/[reservationNumber]] payment sync", error);
  }
  return NextResponse.json(reservation);
}

export async function POST(_request: Request, { params }: { params: Promise<{ reservationNumber: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const { reservationNumber } = await params;
  const reservation = await prisma.tableReservation.findFirst({ where: { reservationNumber, userId: session.user.id } });
  if (!reservation) return NextResponse.json({ error: "Reservasi tidak ditemukan" }, { status: 404 });
  if (reservation.status !== "PENDING_PAYMENT" || !reservation.midtransOrderId) return NextResponse.json(reservation);

  try {
    const transactionApi = (coreApi as unknown as { transaction: { status: (id: string) => Promise<unknown> } }).transaction;
    const payment = (await transactionApi.status(reservation.midtransOrderId)) as MidtransStatus;
    const isPaid = payment.transaction_status === "settlement" || (payment.transaction_status === "capture" && payment.fraud_status !== "deny");
    if (isPaid) {
      if (payment.gross_amount && Number(payment.gross_amount) !== reservation.totalPrice) return NextResponse.json({ error: "Nominal pembayaran tidak sesuai" }, { status: 400 });
      await settleTableReservation(reservation.id, payment.transaction_id ?? reservation.midtransOrderId);
      await sendTableReservationEmailIfNeeded(reservation.id);
    }
    const updated = await prisma.tableReservation.findUnique({ where: { id: reservation.id }, include: { package: true, fnbItems: { include: { fnbProduct: true } }, participants: true } });
    return NextResponse.json(updated ?? reservation);
  } catch (error) {
    console.error("[POST /api/table-reservations/[reservationNumber]]", error);
    return NextResponse.json({ error: "Status pembayaran belum dapat diverifikasi" }, { status: 502 });
  }
}
