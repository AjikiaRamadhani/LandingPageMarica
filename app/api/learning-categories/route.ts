import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.learningCategory.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/learning-categories]", error);
    return NextResponse.json({ error: "Failed to fetch learning-categories" }, { status: 500 });
  }
}
