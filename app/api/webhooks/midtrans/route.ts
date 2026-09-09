import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEventTicketEmailIfNeeded } from "@/lib/event-ticket-mailer";

// Handler GET ini bukan buat fungsi bisnis apa-apa, cuma jaga-jaga kalau Midtrans
// (atau kamu ngetes manual lewat browser) ngirim GET request buat verifikasi URL ini hidup.
// Tanpa ini, GET request bakal kena 405 Method Not Allowed.
export async function GET() {
  return NextResponse.json({ status: "ok", message: "Midtrans webhook endpoint is alive" });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } =
      body as {
        order_id: string;
        status_code: string;
        gross_amount: string;
        signature_key: string;
        transaction_status: string;
        transaction_id: string;
      };

    if (
      !order_id ||
      !status_code ||
      !gross_amount ||
      !signature_key ||
      !transaction_status ||
      !transaction_id ||
      !process.env.MIDTRANS_SERVER_KEY
    ) {
      return NextResponse.json({ error: "Invalid Midtrans notification" }, { status: 400 });
    }

    // Verifikasi signature - WAJIB, biar gak ada orang random yang bisa
    // ngirim notifikasi palsu buat nge-mark order dia sebagai "lunas"
    const expectedSignature = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
      .digest("hex");

    if (signature_key !== expectedSignature) {
      console.error("[Midtrans webhook] Invalid signature for order", order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    if (order_id.startsWith("EVT-")) {
      const booking = await prisma.eventBooking.findUnique({
        where: { midtransOrderId: order_id },
      });

      if (!booking) {
        return NextResponse.json({ error: "Event booking not found" }, { status: 404 });
      }

      if (Number(gross_amount) !== booking.totalPrice) {
        console.error("[Midtrans webhook] Event amount mismatch for", order_id);
        return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
      }

      if (transaction_status === "capture" || transaction_status === "settlement") {
        await prisma.$transaction(async (transaction) => {
          const paidBooking = await transaction.eventBooking.updateMany({
            where: { id: booking.id, status: "PENDING_PAYMENT" },
            data: {
              status: "PAID",
              midtransTransactionId: transaction_id,
              paidAt: new Date(),
            },
          });

          if (paidBooking.count === 0) return;

          const existingTickets = await transaction.eventTicket.count({
            where: { bookingId: booking.id },
          });

          if (existingTickets === 0) {
            await transaction.eventTicket.createMany({
              data: booking.participantNames.map((participantName, index) => ({
                ticketCode: `${booking.bookingNumber}-${index + 1}`,
                qrToken: crypto.randomUUID(),
                bookingId: booking.id,
                participantName,
              })),
            });
          }
        });
        await sendEventTicketEmailIfNeeded(booking.id);
      } else if (transaction_status === "pending") {
        await prisma.eventBooking.updateMany({
          where: { id: booking.id, status: "PENDING_PAYMENT" },
          data: { status: "PENDING_PAYMENT" },
        });
      } else if (
        transaction_status === "deny" ||
        transaction_status === "cancel" ||
        transaction_status === "expire"
      ) {
        await prisma.eventBooking.updateMany({
          where: { id: booking.id, status: "PENDING_PAYMENT" },
          data: { status: transaction_status === "expire" ? "EXPIRED" : "CANCELLED" },
        });
      }

      return NextResponse.json({ message: "OK" });
    }

    const order = await prisma.order.findUnique({
      where: { midtransOrderId: order_id },
      include: { items: true },
    });

    if (!order) {
      console.error("[Midtrans webhook] Order not found:", order_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (Number(gross_amount) !== order.total) {
      console.error("[Midtrans webhook] Product amount mismatch for", order_id);
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 });
    }

    if (transaction_status === "capture" && body.fraud_status && body.fraud_status !== "accept") {
      return NextResponse.json({ error: "Payment not accepted" }, { status: 400 });
    }

    if (transaction_status === "capture" || transaction_status === "settlement") {
      await prisma.$transaction(async (transaction) => {
        const productIds = order.items.map((item) => item.productId);
        const lockedProducts = await transaction.$queryRaw<Array<{ id: string; stock: number }>>`
          SELECT id, stock
          FROM "products"
          WHERE id = ANY (${productIds})
          FOR UPDATE
        `;

        const stockMap = new Map(lockedProducts.map((product) => [product.id, product.stock]));
        const shortage = order.items.find((item) => (stockMap.get(item.productId) ?? 0) < item.quantity);

        if (shortage) {
          throw Object.assign(new Error("STOCK_SHORTAGE"), {
            statusCode: 409,
            detail: `Stok produk tidak cukup untuk pesanan ${order.orderNumber}`,
          });
        }

        const paidOrder = await transaction.order.updateMany({
          where: { id: order.id, status: "PENDING_PAYMENT" },
          data: {
            status: "PAID",
            midtransTransactionId: transaction_id,
            paidAt: new Date(),
          },
        });

        if (paidOrder.count === 0) return;

        await Promise.all(order.items.map((item) =>
          transaction.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          })
        ));
      });
    } else if (transaction_status === "pending") {
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT" },
        data: { status: "PENDING_PAYMENT" },
      });
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT" },
        data: { status: transaction_status === "expire" ? "EXPIRED" : "CANCELLED" },
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    const statusCode =
      typeof error === "object" && error && "statusCode" in error && typeof error.statusCode === "number"
        ? error.statusCode
        : 500;

    if (statusCode === 409) {
      const detail =
        typeof error === "object" && error && "detail" in error && typeof error.detail === "string"
          ? error.detail
          : "Stok produk tidak cukup";
      return NextResponse.json({ error: detail }, { status: 409 });
    }

    console.error("[POST /api/webhooks/midtrans]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}