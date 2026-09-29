import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const params = new URL(request.url).searchParams;
    const limit = Math.min(50, Math.max(1, Number(params.get("limit") ?? 50)));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where: { isActive: true } }),
    ]);

    return NextResponse.json(
      {
        products,
        pagination: {
          page: 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[GET /api/cashier/products]", error);
    return NextResponse.json(
      { error: "Gagal mengambil katalog produk kasir" },
      { status: 500 },
    );
  }
}
