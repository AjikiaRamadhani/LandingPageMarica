import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

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
    const { name, imageUrl, colorTag, parentId } = (await request.json()) as {
      name?: string;
      imageUrl?: string;
      colorTag?: string;
      parentId?: string | null;
    };

    const existing = await prisma.productCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (parentId === id) {
      return NextResponse.json(
        { error: "Kategori tidak bisa jadi induk dari dirinya sendiri" },
        { status: 400 }
      );
    }

    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      const base = slugify(name.trim());
      slug = base;
      let counter = 1;
      while (
        await prisma.productCategory.findFirst({ where: { slug, NOT: { id } } })
      ) {
        counter += 1;
        slug = `${base}-${counter}`;
      }
    }

    const category = await prisma.productCategory.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim(), slug } : {}),
        ...(imageUrl !== undefined ? { imageUrl } : {}),
        ...(colorTag !== undefined ? { colorTag } : {}),
        ...(parentId !== undefined ? { parentId } : {}),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[PUT /api/admin/product-categories/[id]]", error);
    return NextResponse.json({ error: "Gagal memperbarui kategori" }, { status: 500 });
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

    const existing = await prisma.productCategory.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (existing._count.products > 0) {
      return NextResponse.json(
        { error: `Kategori masih dipakai di ${existing._count.products} produk.` },
        { status: 409 }
      );
    }

    if (existing._count.children > 0) {
      return NextResponse.json(
        { error: `Kategori ini masih punya ${existing._count.children} sub-kategori. Hapus sub-kategorinya dulu.` },
        { status: 409 }
      );
    }

    await prisma.productCategory.delete({ where: { id } });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/admin/product-categories/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}