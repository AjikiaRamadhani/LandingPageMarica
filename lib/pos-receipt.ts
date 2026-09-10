import { prisma } from "@/lib/prisma";

export async function getPosTransactionReceipt(id: string) {
  const transaction = await prisma.posTransaction.findUnique({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      cashier: { select: { id: true, name: true, email: true } },
      customer: { select: { id: true, name: true, email: true, whatsapp: true } },
    },
  });

  if (!transaction) return null;

  return {
    transaction: {
      id: transaction.id,
      transactionNumber: transaction.transactionNumber,
      status: transaction.status,
      createdAt: transaction.createdAt,
      paymentMethod: transaction.paymentMethod,
      paymentReference: transaction.paymentReference,
      subtotal: transaction.subtotal,
      discountAmount: transaction.discountAmount,
      total: transaction.total,
      paidAmount: transaction.paidAmount,
      changeAmount: transaction.changeAmount,
      notes: transaction.notes,
    },
    cashier: transaction.cashier,
    customer: transaction.customer,
    items: transaction.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    receipt: {
      title: "Marica.id",
      transactionNumber: transaction.transactionNumber,
      date: transaction.createdAt,
      cashierName: transaction.cashier.name ?? transaction.cashier.email,
      customerName: transaction.customer?.name ?? "Pelanggan umum",
      items: transaction.items.map((item) => ({ name: item.productName, quantity: item.quantity, price: item.price, subtotal: item.subtotal })),
      subtotal: transaction.subtotal,
      discountAmount: transaction.discountAmount,
      total: transaction.total,
      paymentMethod: transaction.paymentMethod,
      paidAmount: transaction.paidAmount,
      changeAmount: transaction.changeAmount,
      status: transaction.status,
    },
  };
}
