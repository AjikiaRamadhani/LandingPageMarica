import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(20, Math.max(1, Number(params.get("limit") ?? 10)));
  const where = { cashierId: session.user.id };
  const [shift, shifts] = await Promise.all([
    prisma.posShift.findFirst({ where: { ...where, status: "OPEN" }, orderBy: { openedAt: "desc" } }),
    prisma.posShift.findMany({
      where,
      orderBy: { openedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        cashier: { select: { name: true, email: true } },
        cashierTransactions: {
          where: { status: "COMPLETED" },
          select: { total: true },
        },
      },
    }),
  ]);
  const total = await prisma.posShift.count({ where });
  return NextResponse.json({
    shift,
    history: shifts.map(({ cashierTransactions, ...item }) => ({
      ...item,
      transactionCount: cashierTransactions.length,
      transactionTotal: cashierTransactions.reduce((sum, transaction) => sum + transaction.total, 0),
    })),
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
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
