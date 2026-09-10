type BundleGroup = {
  bundlePrice: number;
  productIds: string[];
  items: Array<{ productId: string; quantity: number; price: number }>;
};

/** Calculates discounts only for complete, valid bundle groups from the cart. */
export function calculateBundleDiscount(groups: BundleGroup[]): number {
  return groups.reduce((totalDiscount, group) => {
    const requiredIds = new Set(group.productIds);
    const itemIds = new Set(group.items.map((item) => item.productId));
    if (requiredIds.size < 2 || requiredIds.size !== itemIds.size || [...requiredIds].some((id) => !itemIds.has(id))) {
      return totalDiscount;
    }

    const sets = Math.min(...group.items.map((item) => item.quantity));
    if (!Number.isInteger(sets) || sets < 1) return totalDiscount;

    const originalSetPrice = group.items.reduce((sum, item) => sum + item.price, 0);
    return totalDiscount + Math.max(0, originalSetPrice - group.bundlePrice) * sets;
  }, 0);
}
