import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.event.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/events]", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
