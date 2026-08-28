import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
        author: { select: { id: true, name: true } },
        comments: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });

    if (!article || article.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    // Tambah view count - fire and forget, gak perlu nunggu biar response cepat
    prisma.article
      .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
      .catch((err: unknown) => console.error("Failed to increment views", err));

    return NextResponse.json(article);
  } catch (error) {
    console.error("[GET /api/articles/[slug]]", error);
    return NextResponse.json({ error: "Failed to fetch article" }, { status: 500 });
  }
}