import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const printables = await prisma.printable.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        subject: true,
        ageMin: true,
        ageMax: true,
        thumbnailUrl: true,
        price: true,
        points: true,
        isFeatured: true,
        downloadCount: true,
      },
    });

    return NextResponse.json(printables);
  } catch (error) {
    console.error("[GET /api/printables]", error);
    return NextResponse.json({ error: "Gagal mengambil data printable" }, { status: 500 });
  }
}
