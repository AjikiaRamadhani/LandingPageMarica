import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

async function getOwnedOrder(orderId: string, userId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true },
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOwnedOrder(id, session.user.id);
  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  const reviews = await prisma.productReview.findMany({
    where: { orderId: id, userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      productId: true,
      rating: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ reviews });
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      productId?: unknown;
      rating?: unknown;
      comment?: unknown;
    };
    const productId = typeof body.productId === "string" ? body.productId.trim() : "";
    const rating = typeof body.rating === "number" ? body.rating : Number(body.rating);
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!productId || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Produk dan rating 1 sampai 5 wajib diisi" }, { status: 400 });
    }
    if (comment.length > 1000) {
      return NextResponse.json({ error: "Ulasan maksimal 1000 karakter" }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: session.user.id },
      include: { items: { where: { productId }, select: { productId: true } } },
    });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }
    if (order.status !== "DELIVERED") {
      return NextResponse.json({ error: "Ulasan tersedia setelah barang diterima" }, { status: 409 });
    }
    if (order.items.length === 0) {
      return NextResponse.json({ error: "Produk tidak ada dalam pesanan ini" }, { status: 400 });
    }

    const review = await prisma.productReview.create({
      data: {
        userId: session.user.id,
        productId,
        orderId: id,
        rating,
        comment: comment || null,
      },
      select: {
        id: true,
        productId: true,
        rating: true,
        comment: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const aggregate = await prisma.productReview.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    const ratingAvg = aggregate._avg.rating ?? 0;
    const reviewCount = aggregate._count._all;
    await prisma.product.update({
      where: { id: productId },
      data: { ratingAvg, reviewCount },
    });

    return NextResponse.json({ review, product: { ratingAvg, reviewCount } }, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Produk ini sudah kamu beri ulasan untuk pesanan tersebut" }, { status: 409 });
    }
    console.error("[POST /api/orders/[id]/reviews]", error);
    return NextResponse.json({ error: "Gagal menyimpan ulasan" }, { status: 500 });
  }
}
