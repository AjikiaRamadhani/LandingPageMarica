import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateText } from "@/lib/request-validation";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  const now = new Date();
  const [catalog, owned] = await Promise.all([
    prisma.voucher.findMany({ where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }, orderBy: { pointsCost: "asc" } }),
    prisma.userVoucher.findMany({ where: { userId: session.user.id }, include: { voucher: true }, orderBy: { redeemedAt: "desc" } }),
  ]);
  return NextResponse.json({ catalog, owned });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Silakan login terlebih dahulu" }, { status: 401 });
  try {
    const body = (await request.json()) as { voucherId?: string };
    const voucherCheck = validateText(body.voucherId, "Voucher", 100);
    if (voucherCheck.error || typeof voucherCheck.value !== "string") return NextResponse.json({ error: voucherCheck.error ?? "Voucher tidak valid" }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const voucher = await tx.voucher.findUnique({ where: { id: voucherCheck.value } });
      if (!voucher || !voucher.isActive || (voucher.expiresAt && voucher.expiresAt <= new Date())) throw new Error("VOUCHER_UNAVAILABLE");
      const account = await tx.pointAccount.findUnique({ where: { userId: session.user.id } });
      if (!account || account.balance < voucher.pointsCost) throw new Error("INSUFFICIENT_POINTS");
      const changed = await tx.pointAccount.updateMany({ where: { id: account.id, balance: { gte: voucher.pointsCost } }, data: { balance: { decrement: voucher.pointsCost } } });
      if (changed.count !== 1) throw new Error("INSUFFICIENT_POINTS");
      const userVoucher = await tx.userVoucher.create({ data: { userId: session.user.id, voucherId: voucher.id } });
      await tx.pointTransaction.create({ data: { accountId: account.id, userId: session.user.id, type: "REDEEM", pointsDelta: -voucher.pointsCost, reason: `Tukar poin menjadi voucher ${voucher.code}`, referenceType: "VOUCHER", referenceId: userVoucher.id, idempotencyKey: `voucher-redeem:${userVoucher.id}` } });
      return userVoucher;
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_POINTS") return NextResponse.json({ error: "Saldo poin tidak cukup" }, { status: 409 });
    if (error instanceof Error && error.message === "VOUCHER_UNAVAILABLE") return NextResponse.json({ error: "Voucher tidak tersedia" }, { status: 409 });
    console.error("[POST /api/vouchers]", error);
    return NextResponse.json({ error: "Gagal menukar poin menjadi voucher" }, { status: 500 });
  }
}
