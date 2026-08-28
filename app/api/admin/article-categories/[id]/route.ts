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
    const { name, colorTag } = (await request.json()) as {
      name?: string;
      colorTag?: string;
    };

    const existing = await prisma.articleCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (name && name.trim().length === 0) {
      return NextResponse.json({ error: "Nama kategori tidak boleh kosong" }, { status: 400 });
    }

    // Kalau nama diganti, cek gak bentrok sama kategori lain + regenerate slug
    let slug = existing.slug;
    if (name && name.trim() !== existing.name) {
      const nameClash = await prisma.articleCategory.findUnique({ where: { name: name.trim() } });
      if (nameClash && nameClash.id !== id) {
        return NextResponse.json({ error: "Nama kategori sudah dipakai" }, { status: 409 });
      }

      const base = slugify(name.trim());
      slug = base;
      let counter = 1;
      while (
        await prisma.articleCategory.findFirst({
          where: { slug, NOT: { id } },
        })
      ) {
        counter += 1;
        slug = `${base}-${counter}`;
      }
    }

    const category = await prisma.articleCategory.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim(), slug } : {}),
        ...(colorTag !== undefined ? { colorTag } : {}),
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[PUT /api/admin/article-categories/[id]]", error);
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

    const existing = await prisma.articleCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }

    if (existing._count.articles > 0) {
      return NextResponse.json(
        {
          error: `Kategori masih dipakai di ${existing._count.articles} artikel. Pindahkan artikel-artikel itu ke kategori lain dulu sebelum menghapus.`,
        },
        { status: 409 }
      );
    }

    await prisma.articleCategory.delete({ where: { id } });

    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/admin/article-categories/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus kategori" }, { status: 500 });
  }
}