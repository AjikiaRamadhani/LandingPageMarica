import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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
    const { status } = (await request.json()) as { status?: string };

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: status as typeof VALID_STATUSES[number] as never },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("[PUT /api/admin/orders/[id]]", error);
    return NextResponse.json({ error: "Gagal update status pesanan" }, { status: 500 });
  }
}