import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { slugify } from "@/lib/slugify";

async function generateUniqueSlug(name: string) {
  const base = slugify(name);
  let slug = base;
  let counter = 1;

  while (await prisma.product.findUnique({ where: { slug } })) {
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
    const search = searchParams.get("search");
    const categorySlug = searchParams.get("category");

    const where = {
      ...(categorySlug && categorySlug !== "semua" ? { category: { slug: categorySlug } } : {}),
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("[GET /api/admin/products]", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
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
      categoryId,
      images, // [{ url, isVideo }]
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
      categoryId?: string;
      images?: { url: string; isVideo?: boolean }[];
    };

    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { error: "Nama, deskripsi, dan harga wajib diisi" },
        { status: 400 }
      );
    }

    const slug = await generateUniqueSlug(name);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        highlights: highlights ?? [],
        price,
        compareAtPrice,
        stock: stock ?? 0,
        sku,
        ageMin,
        ageMax,
        skillFocus: skillFocus ?? [],
        playerCount,
        isBestSeller: isBestSeller ?? false,
        isFeatured: isFeatured ?? false,
        categoryId,
        images: images
          ? {
              create: images.map((img, i) => ({
                url: img.url,
                isVideo: img.isVideo ?? false,
                order: i,
              })),
            }
          : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/products]", error);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}