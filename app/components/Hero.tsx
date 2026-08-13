import { prisma } from "@/lib/prisma";
import HeroView from "./HeroView";

export default async function Hero() {
  const [hero, stats] = await Promise.all([
    prisma.heroSection.findFirst({
      where: { isActive: true },
      include: {
        badges: { orderBy: { order: "asc" } },
      },
    }),
    prisma.statistic.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    }),
  ]);

  if (!hero) {
    return null;
  }

  return <HeroView hero={hero} stats={stats} />;
}