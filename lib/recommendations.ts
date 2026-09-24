import { prisma } from '@/lib/prisma';

export type RecommendedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  soldCount: number;
  ageMin: number | null;
  ageMax: number | null;
  skillFocus: string[];
  playerCount: string | null;
  isBestSeller: boolean;
  description: string;
  images: { id: string; url: string; isVideo: boolean }[];
  category: { id: string; name: string; slug: string } | null;
};

/**
 * Mengembalikan produk rekomendasi berdasarkan:
 *  1. Kategori yang sama
 *  2. skillFocus yang overlap
 * Produk itu sendiri dikecualikan.
 * Diurutkan berdasarkan soldCount DESC, createdAt DESC.
 */
export async function getRecommendations(
  productId: string,
  limit = 5,
): Promise<RecommendedProduct[]> {
  const base = await prisma.product.findUnique({
    where: { id: productId },
    select: { categoryId: true, skillFocus: true },
  });

  if (!base) throw new Error('Product not found');

  const orCriteria: object[] = [];

  if (base.categoryId) {
    orCriteria.push({ categoryId: base.categoryId });
  }

  if (Array.isArray(base.skillFocus) && base.skillFocus.length > 0) {
    orCriteria.push({ skillFocus: { hasSome: base.skillFocus as string[] } });
  }

  const products = await prisma.product.findMany({
    where: {
      id: { not: productId },
      isActive: true,
      ...(orCriteria.length > 0 ? { OR: orCriteria } : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      compareAtPrice: true,
      stock: true,
      soldCount: true,
      ageMin: true,
      ageMax: true,
      skillFocus: true,
      playerCount: true,
      isBestSeller: true,
      description: true,
      images: {
        select: { id: true, url: true, isVideo: true },
        orderBy: { order: 'asc' },
        take: 1,
      },
      category: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: [{ soldCount: 'desc' }, { createdAt: 'desc' }],
    take: limit,
  });

  return products as unknown as RecommendedProduct[];
}
