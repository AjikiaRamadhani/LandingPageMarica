import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { calculateEarnedPoints } from "@/lib/points";

export async function POST(_request: Request, { params }: { params: Promise<{ ticketNumber: string }> }) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { ticketNumber } = await params;
    const result = await prisma.$transaction(async (tx) => {
      const changed = await tx.playpassTicket.updateMany({ where: { ticketNumber, status: "ACTIVE" }, data: { status: "CANCELLED" } });
      if (changed.count !== 1) throw new Error("NOT_VOIDABLE");
      const ticket = await tx.playpassTicket.findUnique({ where: { ticketNumber } });
      if (!ticket) throw new Error("NOT_FOUND");
      const points = ticket.customerId ? calculateEarnedPoints(ticket.total) : 0;
      if (ticket.customerId && points > 0) {
        const account = await tx.pointAccount.findUnique({ where: { userId: ticket.customerId } });
        if (!account) throw new Error("POINTS_ALREADY_SPENT");
        const changedBalance = await tx.pointAccount.updateMany({ where: { id: account.id, balance: { gte: points } }, data: { balance: { decrement: points } } });
        if (changedBalance.count !== 1) throw new Error("POINTS_ALREADY_SPENT");
        await tx.pointTransaction.create({ data: { accountId: account.id, userId: ticket.customerId, type: "REVERSAL", pointsDelta: -points, reason: `Pembalikan poin void Playpass ${ticket.ticketNumber}`, referenceType: "PLAYPASS", referenceId: ticket.id, idempotencyKey: `playpass-points-reversal:${ticket.id}` } });
      }
      return ticket;
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === "NOT_VOIDABLE" || error.message === "NOT_FOUND")) return NextResponse.json({ error: "Tiket tidak ditemukan atau tidak dapat di-void" }, { status: 409 });
    if (error instanceof Error && error.message === "POINTS_ALREADY_SPENT") return NextResponse.json({ error: "Void ditolak karena poin sudah digunakan member" }, { status: 409 });
    console.error("[POST /api/cashier/playpasses/[ticketNumber]/void]", error);
    return NextResponse.json({ error: "Gagal melakukan void Playpass" }, { status: 500 });
  }
}
