import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const hero = await prisma.heroSection.findFirst({
      where: { isActive: true },
      include: {
        badges: { orderBy: { order: "asc" } },
      },
    });

    if (!hero) {
      return NextResponse.json({ error: "Hero section not found" }, { status: 404 });
    }

    return NextResponse.json(hero);
  } catch (error) {
    console.error("[GET /api/hero]", error);
    return NextResponse.json({ error: "Failed to fetch hero section" }, { status: 500 });
  }
}
