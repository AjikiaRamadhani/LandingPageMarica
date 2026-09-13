import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const changed = await prisma.tableFeeSession.updateMany({ where: { id, status: "ACTIVE" }, data: { status: "COMPLETED" } });
    if (changed.count !== 1) return NextResponse.json({ error: "Sesi tidak ditemukan atau sudah selesai" }, { status: 409 });
    return NextResponse.json(await prisma.tableFeeSession.findUnique({ where: { id }, include: { package: true, customer: { select: { id: true, name: true, whatsapp: true } }, cashier: { select: { id: true, name: true } } } }));
  } catch (error) {
    console.error("[POST /api/cashier/table-fees/[id]/complete]", error);
    return NextResponse.json({ error: "Gagal menyelesaikan sesi table fee" }, { status: 500 });
  }
}
