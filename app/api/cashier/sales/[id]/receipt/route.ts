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
    items: sale.items.map((item) => ({ name: item.itemName, quantity: item.quantity, price: item.unitPrice, subtotal: item.subtotal })),
    subtotal: sale.subtotal,
    total: sale.total,
    paymentMethod: sale.paymentMethod,
    paidAmount: sale.paidAmount,
    changeAmount: sale.changeAmount,
  });
}