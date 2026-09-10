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
      const changed = await tx.posTransaction.updateMany({ where: { id, status: "COMPLETED" }, data: { status: "VOIDED" } });
      if (changed.count !== 1) throw new Error("TRANSACTION_NOT_VOIDABLE");
      const transaction = await tx.posTransaction.findUnique({ where: { id }, include: { items: true } });
      if (!transaction) throw new Error("TRANSACTION_NOT_FOUND");

      for (const item of transaction.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity }, soldCount: { decrement: item.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, posTransactionId: transaction.id, type: "RETURN", quantityDelta: item.quantity, reason: `Void transaksi POS ${transaction.transactionNumber}`, referenceId: transaction.transactionNumber, createdById: session.user.id } });
      }

      if (transaction.userVoucherId) {
        await tx.userVoucher.updateMany({ where: { id: transaction.userVoucherId, status: "USED" }, data: { status: "AVAILABLE", usedAt: null } });
      }

      const reversedPoints = transaction.customerId ? calculateEarnedPoints(transaction.total) : 0;
      if (transaction.customerId && reversedPoints > 0) {
        const account = await tx.pointAccount.findUnique({ where: { userId: transaction.customerId } });
        if (!account) throw new Error("POINT_ACCOUNT_NOT_FOUND");
        const changedBalance = await tx.pointAccount.updateMany({ where: { id: account.id, balance: { gte: reversedPoints } }, data: { balance: { decrement: reversedPoints } } });
        if (changedBalance.count !== 1) throw new Error("POINTS_ALREADY_SPENT");
        await tx.pointTransaction.create({ data: { accountId: account.id, userId: transaction.customerId, type: "REVERSAL", pointsDelta: -reversedPoints, reason: `Pembalikan poin karena void POS ${transaction.transactionNumber}`, referenceType: "POS_TRANSACTION", referenceId: transaction.id, idempotencyKey: `pos-transaction-points-reversal:${transaction.id}` } });
      }

      return { transaction, reversedPoints };
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TRANSACTION_NOT_FOUND" || error.message === "TRANSACTION_NOT_VOIDABLE") return NextResponse.json({ error: "Transaksi tidak ditemukan atau sudah di-void" }, { status: 409 });
      if (error.message === "POINTS_ALREADY_SPENT") return NextResponse.json({ error: "Void ditolak karena poin transaksi sudah digunakan member" }, { status: 409 });
    }
    console.error("[POST /api/cashier/transactions/[id]/void]", error);
    return NextResponse.json({ error: "Gagal melakukan void transaksi POS" }, { status: 500 });
  }
}
