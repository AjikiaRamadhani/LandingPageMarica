import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

async function generateUniqueSlug(title: string) {
  const base = slugify(title);
  let slug = base;
  let counter = 1;

  while (await prisma.article.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

export async function GET(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? 10));
    const status = searchParams.get("status"); // DRAFT | PUBLISHED
    const categorySlug = searchParams.get("category");
    const search = searchParams.get("search");

    const where = {
      ...(status ? { status: status as "DRAFT" | "PUBLISHED" } : {}),
      ...(categorySlug && categorySlug !== "semua" ? { category: { slug: categorySlug } } : {}),
      ...(search
        ? { title: { contains: search, mode: "insensitive" as const } }
        : {}),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true, colorTag: true } },
          author: { select: { id: true, name: true } },
        },
      }),
      prisma.article.count({ where }),
    ]);

    return NextResponse.json({
      articles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/articles]", error);
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImageUrl,
      categoryId,
      status,
      publishedAt,
    } = body as {
      title?: string;
      excerpt?: string;
      content?: string;
      coverImageUrl?: string;
      categoryId?: string;
      status?: "DRAFT" | "PUBLISHED";
      publishedAt?: string;
    };

    if (!title || !content) {
      return NextResponse.json({ error: "Judul dan konten wajib diisi" }, { status: 400 });
    }

    const slug = await generateUniqueSlug(title);
    const finalStatus = status ?? "DRAFT";

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImageUrl,
        categoryId,
        status: finalStatus,
        publishedAt: finalStatus === "PUBLISHED" ? new Date(publishedAt ?? Date.now()) : null,
        authorId: session.user.id,
      },
      include: {
        category: { select: { id: true, name: true, slug: true, colorTag: true } },
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/articles]", error);
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}