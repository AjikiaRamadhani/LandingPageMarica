import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.programDetail.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        program: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/program-details]", error);
    return NextResponse.json({ error: "Failed to fetch program details" }, { status: 500 });
  }
}
