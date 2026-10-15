export type PosRetailTransaction = {
  createdAt: Date;
  subtotal: number;
  discountAmount: number;
  paymentMethod: string | null;
  items: {
    productId: string | null;
    type?: string;
    quantity: number;
    subtotal: number;
  }[];
};

export type PosRetailAggregate = {
  revenue: number;
  transactionCount: number;
  dailyRevenue: Map<string, number>;
  paymentCounts: Map<string, number>;
  products: Map<string, { quantity: number; revenue: number }>;
};

export function aggregatePosRetailSales(
  transactions: PosRetailTransaction[],
): PosRetailAggregate {
  const aggregate: PosRetailAggregate = {
    revenue: 0,
    transactionCount: 0,
    dailyRevenue: new Map(),
    paymentCounts: new Map(),
    products: new Map(),
  };

  for (const transaction of transactions) {
    const items = transaction.items.filter(
      (item) => item.productId && (!item.type || item.type === "PRODUCT"),
    );
    if (items.length === 0) continue;

    const productSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const discount = transaction.subtotal > 0
      ? Math.min(
          productSubtotal,
          Math.round(
            Math.min(transaction.discountAmount, transaction.subtotal) *
              (productSubtotal / transaction.subtotal),
          ),
        )
      : 0;
    let remainingDiscount = discount;
    let transactionRevenue = 0;

    items.forEach((item, index) => {
      const itemDiscount = index === items.length - 1
        ? remainingDiscount
        : Math.min(
            remainingDiscount,
            productSubtotal > 0
              ? Math.floor(discount * (item.subtotal / productSubtotal))
              : 0,
          );
      remainingDiscount -= itemDiscount;
      const revenue = item.subtotal - itemDiscount;
      transactionRevenue += revenue;

      const product = aggregate.products.get(item.productId!) ?? {
        quantity: 0,
        revenue: 0,
      };
      product.quantity += item.quantity;
      product.revenue += revenue;
      aggregate.products.set(item.productId!, product);
    });

    aggregate.revenue += transactionRevenue;
    aggregate.transactionCount += 1;
    const date = transaction.createdAt.toISOString().slice(0, 10);
    aggregate.dailyRevenue.set(
      date,
      (aggregate.dailyRevenue.get(date) ?? 0) + transactionRevenue,
    );
    const method = transaction.paymentMethod ?? "Tidak diketahui";
    aggregate.paymentCounts.set(method, (aggregate.paymentCounts.get(method) ?? 0) + 1);
  }

  return aggregate;
}
