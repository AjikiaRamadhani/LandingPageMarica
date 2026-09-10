import crypto from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";
import { validateInteger, validateOptionalText, validateText } from "@/lib/request-validation";
import { awardPointsInTransaction, calculateEarnedPoints } from "@/lib/points";

const paymentMethods = ["CASH", "CARD", "QRIS"] as const;
type PaymentMethod = (typeof paymentMethods)[number];

function generateTransactionNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `POS-${date}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

export async function GET(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const params = new URL(request.url).searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(params.get("limit") ?? 25)));
    const status = params.get("status");
    const where: { status?: "COMPLETED" | "VOIDED" } = status === "COMPLETED" || status === "VOIDED" ? { status } : {};
    const [transactions, total] = await Promise.all([
      prisma.posTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: true,
          cashier: { select: { id: true, name: true, email: true } },
          customer: { select: { id: true, name: true, email: true, whatsapp: true } },
        },
      }),
      prisma.posTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) {
    console.error("[GET /api/cashier/transactions]", error);
    return NextResponse.json({ error: "Gagal mengambil transaksi POS" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireRole("ADMIN", "KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = (await request.json()) as {
      customerId?: string;
      userVoucherId?: string;
      paymentMethod?: string;
      paidAmount?: number;
      paymentReference?: string;
      notes?: string;
      items?: Array<{ productId?: string; quantity?: number }>;
    };
    const paymentMethod = body.paymentMethod as PaymentMethod;
    const customerCheck = validateOptionalText(body.customerId, "customerId", 100);
    const userVoucherCheck = validateOptionalText(body.userVoucherId, "userVoucherId", 100);
    const referenceCheck = validateOptionalText(body.paymentReference, "Referensi pembayaran", 120);
    const notesCheck = validateOptionalText(body.notes, "Catatan", 5000);

    if (!paymentMethods.includes(paymentMethod) || customerCheck.error || userVoucherCheck.error || referenceCheck.error || notesCheck.error || !Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      return NextResponse.json({ error: "Data transaksi POS tidak valid" }, { status: 400 });
    }
    const items = body.items.map((item) => ({
      productId: validateText(item.productId, "productId", 100),
      quantity: validateInteger(item.quantity, "quantity", 1),
    }));
    if (items.some((item) => item.productId.error || item.quantity.error || typeof item.productId.value !== "string" || typeof item.quantity.value !== "number")) {
      return NextResponse.json({ error: "Produk dan quantity wajib valid" }, { status: 400 });
    }
    const paidAmount = validateInteger(body.paidAmount, "paidAmount", 0);
    if (paidAmount.error || typeof paidAmount.value !== "number") {
      return NextResponse.json({ error: "Nominal pembayaran wajib valid" }, { status: 400 });
    }

    const productQuantities = new Map<string, number>();
    for (const item of items) {
      productQuantities.set(item.productId.value as string, (productQuantities.get(item.productId.value as string) ?? 0) + (item.quantity.value as number));
    }
    const productIds = [...productQuantities.keys()];
    const transactionNumber = generateTransactionNumber();

    const transaction = await prisma.$transaction(async (tx) => {
      if (customerCheck.value) {
        const customer = await tx.user.findFirst({ where: { id: customerCheck.value, role: "USER" }, select: { id: true } });
        if (!customer) throw new Error("CUSTOMER_NOT_FOUND");
      }

      const products = await tx.$queryRaw<Array<{ id: string; name: string; price: number; stock: number }>>`
        SELECT id, name, price, stock
        FROM "products"
        WHERE id = ANY (${productIds}) AND "isActive" = true
        FOR UPDATE
      `;
      const productMap = new Map(products.map((product) => [product.id, product]));
      for (const [productId, quantity] of productQuantities) {
        const product = productMap.get(productId);
        if (!product) throw new Error("PRODUCT_NOT_FOUND");
        if (product.stock < quantity) throw new Error("STOCK_SHORTAGE");
      }

      const lineItems = productIds.map((productId) => {
        const product = productMap.get(productId)!;
        const quantity = productQuantities.get(productId)!;
        return { productId, productName: product.name, price: product.price, quantity, subtotal: product.price * quantity };
      });
      const subtotal = lineItems.reduce((sum, item) => sum + item.subtotal, 0);
      let discountAmount = 0;
      if (userVoucherCheck.value) {
        if (!customerCheck.value) throw new Error("CUSTOMER_REQUIRED_FOR_VOUCHER");
        const userVoucher = await tx.userVoucher.findUnique({ where: { id: userVoucherCheck.value }, include: { voucher: true } });
        if (!userVoucher || userVoucher.userId !== customerCheck.value || userVoucher.status !== "AVAILABLE" || !userVoucher.voucher.isActive || (userVoucher.voucher.expiresAt && userVoucher.voucher.expiresAt <= new Date())) {
          throw new Error("VOUCHER_UNAVAILABLE");
        }
        discountAmount = Math.min(userVoucher.voucher.discountAmount, subtotal);
      }
      const total = subtotal - discountAmount;
      if (paidAmount.value < total) throw new Error("PAYMENT_SHORTAGE");
      if (paymentMethod !== "CASH" && paidAmount.value !== total) throw new Error("PAYMENT_MISMATCH");

      const created = await tx.posTransaction.create({
        data: {
          transactionNumber,
          cashierId: session.user.id,
          customerId: customerCheck.value,
          subtotal,
          discountAmount,
          userVoucherId: userVoucherCheck.value,
          total,
          paymentMethod,
          paidAmount: paidAmount.value,
          changeAmount: paidAmount.value - total,
          paymentReference: referenceCheck.value,
          notes: notesCheck.value,
          items: { create: lineItems },
        },
        include: { items: true },
      });

      for (const item of lineItems) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity }, soldCount: { increment: item.quantity } } });
        await tx.inventoryMovement.create({ data: { productId: item.productId, posTransactionId: created.id, type: "SALE", quantityDelta: -item.quantity, reason: `Penjualan POS ${transactionNumber}`, referenceId: transactionNumber, createdById: session.user.id } });
      }

      if (userVoucherCheck.value) {
        const changedVoucher = await tx.userVoucher.updateMany({ where: { id: userVoucherCheck.value, userId: customerCheck.value!, status: "AVAILABLE" }, data: { status: "USED", usedAt: new Date() } });
        if (changedVoucher.count !== 1) throw new Error("VOUCHER_UNAVAILABLE");
      }

      const earnedPoints = customerCheck.value ? calculateEarnedPoints(total) : 0;
      if (customerCheck.value) {
        await awardPointsInTransaction(tx, {
          userId: customerCheck.value,
          points: earnedPoints,
          reason: `Poin transaksi POS ${transactionNumber}`,
          referenceType: "POS_TRANSACTION",
          referenceId: created.id,
          idempotencyKey: `pos-transaction-points:${created.id}`,
        });
      }

      return { transaction: created, earnedPoints };
    });

    return NextResponse.json({ ...transaction.transaction, earnedPoints: transaction.earnedPoints }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "CUSTOMER_NOT_FOUND") return NextResponse.json({ error: "Member tidak ditemukan" }, { status: 404 });
      if (error.message === "PRODUCT_NOT_FOUND") return NextResponse.json({ error: "Produk tidak ditemukan atau tidak aktif" }, { status: 404 });
      if (error.message === "STOCK_SHORTAGE") return NextResponse.json({ error: "Stok produk tidak mencukupi" }, { status: 409 });
      if (error.message === "PAYMENT_SHORTAGE") return NextResponse.json({ error: "Nominal pembayaran kurang" }, { status: 400 });
      if (error.message === "PAYMENT_MISMATCH") return NextResponse.json({ error: "Pembayaran non-tunai harus sama dengan total" }, { status: 400 });
      if (error.message === "CUSTOMER_REQUIRED_FOR_VOUCHER") return NextResponse.json({ error: "Member wajib dipilih untuk menggunakan voucher" }, { status: 400 });
      if (error.message === "VOUCHER_UNAVAILABLE") return NextResponse.json({ error: "Voucher member tidak tersedia atau sudah digunakan" }, { status: 409 });
    }
    console.error("[POST /api/cashier/transactions]", error);
    return NextResponse.json({ error: "Gagal membuat transaksi POS" }, { status: 500 });
  }
}
