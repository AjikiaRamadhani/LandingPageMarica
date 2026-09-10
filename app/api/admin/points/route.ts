import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      userId?: string;
      pointsDelta?: number;
      reason?: string;
      referenceId?: string;
      idempotencyKey?: string;
    };

    const userIdCheck = validateText(body.userId, "userId", 100);
    const pointsCheck = validateInteger(body.pointsDelta, "pointsDelta", -2147483647);
    const reasonCheck = validateOptionalText(body.reason, "Alasan", 240);
    const referenceCheck = validateOptionalText(body.referenceId, "Reference ID", 120);
    const keyCheck = validateOptionalText(body.idempotencyKey, "Idempotency key", 180);

    if (
      userIdCheck.error ||
      pointsCheck.error ||
      reasonCheck.error ||
      referenceCheck.error ||
      keyCheck.error ||
      typeof userIdCheck.value !== "string" ||
      typeof pointsCheck.value !== "number" ||
      pointsCheck.value === 0 ||
      (reasonCheck.value !== null && typeof reasonCheck.value !== "string") ||
      (referenceCheck.value !== null && typeof referenceCheck.value !== "string") ||
      (keyCheck.value !== null && typeof keyCheck.value !== "string")
    ) {
      return NextResponse.json({ error: "Data adjustment poin tidak valid" }, { status: 400 });
    }

    const userId = userIdCheck.value;
    const pointsDelta = pointsCheck.value;
    const idempotencyKey = keyCheck.value;

    const transaction = await prisma.$transaction(async (tx) => {
      if (idempotencyKey) {
        const existing = await tx.pointTransaction.findUnique({ where: { idempotencyKey } });
        if (existing) return existing;
      }

      const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true } });
      if (!user) throw new Error("USER_NOT_FOUND");

      const account = await tx.pointAccount.upsert({
        where: { userId },
        update: {},
        create: { userId },
      });

      if (pointsDelta < 0) {
        const changed = await tx.pointAccount.updateMany({
          where: { id: account.id, balance: { gte: Math.abs(pointsDelta) } },
          data: { balance: { increment: pointsDelta } },
        });
        if (changed.count !== 1) throw new Error("INSUFFICIENT_POINTS");
      } else {
        await tx.pointAccount.update({
          where: { id: account.id },
          data: { balance: { increment: pointsDelta } },
        });
      }

      return tx.pointTransaction.create({
        data: {
          accountId: account.id,
          userId,
          type: "ADJUSTMENT",
          pointsDelta,
          reason: reasonCheck.value,
          referenceId: referenceCheck.value,
          idempotencyKey,
        },
      });
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }
    if (error instanceof Error && error.message === "INSUFFICIENT_POINTS") {
      return NextResponse.json({ error: "Saldo poin tidak cukup" }, { status: 409 });
    }
    console.error("[POST /api/admin/points]", error);
    return NextResponse.json({ error: "Gagal mengubah saldo poin" }, { status: 500 });
  }
}
