import assert from "node:assert/strict";
import test from "node:test";
import { calculateEarnedPoints, calculatePointsDiscount } from "@/lib/points";

test("earned points use Rp10.000 per point", () => {
  assert.equal(calculateEarnedPoints(99_999), 9);
  assert.equal(calculateEarnedPoints(100_000), 10);
  assert.equal(calculateEarnedPoints(0), 0);
});

test("points discount uses Rp1 per point", () => {
  assert.equal(calculatePointsDiscount(250), 250);
  assert.equal(calculatePointsDiscount(0), 0);
  assert.equal(calculatePointsDiscount(-1), 0);
});

test("invalid point values never create a discount", () => {
  assert.equal(calculatePointsDiscount(1.5), 0);
  assert.equal(calculatePointsDiscount(Number.NaN), 0);
});
