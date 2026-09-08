import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

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

    const order = await prisma.order.findUnique({
      where: { midtransOrderId: order_id },
      include: { items: true },
    });

    if (!order) {
      console.error("[Midtrans webhook] Order not found:", order_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (transaction_status === "capture" || transaction_status === "settlement") {
      // Pembayaran sukses - update status, kurangin stok, tambah soldCount
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            status: "PAID",
            midtransTransactionId: transaction_id,
            paidAt: new Date(),
          },
        }),
        ...order.items.map((item) =>
          prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
              soldCount: { increment: item.quantity },
            },
          })
        ),
      ]);
    } else if (transaction_status === "pending") {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PENDING_PAYMENT" },
      });
    } else if (
      transaction_status === "deny" ||
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: transaction_status === "expire" ? "EXPIRED" : "CANCELLED" },
      });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[POST /api/webhooks/midtrans]", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}