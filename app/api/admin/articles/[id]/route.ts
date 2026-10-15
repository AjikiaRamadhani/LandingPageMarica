import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";
import { validateArticlePayload } from "@/lib/article-validation";

async function generateUniqueSlug(title: string, currentId: string) {
  const base = slugify(title) || "artikel";
  let slug = base;
  let counter = 1;

  while (await prisma.article.findFirst({ where: { slug, NOT: { id: currentId } } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

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
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
        productPlacements: {
          orderBy: { sortOrder: "asc" },
          include: { product: { select: { id: true, name: true, slug: true, price: true, isActive: true, images: { orderBy: { order: "asc" }, take: 1 } } } },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("[GET /api/admin/articles/[id]]", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
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
    const validation = validateArticlePayload(await request.json(), {
      requireTitleAndContent: false,
    });
    if (validation.error || !validation.data) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const { title, excerpt, content, coverImageUrl, videoUrl, videoProvider, videoDurationSeconds, isVideoFeatured, categoryId, status, publishedAt, productIds } = validation.data;

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    if (
      categoryId &&
      !(await prisma.articleCategory.findUnique({ where: { id: categoryId } }))
    ) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }
    if (
      productIds &&
      (await prisma.product.count({ where: { id: { in: productIds }, isActive: true } })) !== productIds.length
    ) {
      return NextResponse.json({ error: "Satu atau lebih produk tidak ditemukan atau tidak aktif" }, { status: 400 });
    }

    const nextStatus = status ?? existing.status;
    const nextPublishedAt =
      nextStatus === "PUBLISHED"
        ? publishedAt !== undefined
          ? publishedAt
            ? new Date(publishedAt)
            : new Date()
          : existing.publishedAt ?? new Date()
        : null;
    const nextSlug = title !== undefined && title !== existing.title
      ? await generateUniqueSlug(title, id)
      : undefined;

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(nextSlug !== undefined ? { slug: nextSlug } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
        ...(videoUrl !== undefined ? { videoUrl } : {}),
        ...(videoProvider !== undefined ? { videoProvider } : {}),
        ...(videoDurationSeconds !== undefined ? { videoDurationSeconds } : {}),
        ...(isVideoFeatured !== undefined ? { isVideoFeatured } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(status !== undefined ? { status } : {}),
        publishedAt: nextPublishedAt,
        ...(productIds !== undefined
          ? {
              productPlacements: {
                deleteMany: {},
                create: productIds.map((productId, sortOrder) => ({ productId, sortOrder })),
              },
            }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
        productPlacements: {
          orderBy: { sortOrder: "asc" },
          include: { product: { select: { id: true, name: true, slug: true, price: true, isActive: true, images: { orderBy: { order: "asc" }, take: 1 } } } },
        },
      },
    });

    return NextResponse.json(article);
  } catch (error: unknown) {
    console.error("[PUT /api/admin/articles/[id]]", error);
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "Slug artikel sudah digunakan, silakan coba lagi" }, { status: 409 });
    }
    return NextResponse.json({ error: "Gagal memperbarui artikel" }, { status: 500 });
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

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    await prisma.article.delete({ where: { id } });

    return NextResponse.json({ message: "Artikel berhasil dihapus" });
  } catch (error) {
    console.error("[DELETE /api/admin/articles/[id]]", error);
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}
