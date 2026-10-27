import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { sendOrderExpiredEmailIfNeeded } from "@/lib/order-mailer";
import { settleOrderPayment } from "@/lib/settle-order-payment";

const VALID_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "EXPIRED",
];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status, trackingNumber, shippingCourier, fulfillmentNote } = (await request.json()) as { status?: string; trackingNumber?: string | null; shippingCourier?: string | null; fulfillmentNote?: string | null };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    if (!existing) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const nextStatus = status as typeof VALID_STATUSES[number];
    const allowedTransitions: Record<string, string[]> = {
      PENDING_PAYMENT: ["PAID", "CANCELLED", "EXPIRED"],
      PAID: ["PROCESSING", "CANCELLED"],
      PROCESSING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
      EXPIRED: [],
    };
    if (existing.status !== nextStatus && !allowedTransitions[existing.status]?.includes(nextStatus)) {
      return NextResponse.json({ error: `Pesanan dari status ${existing.status} tidak bisa diubah menjadi ${nextStatus}` }, { status: 409 });
    }

    if (nextStatus === "PAID" && existing.status === "PENDING_PAYMENT") {
      await settleOrderPayment(existing, `MANUAL-${existing.orderNumber}`);
      const settled = await prisma.order.findUnique({ where: { id }, include: { items: true } });
      if (!settled || settled.status !== "PAID") {
        return NextResponse.json({ error: "Pesanan gagal diselesaikan dan stok belum dapat dikurangi" }, { status: 409 });
      }
      return NextResponse.json(settled);
    }

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: nextStatus as never,
        ...(status === "PROCESSING" && !existing.processingAt ? { processingAt: new Date() } : {}),
        ...(status === "SHIPPED" && !existing.shippedAt ? { shippedAt: new Date() } : {}),
        ...(status === "DELIVERED" && !existing.deliveredAt ? { deliveredAt: new Date() } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
        ...(shippingCourier !== undefined ? { shippingCourier } : {}),
        ...(fulfillmentNote !== undefined ? { fulfillmentNote } : {}),
      },
      include: { items: true },
    });

    if (order.status === "EXPIRED") {
      await sendOrderExpiredEmailIfNeeded(order.id);
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[PUT /api/admin/orders/[id]]", error);
    if (error instanceof Error && ["STOCK_SHORTAGE", "PRODUCT_UNAVAILABLE"].includes(error.message)) {
      return NextResponse.json({ error: "Stok produk tidak mencukupi untuk menandai pesanan sebagai dibayar" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal update status pesanan" }, { status: 500 });
  }
}
