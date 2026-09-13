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
      const changed = await tx.cashierTransaction.updateMany({ where: { id, status: "COMPLETED" }, data: { status: "VOIDED" } });
      if (changed.count !== 1) throw new Error("NOT_VOIDABLE");
      const sale = await tx.cashierTransaction.findUnique({ where: { id }, include: { items: true } });
      if (!sale) throw new Error("NOT_FOUND");
      for (const item of sale.items) {
        if (item.type === "PRODUCT" && item.productId) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } } });
          await tx.inventoryMovement.create({ data: { productId: item.productId, type: "RETURN", quantityDelta: item.quantity, reason: `Void mixed sale ${sale.transactionNumber}`, referenceId: sale.id, createdById: session.user.id } });
        }
      }
      await tx.playpassTicket.updateMany({ where: { cashierTransactionId: sale.id, status: "ACTIVE" }, data: { status: "CANCELLED" } });
      await tx.tableFeeSession.updateMany({ where: { cashierTransactionId: sale.id, status: { in: ["ACTIVE", "COMPLETED"] } }, data: { status: "CANCELLED" } });
      const points = sale.customerId ? calculateEarnedPoints(sale.total) : 0;
      if (sale.customerId && points > 0) {
        const account = await tx.pointAccount.findUnique({ where: { userId: sale.customerId } });
        const balance = account ? await tx.pointAccount.updateMany({ where: { id: account.id, balance: { gte: points } }, data: { balance: { decrement: points } } }) : { count: 0 };
        if (balance.count !== 1) throw new Error("POINTS_ALREADY_SPENT");
        await tx.pointTransaction.create({ data: { accountId: account!.id, userId: sale.customerId, type: "REVERSAL", pointsDelta: -points, reason: `Pembalikan poin void mixed sale ${sale.transactionNumber}`, referenceType: "CASHIER_TRANSACTION", referenceId: sale.id, idempotencyKey: `cashier-sale-points-reversal:${sale.id}` } });
      }
      return sale;
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && (error.message === "NOT_VOIDABLE" || error.message === "NOT_FOUND")) return NextResponse.json({ error: "Transaksi tidak ditemukan atau sudah di-void" }, { status: 409 });
    if (error instanceof Error && error.message === "POINTS_ALREADY_SPENT") return NextResponse.json({ error: "Void ditolak karena poin sudah digunakan member" }, { status: 409 });
    console.error("[POST /api/cashier/sales/[id]/void]", error);
    return NextResponse.json({ error: "Gagal melakukan void mixed sale" }, { status: 500 });
  }
}
