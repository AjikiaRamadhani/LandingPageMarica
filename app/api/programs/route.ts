import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.program.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: {
        programDetails: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/programs]", error);
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 });
  }
}
