import { NextResponse } from "next/server";
import { requireRole } from "@/lib/access-control";
import { prisma } from "@/lib/prisma";

const statuses = new Set(["PENDING", "PREPARING", "READY", "SERVED", "CANCELLED"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { status?: string };
  const status = body.status?.toUpperCase();
  if (!status || !statuses.has(status)) return NextResponse.json({ error: "Status F&B tidak valid" }, { status: 400 });
  const { id } = await params;
  try {
    return NextResponse.json(await prisma.fnbOrderItem.update({ where: { id }, data: { status: status as "PENDING" | "PREPARING" | "READY" | "SERVED" | "CANCELLED" }, include: { fnbProduct: true } }));
  } catch {
    return NextResponse.json({ error: "Pesanan F&B tidak ditemukan" }, { status: 404 });
  }
}
