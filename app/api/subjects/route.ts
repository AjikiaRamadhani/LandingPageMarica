import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/subjects]", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}
