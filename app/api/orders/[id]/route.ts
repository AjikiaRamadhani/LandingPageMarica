import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order || (order.userId !== session.user.id && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[GET /api/orders/[id]]", error);
    return NextResponse.json({ error: "Gagal mengambil detail pesanan" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { action?: string };
    if (body.action !== "cancel") {
      return NextResponse.json({ error: "Aksi pesanan tidak valid" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    if (order.status !== "PENDING_PAYMENT") {
      return NextResponse.json(
        { error: "Pesanan hanya bisa dibatalkan sebelum pembayaran dan proses dimulai" },
        { status: 409 },
      );
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { status: "CANCELLED" },
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/orders/[id]]", error);
    return NextResponse.json({ error: "Gagal membatalkan pesanan" }, { status: 500 });
  }
}