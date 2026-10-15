import assert from "node:assert/strict";
import test from "node:test";
import { aggregatePosRetailSales } from "../lib/omnichannel-sales";

test("aggregates only retail lines and allocates mixed-sale discounts to products", () => {
  const result = aggregatePosRetailSales([
    {
      createdAt: new Date("2026-10-15T10:00:00.000Z"),
      subtotal: 1200,
      discountAmount: 120,
      paymentMethod: "QRIS",
      items: [
        { productId: "toy-a", type: "PRODUCT", quantity: 2, subtotal: 600 },
        { productId: "toy-b", type: "PRODUCT", quantity: 1, subtotal: 400 },
        { productId: null, type: "PLAYPASS", quantity: 1, subtotal: 200 },
      ],
    },
  ]);

  assert.equal(result.revenue, 900);
  assert.equal(result.transactionCount, 1);
  assert.equal(result.dailyRevenue.get("2026-10-15"), 900);
  assert.equal(result.paymentCounts.get("QRIS"), 1);
  assert.deepEqual(result.products.get("toy-a"), { quantity: 2, revenue: 540 });
  assert.deepEqual(result.products.get("toy-b"), { quantity: 1, revenue: 360 });
});

test("ignores cashier transactions without product lines", () => {
  const result = aggregatePosRetailSales([
    {
      createdAt: new Date("2026-10-15T10:00:00.000Z"),
      subtotal: 500,
      discountAmount: 0,
      paymentMethod: "CASH",
      items: [{ productId: null, type: "TABLE_FEE", quantity: 1, subtotal: 500 }],
    },
  ]);

  assert.equal(result.revenue, 0);
  assert.equal(result.transactionCount, 0);
  assert.equal(result.paymentCounts.size, 0);
});

test("supports zero-priced legacy POS items without producing invalid revenue", () => {
  const result = aggregatePosRetailSales([
    {
      createdAt: new Date("2026-10-15T10:00:00.000Z"),
      subtotal: 0,
      discountAmount: 0,
      paymentMethod: "CASH",
      items: [{ productId: "free-item", quantity: 1, subtotal: 0 }],
    },
  ]);

  assert.equal(result.revenue, 0);
  assert.deepEqual(result.products.get("free-item"), { quantity: 1, revenue: 0 });
});
