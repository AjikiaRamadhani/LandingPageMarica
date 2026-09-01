import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Ambil kategori induk (parentId null) beserta anak-anaknya nested
    const categories = await prisma.productCategory.findMany({
      where: { parentId: null, isActive: true },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[GET /api/product-categories]", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}