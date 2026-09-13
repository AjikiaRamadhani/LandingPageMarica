import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";

const movementTypes = ["PURCHASE", "ADJUSTMENT", "RETURN", "RESERVATION", "RELEASE"] as const;

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 25)));
    const productId = searchParams.get("productId")?.trim() || undefined;
    const type = searchParams.get("type")?.trim() || undefined;

    const where = {
      ...(productId ? { productId } : {}),
      ...(type && movementTypes.includes(type as (typeof movementTypes)[number])
        ? { type: type as (typeof movementTypes)[number] }
        : {}),
    };

    const [movements, total, totalProducts, stockAggregate, lowStockCount, outOfStockCount, lowStockProducts] = await Promise.all([
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          product: { select: { id: true, name: true, sku: true, stock: true } },
          order: { select: { id: true, orderNumber: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.inventoryMovement.count({ where }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.aggregate({ where: { isActive: true }, _sum: { stock: true } }),
      prisma.product.count({ where: { isActive: true, stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { isActive: true, stock: 0 } }),
      prisma.product.findMany({
        where: { isActive: true, stock: { lte: 10 } },
        orderBy: [{ stock: "asc" }, { name: "asc" }],
        take: 10,
        select: { id: true, name: true, sku: true, stock: true, price: true },
      }),
    ]);

    const totalStock = stockAggregate._sum.stock ?? 0;

    return NextResponse.json({
      movements,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        totalProducts,
        totalStock,
        reservedStock: 0,
        availableStock: totalStock,
        lowStockCount,
        outOfStockCount,
        lowStockProducts,
        reservationSupported: false,
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/inventory]", error);
    return NextResponse.json({ error: "Gagal mengambil riwayat inventory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      productId?: string;
      quantityDelta?: number;
      type?: string;
      reason?: string;
      referenceId?: string;
    };

    const productIdCheck = validateText(body.productId, "productId", 100);
    const quantityCheck = validateInteger(body.quantityDelta, "quantityDelta", -2147483647);
    const reasonCheck = validateOptionalText(body.reason, "Alasan", 240);
    const referenceCheck = validateOptionalText(body.referenceId, "Reference ID", 120);

    if (
      productIdCheck.error ||
      quantityCheck.error ||
      reasonCheck.error ||
      referenceCheck.error ||
      typeof productIdCheck.value !== "string" ||
      typeof quantityCheck.value !== "number" ||
      quantityCheck.value === 0 ||
      (reasonCheck.value !== null && typeof reasonCheck.value !== "string") ||
      (referenceCheck.value !== null && typeof referenceCheck.value !== "string") ||
      !movementTypes.includes(body.type as (typeof movementTypes)[number])
    ) {
      return NextResponse.json(
        { error: "productId, quantityDelta non-zero, type, dan data pendukung wajib valid" },
        { status: 400 },
      );
    }

    const productId = productIdCheck.value;
    const quantityDelta = quantityCheck.value;
    const type = body.type as (typeof movementTypes)[number];

    const movement = await prisma.$transaction(async (tx) => {
      const product = await tx.$queryRaw<Array<{ id: string; stock: number }>>`
        SELECT id, stock
        FROM "products"
        WHERE id = ${productId}
        FOR UPDATE
      `;

      if (product.length === 0) throw new Error("PRODUCT_NOT_FOUND");
      const nextStock = product[0].stock + quantityDelta;
      if (nextStock < 0) throw new Error("STOCK_WOULD_BE_NEGATIVE");

      await tx.product.update({
        where: { id: productId },
        data: { stock: nextStock },
      });

      return tx.inventoryMovement.create({
        data: {
          productId,
          type,
          quantityDelta,
          reason: reasonCheck.value,
          referenceId: referenceCheck.value,
          createdById: session.user.id,
        },
        include: { product: { select: { id: true, name: true, stock: true } } },
      });
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "STOCK_WOULD_BE_NEGATIVE") {
      return NextResponse.json({ error: "Stok tidak boleh menjadi negatif" }, { status: 409 });
    }
    console.error("[POST /api/admin/inventory]", error);
    return NextResponse.json({ error: "Gagal mengubah inventory" }, { status: 500 });
  }
}
