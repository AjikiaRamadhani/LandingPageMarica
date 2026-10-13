import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { settleOrderPayment } from "@/lib/settle-order-payment";
import { settlePlaypassBooking } from "@/lib/playpass-booking";
import { settleTableReservation } from "@/lib/table-reservation";
import { sendPlaypassTicketEmailIfNeeded } from "@/lib/playpass-ticket-mailer";
import { sendTableReservationEmailIfNeeded } from "@/lib/table-reservation-mailer";
import { sendEventTicketEmailIfNeeded } from "@/lib/event-ticket-mailer";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

type WinpayCallback = { uuid?: string; ref?: string; amount?: number | string; invoice?: { ref?: string } };

export async function POST(request: Request) {
  try {
    const body = await request.json() as WinpayCallback;
    const reference = body.ref || body.invoice?.ref;
    const amount = Number(body.amount);
    if (!reference || !Number.isFinite(amount)) return new Response("INVALID", { status: 400 });

    if (reference.startsWith("PPB-")) {
      const booking = await prisma.playpassBooking.findFirst({ where: { OR: [{ bookingNumber: reference }, { midtransOrderId: reference }] } });
      if (!booking || booking.totalPrice !== amount) return new Response("INVALID", { status: 400 });
      await settlePlaypassBooking(booking.id, body.uuid || reference);
      await sendPlaypassTicketEmailIfNeeded(booking.id);
      return new Response("ACCEPTED");
    }
    if (reference.startsWith("TBL-")) {
      const reservation = await prisma.tableReservation.findFirst({ where: { OR: [{ reservationNumber: reference }, { midtransOrderId: reference }] } });
      if (!reservation || reservation.totalPrice !== amount) return new Response("INVALID", { status: 400 });
      await settleTableReservation(reservation.id, body.uuid || reference);
      await sendTableReservationEmailIfNeeded(reservation.id);
      return new Response("ACCEPTED");
    }
    if (reference.startsWith("EVT-")) {
      const booking = await prisma.eventBooking.findFirst({ where: { OR: [{ bookingNumber: reference }, { midtransOrderId: reference }] } });
      if (!booking || booking.totalPrice !== amount) return new Response("INVALID", { status: 400 });
      await prisma.$transaction(async (transaction) => {
        const changed = await transaction.eventBooking.updateMany({ where: { id: booking.id, status: "PENDING_PAYMENT" }, data: { status: "PAID", midtransTransactionId: body.uuid || reference, paidAt: new Date() } });
        if (!changed.count) return;
        const tickets = await transaction.eventTicket.count({ where: { bookingId: booking.id } });
        if (!tickets) await transaction.eventTicket.createMany({ data: booking.participantNames.map((name, index) => ({ ticketCode: `${booking.bookingNumber}-${index + 1}`, qrToken: crypto.randomUUID(), bookingId: booking.id, participantName: name })) });
        await awardPointsInTransaction(transaction, { userId: booking.userId, points: calculateEarnedPoints(booking.totalPrice), reason: `Pembayaran event: ${booking.bookingNumber}`, referenceType: "EVENT_BOOKING", referenceId: booking.id, idempotencyKey: `event-booking-paid:${booking.id}` });
      });
      await sendEventTicketEmailIfNeeded(booking.id);
      return new Response("ACCEPTED");
    }
    if (reference.startsWith("POR-")) {
      const reservation = await prisma.preOrderReservation.findFirst({ where: { OR: [{ reservationNumber: reference }, { midtransOrderId: reference }] } });
      if (!reservation || reservation.totalPrice !== amount) return new Response("INVALID", { status: 400 });
      await prisma.preOrderReservation.updateMany({ where: { id: reservation.id, status: "PENDING_PAYMENT" }, data: { status: "PAID", midtransTransactionId: body.uuid || reference, paidAt: new Date() } });
      return new Response("ACCEPTED");
    }
    if (reference.startsWith("SUBC-")) {
      const cycle = await prisma.subscriptionCycle.findFirst({ where: { OR: [{ cycleNumber: reference }, { midtransOrderId: reference }] } });
      if (!cycle || cycle.amount !== amount) return new Response("INVALID", { status: 400 });
      await prisma.$transaction(async (transaction) => {
        const changed = await transaction.subscriptionCycle.updateMany({ where: { id: cycle.id, status: "PENDING_PAYMENT" }, data: { status: "PAID", midtransTransactionId: body.uuid || reference, paidAt: new Date() } });
        if (!changed.count) return;
        await transaction.subscription.update({ where: { id: cycle.subscriptionId }, data: { status: "ACTIVE", nextBillingAt: cycle.periodEnd, nextDeliveryAt: cycle.periodStart } });
        await transaction.subscriptionDelivery.updateMany({ where: { cycleId: cycle.id, status: "SCHEDULED" }, data: { status: "PREPARING" } });
      });
      return new Response("ACCEPTED");
    }

    const order = await prisma.order.findFirst({ where: { OR: [{ orderNumber: reference }, { midtransOrderId: reference }] }, include: { items: true } });
    if (!order || order.total !== amount) return new Response("INVALID", { status: 400 });
    await settleOrderPayment(order, body.uuid || reference);
    return new Response("ACCEPTED");
  } catch (error) {
    console.error("[POST /api/webhooks/winpay]", error);
    return new Response("RETRY", { status: 500 });
  }
}
