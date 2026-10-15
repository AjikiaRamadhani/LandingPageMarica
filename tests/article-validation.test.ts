import assert from "node:assert/strict";
import test from "node:test";
import { validateArticlePayload } from "../lib/article-validation";

test("accepts up to eight unique product IDs for an article widget", () => {
  const productIds = Array.from({ length: 8 }, (_, index) => `product-${index}`);
  const result = validateArticlePayload(
    { title: "Artikel", content: "Isi", productIds },
    { requireTitleAndContent: true },
  );

  assert.equal(result.error, undefined);
  assert.deepEqual(result.data?.productIds, productIds);
});

test("rejects duplicate or oversized article product lists", () => {
  const duplicateResult = validateArticlePayload(
    { title: "Artikel", content: "Isi", productIds: ["product-1", "product-1"] },
    { requireTitleAndContent: true },
  );
  const oversizedResult = validateArticlePayload(
    {
      title: "Artikel",
      content: "Isi",
      productIds: Array.from({ length: 9 }, (_, index) => `product-${index}`),
    },
    { requireTitleAndContent: true },
  );

  assert.match(duplicateResult.error ?? "", /Daftar produk artikel tidak valid/);
  assert.match(oversizedResult.error ?? "", /Daftar produk artikel tidak valid/);
});
