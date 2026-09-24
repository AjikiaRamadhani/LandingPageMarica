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

export type RecommendationIdentity = {
  userId?: string | null;
  sessionId?: string | null;
};

type RecommendationBase = {
  categoryId: string | null;
  skillFocus: string[];
  ageMin: number | null;
  ageMax: number | null;
  price: number;
};

type RankedProduct = RecommendedProduct & {
  createdAt: Date;
};

type RecommendationEventType = 'VIEW' | 'CLICK' | 'CART' | 'PURCHASE';

const EVENT_TYPES: RecommendationEventType[] = [
  'VIEW',
  'CLICK',
  'CART',
  'PURCHASE',
];

const EVENT_WEIGHTS: Record<RecommendationEventType, number> = {
  VIEW: 1,
  CLICK: 2,
  CART: 4,
  PURCHASE: 7,
};

const EVENT_LOOKBACK_DAYS = 90;

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

function scoreContentMatch(
  base: RecommendationBase,
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

  if (candidate.stock > 0) score += 8;
  if (candidate.isBestSeller) score += 5;
  if (candidate.isFeatured) score += 4;
  score += Math.min(candidate.ratingAvg, 5);

  return score;
}

function getSinceDate() {
  const since = new Date();
  since.setDate(since.getDate() - EVENT_LOOKBACK_DAYS);
  return since;
}

function getIdentityWhere(identity: RecommendationIdentity) {
  if (identity.userId) return { userId: identity.userId };
  if (identity.sessionId) {
    return { userId: null, sessionId: identity.sessionId };
  }
  return null;
}

/**
 * Item-to-item collaborative filtering using implicit feedback. Users/sessions
 * are considered neighbors when they interacted with the same products. Their
 * interactions on other products become collaborative recommendation signals.
 */
async function getCollaborativeScores(
  identity: RecommendationIdentity,
  excludedProductId: string,
): Promise<Map<string, number>> {
  const identityWhere = getIdentityWhere(identity);
  if (!identityWhere) return new Map();

  const since = getSinceDate();
  const ownEvents = await prisma.recommendationEvent.findMany({
    where: {
      ...identityWhere,
      type: { in: EVENT_TYPES },
      createdAt: { gte: since },
    },
    select: { productId: true, type: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const seenProductIds = [
    ...new Set([excludedProductId, ...ownEvents.map((event) => event.productId)]),
  ];
  const interactedProductIds = [...new Set(ownEvents.map((event) => event.productId))];
  if (interactedProductIds.length === 0) return new Map();

  const neighborIdentityWhere = identity.userId
    ? {
        AND: [
          { userId: { not: identity.userId } },
          { userId: { not: null } },
        ],
      }
    : {
        AND: [
          { userId: null },
          { sessionId: { not: identity.sessionId } },
          { sessionId: { not: null } },
        ],
      };

  const neighborEvents = await prisma.recommendationEvent.findMany({
    where: {
      ...neighborIdentityWhere,
      productId: { in: interactedProductIds },
      type: { in: EVENT_TYPES },
      createdAt: { gte: since },
    },
    select: { userId: true, sessionId: true, productId: true, type: true },
    take: 5000,
  });

  const neighborScores = new Map<string, number>();
  for (const event of neighborEvents) {
    const neighborId = event.userId ?? event.sessionId;
    if (!neighborId) continue;

    neighborScores.set(
      neighborId,
      (neighborScores.get(neighborId) ?? 0) +
        EVENT_WEIGHTS[event.type as RecommendationEventType],
    );
  }

  const topNeighbors = [...neighborScores.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 40);
  if (topNeighbors.length === 0) return new Map();

  const neighborIds = topNeighbors.map(([neighborId]) => neighborId);
  const similarityByNeighbor = new Map(topNeighbors);
  const candidateOwnerWhere = identity.userId
    ? { userId: { in: neighborIds } }
    : { userId: null, sessionId: { in: neighborIds } };

  const candidateEvents = await prisma.recommendationEvent.findMany({
    where: {
      ...candidateOwnerWhere,
      productId: { notIn: seenProductIds },
      type: { in: EVENT_TYPES },
      createdAt: { gte: since },
    },
    select: { userId: true, sessionId: true, productId: true, type: true, createdAt: true },
    take: 5000,
  });

  const productScores = new Map<string, number>();
  for (const event of candidateEvents) {
    const neighborId = event.userId ?? event.sessionId;
    const similarity = neighborId ? similarityByNeighbor.get(neighborId) : 0;
    if (!similarity) continue;

    const ageInDays = (Date.now() - event.createdAt.getTime()) / 86_400_000;
    const recencyFactor = Math.max(0.35, 1 - ageInDays / EVENT_LOOKBACK_DAYS);
    const score =
      similarity *
      EVENT_WEIGHTS[event.type as RecommendationEventType] *
      recencyFactor;

    productScores.set(
      event.productId,
      (productScores.get(event.productId) ?? 0) + score,
    );
  }

  return productScores;
}

async function getContentCandidates(
  base: RecommendationBase,
  productId: string,
  safeLimit: number,
) {
  const orCriteria: object[] = [];

  if (base.categoryId) {
    orCriteria.push({ categoryId: base.categoryId });
  }

  if (base.skillFocus.length > 0) {
    orCriteria.push({ skillFocus: { hasSome: base.skillFocus } });
  }

  const candidateWhere = {
    id: { not: productId },
    isActive: true,
    ...(orCriteria.length > 0 ? { OR: orCriteria } : {}),
  };

  let candidates = (await prisma.product.findMany({
    where: candidateWhere,
    select: recommendationSelect,
    orderBy: [{ stock: 'desc' }, { soldCount: 'desc' }, { createdAt: 'desc' }],
    take: 100,
  })) as RankedProduct[];

  if (candidates.length < safeLimit && orCriteria.length > 0) {
    const candidateIds = candidates.map((candidate) => candidate.id);
    const fallbackCandidates = (await prisma.product.findMany({
      where: {
        id: { notIn: [productId, ...candidateIds] },
        isActive: true,
      },
      select: recommendationSelect,
      orderBy: [{ stock: 'desc' }, { soldCount: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    })) as RankedProduct[];

    candidates = [...candidates, ...fallbackCandidates];
  }

  return candidates;
}

/**
 * Hybrid recommendation: collaborative item-to-item signals are combined
 * with content similarity, so new users still receive useful results.
 */
export async function getRecommendations(
  productId: string,
  limit = 5,
  identity: RecommendationIdentity = {},
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
  const [contentCandidates, collaborativeScores] = await Promise.all([
    getContentCandidates(base, productId, safeLimit),
    getCollaborativeScores(identity, productId),
  ]);

  const collaborativeIds = [...collaborativeScores.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, 100)
    .map(([candidateId]) => candidateId)
    .filter((candidateId) => !contentCandidates.some((candidate) => candidate.id === candidateId));

  const collaborativeCandidates = collaborativeIds.length
    ? ((await prisma.product.findMany({
        where: { id: { in: collaborativeIds }, isActive: true },
        select: recommendationSelect,
      })) as RankedProduct[])
    : [];

  const candidates = [...contentCandidates, ...collaborativeCandidates];
  const maxCollaborativeScore = Math.max(0, ...collaborativeScores.values());

  return candidates
    .map((candidate) => {
      const collaborativeScore = collaborativeScores.get(candidate.id) ?? 0;
      const collaborativeBoost = maxCollaborativeScore
        ? (collaborativeScore / maxCollaborativeScore) * 90
        : 0;

      return {
        candidate,
        score: scoreContentMatch(base, candidate) + collaborativeBoost,
      };
    })
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
