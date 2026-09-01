import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

async function generateUniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (await prisma.productCategory.findUnique({ where: { slug } })) {
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
    const categories = await prisma.productCategory.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/admin/product-categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, imageUrl, colorTag, parentId } = (await request.json()) as {
      name?: string;
      imageUrl?: string;
      colorTag?: string;
      parentId?: string;
    };

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Nama kategori wajib diisi" }, { status: 400 });
    }

    if (parentId) {
      const parent = await prisma.productCategory.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Kategori induk tidak ditemukan" }, { status: 400 });
      }
    }

    const slug = await generateUniqueSlug(name);

    const category = await prisma.productCategory.create({
      data: { name: name.trim(), slug, imageUrl, colorTag, parentId },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/product-categories]", error);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}