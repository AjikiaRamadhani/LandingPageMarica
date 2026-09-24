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
  isFeatured: boolean;
  description: string;
  ratingAvg: number;
  reviewCount: number;
  images: { id: string; url: string; isVideo: boolean; order: number }[];
  category: { id: string; name: string; slug: string } | null;
};

type RecommendationBase = {
  categoryId: string | null;
  skillFocus: string[];
  ageMin: number | null;
  ageMax: number | null;
};

type RankedProduct = RecommendedProduct & {
  createdAt: Date;
};

const recommendationSelect = {
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
  isFeatured: true,
  description: true,
  ratingAvg: true,
  reviewCount: true,
  createdAt: true,
  images: {
    select: { id: true, url: true, isVideo: true, order: true },
    orderBy: { order: 'asc' as const },
    take: 1,
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
} as const;

function rangesOverlap(
  firstMin: number | null,
  firstMax: number | null,
  secondMin: number | null,
  secondMax: number | null,
): boolean {
  const normalizedFirstMin = firstMin ?? Number.NEGATIVE_INFINITY;
  const normalizedFirstMax = firstMax ?? Number.POSITIVE_INFINITY;
  const normalizedSecondMin = secondMin ?? Number.NEGATIVE_INFINITY;
  const normalizedSecondMax = secondMax ?? Number.POSITIVE_INFINITY;

  return (
    normalizedFirstMin <= normalizedSecondMax &&
    normalizedSecondMin <= normalizedFirstMax
  );
}

function getSkillOverlap(baseSkills: string[], candidateSkills: string[]) {
  const candidateSkillSet = new Set(candidateSkills);
  return baseSkills.filter((skill) => candidateSkillSet.has(skill)).length;
}

function scoreProduct(
  base: RecommendationBase & { price: number },
  candidate: RankedProduct,
): number {
  let score = 0;

  if (base.categoryId && candidate.category?.id === base.categoryId) {
    score += 45;
  }

  const skillOverlap = getSkillOverlap(base.skillFocus, candidate.skillFocus);
  score += Math.min(skillOverlap * 18, 36);

  if (
    (base.ageMin !== null || base.ageMax !== null) &&
    rangesOverlap(base.ageMin, base.ageMax, candidate.ageMin, candidate.ageMax)
  ) {
    score += 22;
  }

  if (base.price > 0 && candidate.price > 0) {
    const priceDistance =
      Math.abs(base.price - candidate.price) / Math.max(base.price, candidate.price);
    score += Math.round(Math.max(0, 10 * (1 - priceDistance)));
  }

  // Availability and editorial signals are useful tie breakers, but should
  // never outweigh a meaningful category/skill match.
  if (candidate.stock > 0) score += 8;
  if (candidate.isBestSeller) score += 5;
  if (candidate.isFeatured) score += 4;
  score += Math.min(candidate.ratingAvg, 5);

  return score;
}

/**
 * Mengembalikan produk aktif yang paling relevan dengan produk yang sedang
 * dilihat. Ranking mengutamakan kecocokan kategori, skill, dan usia, lalu
 * memakai harga, stok, rating, serta sinyal editorial sebagai pelengkap.
 */
export async function getRecommendations(
  productId: string,
  limit = 5,
): Promise<RecommendedProduct[]> {
  const base = await prisma.product.findUnique({
    where: { id: productId, isActive: true },
    select: {
      categoryId: true,
      skillFocus: true,
      ageMin: true,
      ageMax: true,
      price: true,
    },
  });

  if (!base) throw new Error('Product not found');

  const safeLimit = Math.min(Math.max(Math.floor(limit) || 5, 1), 12);
  const orCriteria: object[] = [];

  if (base.categoryId) {
    orCriteria.push({ categoryId: base.categoryId });
  }

  if (Array.isArray(base.skillFocus) && base.skillFocus.length > 0) {
    orCriteria.push({ skillFocus: { hasSome: base.skillFocus as string[] } });
  }

  const candidateSelect = recommendationSelect;
  const candidateWhere = {
    id: { not: productId },
    isActive: true,
    ...(orCriteria.length > 0 ? { OR: orCriteria } : {}),
  };

  let candidates = (await prisma.product.findMany({
    where: candidateWhere,
    select: candidateSelect,
    orderBy: [{ stock: 'desc' }, { soldCount: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })) as RankedProduct[];

  // If the matching pool is too small, fill the remaining slots with active
  // products so the section does not disappear for sparse catalogs.
  if (candidates.length < safeLimit && orCriteria.length > 0) {
    const candidateIds = candidates.map((candidate) => candidate.id);
    const fallbackCandidates = (await prisma.product.findMany({
      where: {
        id: { notIn: [productId, ...candidateIds] },
        isActive: true,
      },
      select: candidateSelect,
      orderBy: [{ stock: 'desc' }, { soldCount: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })) as RankedProduct[];

    candidates = [...candidates, ...fallbackCandidates];
  }

  return candidates
    .map((candidate) => ({
      candidate,
      score: scoreProduct(base, candidate),
    }))
    .sort(
      (first, second) =>
        second.score - first.score ||
        Number(second.candidate.stock > 0) - Number(first.candidate.stock > 0) ||
        second.candidate.soldCount - first.candidate.soldCount ||
        second.candidate.createdAt.getTime() - first.candidate.createdAt.getTime(),
    )
    .slice(0, safeLimit)
    .map(({ candidate }) => {
      const { createdAt, ...product } = candidate;
      void createdAt;
      return product;
    });
}
