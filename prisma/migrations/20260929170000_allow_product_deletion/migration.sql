-- Preserve order and POS history while allowing the catalog product row to be removed.
ALTER TABLE "cart_items" DROP CONSTRAINT "cart_items_productId_fkey";
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "product_bundle_items" DROP CONSTRAINT "product_bundle_items_productId_fkey";
ALTER TABLE "product_bundle_items" ADD CONSTRAINT "product_bundle_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "order_items" DROP CONSTRAINT "order_items_productId_fkey";
ALTER TABLE "order_items" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_productId_fkey";
ALTER TABLE "inventory_movements" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "pos_transaction_items" DROP CONSTRAINT "pos_transaction_items_productId_fkey";
ALTER TABLE "pos_transaction_items" ALTER COLUMN "productId" DROP NOT NULL;
ALTER TABLE "pos_transaction_items" ADD CONSTRAINT "pos_transaction_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
