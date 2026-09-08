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