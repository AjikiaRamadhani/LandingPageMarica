import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitValue = Number(searchParams.get("limit") ?? 12);
  const limit = Number.isInteger(limitValue) && limitValue > 0 ? Math.min(50, limitValue) : 12;
  const videos = await prisma.article.findMany({
    where: { status: "PUBLISHED", videoUrl: { not: null } },
    orderBy: [{ isVideoFeatured: "desc" }, { publishedAt: "desc" }],
    take: limit,
    select: { id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, videoUrl: true, videoProvider: true, videoDurationSeconds: true, isVideoFeatured: true, publishedAt: true, views: true, category: { select: { id: true, name: true, slug: true, colorTag: true } } },
  });
  return NextResponse.json(videos);
}
