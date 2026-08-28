import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

async function generateUniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (await prisma.articleCategory.findUnique({ where: { slug } })) {
    counter += 1;
    slug = `${base}-${counter}`;
  }

  return slug;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await prisma.articleCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/admin/article-categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, colorTag } = (await request.json()) as {
      name?: string;
      colorTag?: string;
    };

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.articleCategory.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ error: "Nama kategori sudah dipakai" }, { status: 409 });
    }

    const slug = await generateUniqueSlug(name);

    const category = await prisma.articleCategory.create({
      data: { name: name.trim(), slug, colorTag },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/article-categories]", error);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}