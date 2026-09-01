import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { order: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("[GET /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

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
    const body = await request.json();
    const {
      name,
      description,
      highlights,
      price,
      compareAtPrice,
      stock,
      sku,
      ageMin,
      ageMax,
      skillFocus,
      playerCount,
      isBestSeller,
      isFeatured,
      isActive,
      categoryId,
      images,
    } = body as {
      name?: string;
      description?: string;
      highlights?: string[];
      price?: number;
      compareAtPrice?: number;
      stock?: number;
      sku?: string;
      ageMin?: number;
      ageMax?: number;
      skillFocus?: string[];
      playerCount?: string;
      isBestSeller?: boolean;
      isFeatured?: boolean;
      isActive?: boolean;
      categoryId?: string;
      images?: { url: string; isVideo?: boolean }[];
    };

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Kalau images dikirim ulang, kita replace semua (hapus lama, buat baru)
    // -- lebih simpel & aman daripada nyoba diff satu-satu
    if (images) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(highlights !== undefined ? { highlights } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(compareAtPrice !== undefined ? { compareAtPrice } : {}),
        ...(stock !== undefined ? { stock } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(ageMin !== undefined ? { ageMin } : {}),
        ...(ageMax !== undefined ? { ageMax } : {}),
        ...(skillFocus !== undefined ? { skillFocus } : {}),
        ...(playerCount !== undefined ? { playerCount } : {}),
        ...(isBestSeller !== undefined ? { isBestSeller } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(images
          ? {
              images: {
                create: images.map((img, i) => ({
                  url: img.url,
                  isVideo: img.isVideo ?? false,
                  order: i,
                })),
              },
            }
          : {}),
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("[PUT /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
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

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { bundleItems: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    if (existing.bundleItems.length > 0) {
      return NextResponse.json(
        {
          error: `Produk ini masih dipakai di ${existing.bundleItems.length} paket bundle. Hapus dulu dari bundle-nya sebelum menghapus produk.`,
        },
        { status: 409 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}