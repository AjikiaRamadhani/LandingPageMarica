import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

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
    const { name, bundlePrice, productIds, isActive } = (await request.json()) as {
      name?: string;
      bundlePrice?: number;
      productIds?: string[];
      isActive?: boolean;
    };

    const existing = await prisma.productBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bundle tidak ditemukan" }, { status: 404 });
    }

    if (productIds && productIds.length < 2) {
      return NextResponse.json({ error: "Bundle butuh minimal 2 produk" }, { status: 400 });
    }

    // Kalau productIds dikirim ulang, replace semua item lama
    if (productIds) {
      await prisma.productBundleItem.deleteMany({ where: { bundleId: id } });
    }

    const bundle = await prisma.productBundle.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(bundlePrice !== undefined ? { bundlePrice } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(productIds
          ? {
              items: {
                create: productIds.map((productId, i) => ({ productId, order: i })),
              },
            }
          : {}),
      },
      include: { items: { include: { product: true } } },
    });

    return NextResponse.json(bundle);
  } catch (error) {
    console.error("[PUT /api/admin/product-bundles/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui bundle" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.productBundle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Bundle tidak ditemukan" }, { status: 404 });
    }

    await prisma.productBundle.delete({ where: { id } });

    return NextResponse.json({ message: "Bundle berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/admin/product-bundles/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus bundle" }, { status: 500 });
  }
}