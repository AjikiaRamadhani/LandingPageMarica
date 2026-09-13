import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

const paymentMethods = ["CASH", "CARD", "QRIS"] as const;
type SaleItem = { type?: "PRODUCT" | "PLAYPASS" | "TABLE_FEE"; productId?: string; packageId?: string; tableNumber?: string; quantity?: number };
function saleNumber() { return `SALE-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`; }

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 25)));
  const [sales, total] = await Promise.all([
    prisma.cashierTransaction.findMany({ where: { cashierId: session.user.id }, orderBy: { createdAt: "desc" }, skip: (page - 1) * limit, take: limit, include: { items: true, customer: { select: { id: true, name: true, email: true, whatsapp: true } }, shift: true } }),
    prisma.cashierTransaction.count({ where: { cashierId: session.user.id } }),
  ]);
  return NextResponse.json({ sales, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as { customerId?: string; paymentMethod?: string; paidAmount?: number; paymentReference?: string; notes?: string; items?: SaleItem[] };
    const items = body.items ?? [];
    if (!paymentMethods.includes(body.paymentMethod as (typeof paymentMethods)[number]) || !Number.isInteger(body.paidAmount) || body.paidAmount! < 0 || items.length === 0 || items.length > 50) return NextResponse.json({ error: "Data mixed sale tidak valid" }, { status: 400 });
    if (items.some((item) => !["PRODUCT", "PLAYPASS", "TABLE_FEE"].includes(item.type ?? "") || !Number.isInteger(item.quantity) || item.quantity! < 1)) return NextResponse.json({ error: "Item mixed sale tidak valid" }, { status: 400 });
    const result = await prisma.$transaction(async (tx) => {
      const shift = await tx.posShift.findFirst({ where: { cashierId: session.user.id, status: "OPEN" } });
      if (!shift) throw new Error("SHIFT_REQUIRED");
      if (body.customerId) {
        const customer = await tx.user.findFirst({ where: { id: body.customerId, role: "USER" }, select: { id: true } });
        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
      }
      const productItems = items.filter((item) => item.type === "PRODUCT");
      const productQuantities = new Map<string, number>();
      for (const item of productItems) {
        if (!item.productId) throw new Error("ITEM_INVALID");
        productQuantities.set(item.productId, (productQuantities.get(item.productId) ?? 0) + item.quantity!);
      }
      const products = productQuantities.size ? await tx.$queryRaw<Array<{ id: string; name: string; price: number; stock: number }>>`SELECT id, name, price, stock FROM "products" WHERE id = ANY (${[...productQuantities.keys()]}) AND "isActive" = true FOR UPDATE` : [];
      const productMap = new Map(products.map((product) => [product.id, product]));
      for (const [id, quantity] of productQuantities) { const product = productMap.get(id); if (!product) throw new Error("PRODUCT_NOT_FOUND"); if (product.stock < quantity) throw new Error("STOCK_SHORTAGE"); }
      const playpassIds = items.filter((item) => item.type === "PLAYPASS").map((item) => item.packageId).filter((id): id is string => Boolean(id));
      const tableFeeIds = items.filter((item) => item.type === "TABLE_FEE").map((item) => item.packageId).filter((id): id is string => Boolean(id));
      const [playpassPackages, tableFeePackages] = await Promise.all([
        tx.playpassPackage.findMany({ where: { id: { in: playpassIds }, isActive: true } }),
        tx.tableFeePackage.findMany({ where: { id: { in: tableFeeIds }, isActive: true } }),
      ]);
      const playpassMap = new Map(playpassPackages.map((item) => [item.id, item]));
      const tableFeeMap = new Map(tableFeePackages.map((item) => [item.id, item]));
      const lineItems = items.map((item) => {
        if (item.type === "PRODUCT") { const product = productMap.get(item.productId!)!; return { type: "PRODUCT" as const, productId: product.id, itemName: product.name, unitPrice: product.price, quantity: item.quantity!, subtotal: product.price * item.quantity!, tableNumber: null, playpassPackageId: null, tableFeePackageId: null }; }
        if (item.type === "PLAYPASS") { const pkg = playpassMap.get(item.packageId!); if (!pkg) throw new Error("PACKAGE_NOT_FOUND"); return { type: "PLAYPASS" as const, productId: null, itemName: pkg.name, unitPrice: pkg.price, quantity: item.quantity!, subtotal: pkg.price * item.quantity!, tableNumber: null, playpassPackageId: pkg.id, tableFeePackageId: null }; }
        const pkg = tableFeeMap.get(item.packageId!); if (!pkg || !item.tableNumber?.trim()) throw new Error("PACKAGE_NOT_FOUND"); return { type: "TABLE_FEE" as const, productId: null, itemName: pkg.name, unitPrice: pkg.price, quantity: item.quantity!, subtotal: pkg.price * item.quantity!, tableNumber: item.tableNumber.trim(), playpassPackageId: null, tableFeePackageId: pkg.id };
      });
      for (const item of lineItems.filter((line) => line.type === "TABLE_FEE")) { const active = await tx.tableFeeSession.findFirst({ where: { tableNumber: item.tableNumber!, status: "ACTIVE" } }); if (active) throw new Error("TABLE_OCCUPIED"); }
      const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
      const total = subtotal;
      if (body.paidAmount! < total) throw new Error("PAYMENT_SHORTAGE");
      if (body.paymentMethod !== "CASH" && body.paidAmount !== total) throw new Error("PAYMENT_MISMATCH");
      const created = await tx.cashierTransaction.create({ data: { transactionNumber: saleNumber(), cashierId: session.user.id, customerId: body.customerId || null, shiftId: shift.id, subtotal, total, paymentMethod: body.paymentMethod as "CASH" | "CARD" | "QRIS", paidAmount: body.paidAmount!, changeAmount: body.paidAmount! - total, paymentReference: body.paymentReference?.trim() || null, notes: body.notes?.trim() || null, items: { create: lineItems } }, include: { items: true } });
      for (const item of lineItems) {
        if (item.type === "PRODUCT") { await tx.product.update({ where: { id: item.productId! }, data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } } }); await tx.inventoryMovement.create({ data: { productId: item.productId!, type: "SALE", quantityDelta: -item.quantity, reason: `Mixed sale ${created.transactionNumber}`, referenceId: created.id, createdById: session.user.id } }); }
        if (item.type === "PLAYPASS") { const pkg = playpassMap.get(item.playpassPackageId! )!; const now = new Date(); await tx.playpassTicket.create({ data: { ticketNumber: `PP-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, packageId: pkg.id, cashierTransactionId: created.id, shiftId: shift.id, customerId: body.customerId || null, cashierId: session.user.id, quantity: item.quantity, total: item.subtotal, paymentMethod: body.paymentMethod!, paidAmount: item.subtotal, changeAmount: 0, validFrom: now, expiresAt: new Date(now.getTime() + pkg.durationMinutes * 60000) } }); }
        if (item.type === "TABLE_FEE") { const pkg = tableFeeMap.get(item.tableFeePackageId!)!; const now = new Date(); await tx.tableFeeSession.create({ data: { sessionNumber: `TF-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`, tableNumber: item.tableNumber!, packageId: pkg.id, cashierTransactionId: created.id, shiftId: shift.id, customerId: body.customerId || null, cashierId: session.user.id, total: item.subtotal, paymentMethod: body.paymentMethod!, paidAmount: item.subtotal, changeAmount: 0, startedAt: now, endsAt: new Date(now.getTime() + pkg.durationMinutes * 60000) } }); }
      }
      const earnedPoints = body.customerId ? calculateEarnedPoints(total) : 0;
      if (body.customerId) await awardPointsInTransaction(tx, { userId: body.customerId, points: earnedPoints, reason: `Poin mixed sale ${created.transactionNumber}`, referenceType: "CASHIER_TRANSACTION", referenceId: created.id, idempotencyKey: `cashier-sale-points:${created.id}` });
      return { ...created, earnedPoints };
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const errors: Record<string, [string, number]> = { SHIFT_REQUIRED: ["Buka shift kasir terlebih dahulu", 409], CUSTOMER_NOT_FOUND: ["Member tidak ditemukan", 404], PRODUCT_NOT_FOUND: ["Produk tidak ditemukan atau tidak aktif", 404], PACKAGE_NOT_FOUND: ["Paket layanan tidak ditemukan", 404], STOCK_SHORTAGE: ["Stok produk tidak mencukupi", 409], TABLE_OCCUPIED: ["Meja sedang digunakan", 409], PAYMENT_SHORTAGE: ["Nominal pembayaran kurang", 400], PAYMENT_MISMATCH: ["Pembayaran non-tunai harus sama dengan total", 400] };
      if (errors[error.message]) return NextResponse.json({ error: errors[error.message][0] }, { status: errors[error.message][1] });
    }
    console.error("[POST /api/cashier/sales]", error);
    return NextResponse.json({ error: "Gagal membuat mixed sale" }, { status: 500 });
  }
}
