import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.activity.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        testimonials: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/activities]", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
