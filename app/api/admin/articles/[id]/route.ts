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
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
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
    const body = await request.json();
    const { title, excerpt, content, coverImageUrl, categoryId, status, publishedAt } = body as {
      title?: string;
      excerpt?: string;
      content?: string;
      coverImageUrl?: string;
      categoryId?: string;
      status?: "DRAFT" | "PUBLISHED";
      publishedAt?: string;
    };

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Kalau baru pertama kali dipublish dan belum ada publishedAt, isi sekarang
    const shouldSetPublishedAt =
      status === "PUBLISHED" && !existing.publishedAt;

    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(excerpt !== undefined ? { excerpt } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(coverImageUrl !== undefined ? { coverImageUrl } : {}),
        ...(categoryId !== undefined ? { categoryId } : {}),
        ...(status !== undefined ? { status } : {}),
        publishedAt: shouldSetPublishedAt
          ? new Date(publishedAt ?? Date.now())
          : publishedAt !== undefined
            ? new Date(publishedAt)
            : undefined,
      },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
      },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error("[PUT /api/admin/articles/[id]]", error);
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