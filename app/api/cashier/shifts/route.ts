import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function GET() {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const shift = await prisma.posShift.findFirst({ where: { cashierId: session.user.id, status: "OPEN" }, orderBy: { openedAt: "desc" } });
  return NextResponse.json({ shift });
}

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { openingCash?: number; notes?: string };
    const openingCash = typeof body.openingCash === "number" ? body.openingCash : -1;
    if (!Number.isInteger(openingCash) || openingCash < 0) return NextResponse.json({ error: "Kas awal tidak valid" }, { status: 400 });
    const existing = await prisma.posShift.findFirst({ where: { cashierId: session.user.id, status: "OPEN" } });
    if (existing) return NextResponse.json({ error: "Masih ada shift yang terbuka", shift: existing }, { status: 409 });
    const shift = await prisma.posShift.create({ data: { cashierId: session.user.id, openingCash, notes: body.notes?.trim() || null } });
    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error("[POST /api/cashier/shifts]", error);
    return NextResponse.json({ error: "Gagal membuka shift kasir" }, { status: 500 });
  }
}
