import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.howItWorksStep.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/how-it-works]", error);
    return NextResponse.json({ error: "Failed to fetch how-it-works" }, { status: 500 });
  }
}
