import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

const paymentMethods = ["CASH", "CARD", "QRIS"] as const;
function sessionNumber() { return `TF-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }

export async function GET() {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.tableFeeSession.updateMany({ where: { status: "ACTIVE", endsAt: { lte: new Date() } }, data: { status: "COMPLETED" } });
  const sessions = await prisma.tableFeeSession.findMany({ where: { status: "ACTIVE" }, orderBy: { startedAt: "asc" }, include: { package: true, customer: { select: { id: true, name: true, whatsapp: true } } } });
  return NextResponse.json({ sessions });
}

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { tableNumber?: string; packageId?: string; customerId?: string; paymentMethod?: string; paidAmount?: number };
    const paidAmount = typeof body.paidAmount === "number" ? body.paidAmount : -1;
    if (!body.tableNumber?.trim() || !body.packageId || !paymentMethods.includes(body.paymentMethod as (typeof paymentMethods)[number]) || !Number.isInteger(paidAmount) || paidAmount < 0) return NextResponse.json({ error: "Data sesi table fee tidak valid" }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const active = await tx.tableFeeSession.findFirst({ where: { tableNumber: body.tableNumber!.trim(), status: "ACTIVE" } });
      if (active) throw new Error("TABLE_OCCUPIED");
      const packageData = await tx.tableFeePackage.findFirst({ where: { id: body.packageId, isActive: true } });
      if (!packageData) throw new Error("PACKAGE_NOT_FOUND");
      if (body.customerId) {
        const customer = await tx.user.findFirst({ where: { id: body.customerId, role: "USER" }, select: { id: true } });
        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
      }
      if (paidAmount < packageData.price) throw new Error("PAYMENT_SHORTAGE");
      if (body.paymentMethod !== "CASH" && paidAmount !== packageData.price) throw new Error("PAYMENT_MISMATCH");
      const startedAt = new Date();
      const endsAt = new Date(startedAt.getTime() + packageData.durationMinutes * 60_000);
      const created = await tx.tableFeeSession.create({ data: { sessionNumber: sessionNumber(), tableNumber: body.tableNumber!.trim(), packageId: packageData.id, customerId: body.customerId || null, cashierId: session.user.id, total: packageData.price, paymentMethod: body.paymentMethod!, paidAmount, changeAmount: paidAmount - packageData.price, startedAt, endsAt }, include: { package: true, customer: { select: { id: true, name: true, whatsapp: true } } } });
      const earnedPoints = body.customerId ? calculateEarnedPoints(packageData.price) : 0;
      if (body.customerId) await awardPointsInTransaction(tx, { userId: body.customerId, points: earnedPoints, reason: `Poin Table Fee ${created.sessionNumber}`, referenceType: "TABLE_FEE", referenceId: created.id, idempotencyKey: `table-fee-points:${created.id}` });
      return { ...created, earnedPoints };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "TABLE_OCCUPIED") return NextResponse.json({ error: "Meja sedang digunakan" }, { status: 409 });
      if (error.message === "PACKAGE_NOT_FOUND") return NextResponse.json({ error: "Tarif table fee tidak ditemukan" }, { status: 404 });
      if (error.message === "CUSTOMER_NOT_FOUND") return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
      if (error.message === "PAYMENT_SHORTAGE") return NextResponse.json({ error: "Nominal pembayaran kurang" }, { status: 400 });
      if (error.message === "PAYMENT_MISMATCH") return NextResponse.json({ error: "Pembayaran non-tunai harus sama dengan total" }, { status: 400 });
    }
    console.error("[POST /api/cashier/table-fees]", error);
    return NextResponse.json({ error: "Gagal membuka sesi table fee" }, { status: 500 });
  }
}
