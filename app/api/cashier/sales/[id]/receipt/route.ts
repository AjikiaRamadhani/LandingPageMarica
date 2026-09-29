import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/access-control";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole("KASIR");
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sale = await prisma.cashierTransaction.findFirst({
    where: { id, cashierId: session.user.id },
    include: {
      items: true,
      customer: { select: { name: true, email: true, whatsapp: true } },
      cashier: { select: { name: true, email: true } },
      userVoucher: {
        select: {
          voucher: { select: { code: true, title: true, discountAmount: true } },
        },
      },
    },
  });
  if (!sale) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });

  return NextResponse.json({
    title: "Marica.id",
    transactionNumber: sale.transactionNumber,
    date: sale.createdAt,
    status: sale.status,
    cashierName: sale.cashier.name ?? sale.cashier.email,
    customerName: sale.customer?.name ?? "Pelanggan umum",
    voucher: sale.userVoucher
      ? {
          code: sale.userVoucher.voucher.code,
          title: sale.userVoucher.voucher.title,
          discountAmount: sale.userVoucher.voucher.discountAmount,
        }
      : null,
    items: sale.items.map((item) => ({ name: item.itemName, quantity: item.quantity, price: item.unitPrice, subtotal: item.subtotal })),
    subtotal: sale.subtotal,
    discountAmount: sale.discountAmount,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    paidAmount: sale.paidAmount,
    changeAmount: sale.changeAmount,
  });
}
