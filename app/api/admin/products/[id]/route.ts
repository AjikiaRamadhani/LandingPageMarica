import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { supabaseAdmin } from "@/lib/supabase-admin";

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

    if (
      (price !== undefined && (!Number.isInteger(price) || price < 0)) ||
      (stock !== undefined && (!Number.isInteger(stock) || stock < 0))
    ) {
      return NextResponse.json({ error: "Harga dan stok harus berupa bilangan bulat valid" }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      // Kalau images dikirim ulang, replace semua secara atomik bersama update produk.
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }

      const updated = await tx.product.update({
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

      if (stock !== undefined && stock !== existing.stock) {
        await tx.inventoryMovement.create({
          data: {
            productId: id,
            type: "ADJUSTMENT",
            quantityDelta: stock - existing.stock,
            reason: "Admin stock adjustment",
            createdById: session.user.id,
          },
        });
      }

      return updated;
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
      include: { images: { select: { url: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    const storageFiles = new Map<string, string[]>();
    for (const image of existing.images) {
      const match = image.url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/);
      if (!match) continue;
      const bucketFiles = storageFiles.get(match[1]) ?? [];
      bucketFiles.push(decodeURIComponent(match[2]));
      storageFiles.set(match[1], bucketFiles);
    }
    await Promise.all(
      Array.from(storageFiles, async ([bucket, files]) => {
        const { error } = await supabaseAdmin.storage.from(bucket).remove(files);
        if (error) console.warn(`[DELETE product] Gagal menghapus file storage bucket ${bucket}`, error);
      }),
    );

    return NextResponse.json({ message: "Produk berhasil dihapus permanen" });
  } catch (error) {
    console.error("[DELETE /api/admin/products/[id]]", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Struktur database belum mendukung penghapusan produk yang memiliki riwayat transaksi. Jalankan migration terbaru terlebih dahulu.",
        },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
