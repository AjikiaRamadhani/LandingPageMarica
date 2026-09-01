import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: { orderBy: { order: "asc" } },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        bundleItems: {
          include: {
            bundle: {
              include: {
                items: {
                  include: {
                    product: {
                      include: { images: { orderBy: { order: "asc" }, take: 1 } },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!product || !product.isActive) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Susun ulang data bundle biar gampang dipakai di frontend:
    // setiap bundle nampilin produk LAIN (bukan produk ini sendiri) + total harga & hematnya
    const bundles = product.bundleItems.map(({ bundle }) => {
      const otherItems = bundle.items.filter((item) => item.product.slug !== slug);
      const originalTotal = bundle.items.reduce((sum, item) => sum + item.product.price, 0);
      const savings = originalTotal - bundle.bundlePrice;

      return {
        id: bundle.id,
        name: bundle.name,
        bundlePrice: bundle.bundlePrice,
        savings,
        otherProducts: otherItems.map((item) => item.product),
      };
    });

    const { bundleItems, ...productData } = product;

    return NextResponse.json({ ...productData, bundles });
  } catch (error) {
    console.error("[GET /api/products/[slug]]", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}