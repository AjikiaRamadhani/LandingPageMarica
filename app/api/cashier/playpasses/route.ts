import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

const paymentMethods = ["CASH", "CARD", "QRIS"] as const;
function ticketNumber() { return `PP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }

export async function GET() {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await prisma.playpassPackage.findMany({ where: { isActive: true }, orderBy: { price: "asc" } }));
}

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { packageId?: string; customerId?: string; quantity?: number; paymentMethod?: string; paidAmount?: number };
    const packageId = validateText(body.packageId, "packageId", 100);
    const customerId = validateOptionalText(body.customerId, "customerId", 100);
    const quantity = validateInteger(body.quantity ?? 1, "Jumlah", 1);
    const paidAmount = validateInteger(body.paidAmount, "Nominal pembayaran", 0);
    if (packageId.error || customerId.error || quantity.error || paidAmount.error || typeof packageId.value !== "string" || typeof quantity.value !== "number" || typeof paidAmount.value !== "number" || !paymentMethods.includes(body.paymentMethod as (typeof paymentMethods)[number])) return NextResponse.json({ error: "Data penerbitan Playpass tidak valid" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const packageData = await tx.playpassPackage.findFirst({ where: { id: packageId.value, isActive: true } });
      if (!packageData) throw new Error("PACKAGE_NOT_FOUND");
      if (quantity.value > packageData.maxParticipants) throw new Error("QUANTITY_EXCEEDED");
      if (customerId.value) {
        const customer = await tx.user.findFirst({ where: { id: customerId.value, role: "USER" }, select: { id: true } });
        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
      }
      const total = packageData.price * quantity.value;
      if (paidAmount.value < total) throw new Error("PAYMENT_SHORTAGE");
      if (body.paymentMethod !== "CASH" && paidAmount.value !== total) throw new Error("PAYMENT_MISMATCH");
      const validFrom = new Date();
      const expiresAt = new Date(validFrom.getTime() + packageData.durationMinutes * 60_000);
      const ticket = await tx.playpassTicket.create({ data: { ticketNumber: ticketNumber(), packageId: packageData.id, customerId: customerId.value, cashierId: session.user.id, quantity: quantity.value, total, paymentMethod: body.paymentMethod!, paidAmount: paidAmount.value, changeAmount: paidAmount.value - total, validFrom, expiresAt }, include: { package: true, customer: { select: { id: true, name: true, email: true, whatsapp: true } } } });
      const earnedPoints = customerId.value ? calculateEarnedPoints(total) : 0;
      if (customerId.value) await awardPointsInTransaction(tx, { userId: customerId.value, points: earnedPoints, reason: `Poin Playpass ${ticket.ticketNumber}`, referenceType: "PLAYPASS", referenceId: ticket.id, idempotencyKey: `playpass-points:${ticket.id}` });
      return { ...ticket, earnedPoints };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "PACKAGE_NOT_FOUND") return NextResponse.json({ error: "Paket Playpass tidak ditemukan" }, { status: 404 });
      if (error.message === "CUSTOMER_NOT_FOUND") return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
      if (error.message === "QUANTITY_EXCEEDED") return NextResponse.json({ error: "Jumlah peserta melebihi kapasitas paket" }, { status: 400 });
      if (error.message === "PAYMENT_SHORTAGE") return NextResponse.json({ error: "Nominal pembayaran kurang" }, { status: 400 });
      if (error.message === "PAYMENT_MISMATCH") return NextResponse.json({ error: "Pembayaran non-tunai harus sama dengan total" }, { status: 400 });
    }
    console.error("[POST /api/cashier/playpasses]", error);
    return NextResponse.json({ error: "Gagal menerbitkan Playpass" }, { status: 500 });
  }
}
