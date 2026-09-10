import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { calculateEarnedPoints } from "@/lib/points";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.tableFeeSession.updateMany({ where: { id, status: { in: ["ACTIVE", "COMPLETED"] } }, data: { status: "CANCELLED" } });
      if (changed.count !== 1) throw new Error("NOT_CANCELABLE");
      const tableSession = await tx.tableFeeSession.findUnique({ where: { id } });
      if (!tableSession) throw new Error("NOT_FOUND");
      const points = tableSession.customerId ? calculateEarnedPoints(tableSession.total) : 0;
      if (tableSession.customerId && points > 0) {
        const account = await tx.pointAccount.findUnique({ where: { userId: tableSession.customerId } });
        if (!account) throw new Error("POINTS_ALREADY_SPENT");
        const changedBalance = await tx.pointAccount.updateMany({ where: { id: account.id, balance: { gte: points } }, data: { balance: { decrement: points } } });
        if (changedBalance.count !== 1) throw new Error("POINTS_ALREADY_SPENT");
        await tx.pointTransaction.create({ data: { accountId: account.id, userId: tableSession.customerId, type: "REVERSAL", pointsDelta: -points, reason: `Pembalikan poin cancel Table Fee ${tableSession.sessionNumber}`, referenceType: "TABLE_FEE", referenceId: tableSession.id, idempotencyKey: `table-fee-points-reversal:${tableSession.id}` } });
      }
      return tableSession;
    });
    return NextResponse.json({ ...result, cancelledBy: session.user.id });
  } catch (error) {
    if (error instanceof Error && (error.message === "NOT_CANCELABLE" || error.message === "NOT_FOUND")) return NextResponse.json({ error: "Sesi tidak ditemukan atau sudah dibatalkan" }, { status: 409 });
    if (error instanceof Error && error.message === "POINTS_ALREADY_SPENT") return NextResponse.json({ error: "Pembatalan ditolak karena poin sudah digunakan member" }, { status: 409 });
    console.error("[POST /api/cashier/table-fees/[id]/cancel]", error);
    return NextResponse.json({ error: "Gagal membatalkan sesi Table Fee" }, { status: 500 });
  }
}
