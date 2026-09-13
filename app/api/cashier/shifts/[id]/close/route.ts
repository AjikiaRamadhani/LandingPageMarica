import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = (await request.json()) as { closingCash?: number; notes?: string };
    const closingCash = typeof body.closingCash === "number" ? body.closingCash : -1;
    if (!Number.isInteger(closingCash) || closingCash < 0) return NextResponse.json({ error: "Kas akhir tidak valid" }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const shift = await tx.posShift.findFirst({ where: { id, cashierId: session.user.id, status: "OPEN" } });
      if (!shift) throw new Error("SHIFT_NOT_FOUND");
      const [products, playpasses, tableFees] = await Promise.all([
        tx.posTransaction.aggregate({ where: { shiftId: id, status: "COMPLETED", paymentMethod: "CASH" }, _sum: { total: true } }),
        tx.playpassTicket.aggregate({ where: { shiftId: id, status: { in: ["ACTIVE", "CHECKED_IN"] }, paymentMethod: "CASH" }, _sum: { total: true } }),
        tx.tableFeeSession.aggregate({ where: { shiftId: id, status: { in: ["ACTIVE", "COMPLETED"] }, paymentMethod: "CASH" }, _sum: { total: true } }),
      ]);
      const cashSales = (products._sum.total ?? 0) + (playpasses._sum.total ?? 0) + (tableFees._sum.total ?? 0);
      const expectedCash = shift.openingCash + cashSales;
      const closed = await tx.posShift.update({ where: { id }, data: { closingCash, expectedCash, status: "CLOSED", closedAt: new Date(), notes: body.notes?.trim() || shift.notes } });
      return { shift: closed, cashSales, difference: closingCash - expectedCash };
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "SHIFT_NOT_FOUND") return NextResponse.json({ error: "Shift tidak ditemukan atau sudah ditutup" }, { status: 409 });
    console.error("[POST /api/cashier/shifts/[id]/close]", error);
    return NextResponse.json({ error: "Gagal menutup shift kasir" }, { status: 500 });
  }
}
