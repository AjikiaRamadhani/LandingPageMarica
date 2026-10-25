import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get("limit") ?? 20);
  const requestedPage = Number(url.searchParams.get("page") ?? 1);
  const limit = Number.isInteger(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 50) : 20;
  const page = Number.isInteger(requestedPage) ? Math.max(requestedPage, 1) : 1;

  const product = await prisma.product.findFirst({
    where: { OR: [{ id: slug }, { slug }] },
    select: { id: true },
  });
  if (!product) return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });

  const where = { productId: product.id };
  const [reviews, total] = await Promise.all([
    prisma.productReview.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.productReview.count({ where }),
  ]);

  return NextResponse.json({
    reviews: reviews.map((review) => ({
      ...review,
      user: { name: review.user.name || "Pelanggan Marica" },
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}
