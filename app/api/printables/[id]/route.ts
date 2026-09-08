import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const printable = await prisma.printable.findFirst({
      where: { OR: [{ id }, { slug: id }], isActive: true },
    });

    if (!printable) return NextResponse.json({ error: "Printable tidak ditemukan" }, { status: 404 });
    return NextResponse.json(printable);
  } catch (error) {
    console.error("[GET /api/printables/[id]]", error);
    return NextResponse.json({ error: "Gagal mengambil printable" }, { status: 500 });
  }
}