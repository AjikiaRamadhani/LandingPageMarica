CREATE TYPE "InventoryLocation" AS ENUM ('ONLINE_WAREHOUSE', 'MARICA_STORE');

ALTER TYPE "InventoryMovementType" ADD VALUE 'TRANSFER';

ALTER TABLE "inventory_movements"
ADD COLUMN "location" "InventoryLocation" NOT NULL DEFAULT 'ONLINE_WAREHOUSE';

CREATE INDEX "inventory_movements_location_createdAt_idx"
ON "inventory_movements"("location", "createdAt");

UPDATE "inventory_movements"
SET "location" = 'MARICA_STORE'
WHERE "posTransactionId" IS NOT NULL;

UPDATE "inventory_movements"
SET "location" = 'MARICA_STORE'
WHERE "referenceId" IN (SELECT "id" FROM "cashier_transactions")
  AND "reason" LIKE 'Mixed sale %';

UPDATE "inventory_movements"
SET "location" = 'MARICA_STORE'
WHERE "referenceId" IN (SELECT "id" FROM "cashier_transactions")
  AND "reason" LIKE 'Void mixed sale %';

CREATE TABLE "product_inventories" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "location" "InventoryLocation" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_inventories_pkey" PRIMARY KEY ("id")
);

INSERT INTO "product_inventories" ("id", "productId", "location", "quantity", "updatedAt")
SELECT 'inventory-' || "id" || '-online', "id", 'ONLINE_WAREHOUSE', "stock", CURRENT_TIMESTAMP
FROM "products";

INSERT INTO "product_inventories" ("id", "productId", "location", "quantity", "updatedAt")
SELECT 'inventory-' || "id" || '-store', "id", 'MARICA_STORE', 0, CURRENT_TIMESTAMP
FROM "products";

CREATE UNIQUE INDEX "product_inventories_productId_location_key"
ON "product_inventories"("productId", "location");

CREATE INDEX "product_inventories_location_quantity_idx"
ON "product_inventories"("location", "quantity");

ALTER TABLE "product_inventories"
ADD CONSTRAINT "product_inventories_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "article_product_placements" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "article_product_placements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "article_product_placements_articleId_productId_key"
ON "article_product_placements"("articleId", "productId");

CREATE INDEX "article_product_placements_articleId_sortOrder_idx"
ON "article_product_placements"("articleId", "sortOrder");

CREATE INDEX "article_product_placements_productId_idx"
ON "article_product_placements"("productId");

ALTER TABLE "article_product_placements"
ADD CONSTRAINT "article_product_placements_articleId_fkey"
FOREIGN KEY ("articleId") REFERENCES "articles"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "article_product_placements"
ADD CONSTRAINT "article_product_placements_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "products"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
