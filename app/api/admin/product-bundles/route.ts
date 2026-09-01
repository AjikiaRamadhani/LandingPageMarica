import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bundles = await prisma.productBundle.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { id: true, name: true, price: true, slug: true },
            },
          },
        },
      },
    });

    return NextResponse.json(bundles);
  } catch (error) {
    console.error("[GET /api/admin/product-bundles]", error);
    return NextResponse.json({ error: "Failed to fetch bundles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, bundlePrice, productIds } = (await request.json()) as {
      name?: string;
      bundlePrice?: number;
      productIds?: string[];
    };

    if (!bundlePrice || !productIds || productIds.length < 2) {
      return NextResponse.json(
        { error: "Bundle butuh minimal 2 produk dan harga paket" },
        { status: 400 }
      );
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "Salah satu produk yang dipilih tidak ditemukan" },
        { status: 400 }
      );
    }

    const bundle = await prisma.productBundle.create({
      data: {
        name,
        bundlePrice,
        items: {
          create: productIds.map((productId, i) => ({ productId, order: i })),
        },
      },
      include: {
        items: { include: { product: true } },
      },
    });

    return NextResponse.json(bundle, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/product-bundles]", error);
    return NextResponse.json({ error: "Gagal membuat bundle" }, { status: 500 });
  }
}