CREATE TYPE "PosPaymentMethod" AS ENUM ('CASH', 'CARD', 'QRIS');
CREATE TYPE "PosTransactionStatus" AS ENUM ('COMPLETED', 'VOIDED');

CREATE TABLE "pos_transactions" (
  "id" TEXT NOT NULL,
  "transactionNumber" TEXT NOT NULL,
  "cashierId" TEXT NOT NULL,
  "customerId" TEXT,
  "subtotal" INTEGER NOT NULL,
  "discountAmount" INTEGER NOT NULL DEFAULT 0,
  "total" INTEGER NOT NULL,
  "paymentMethod" "PosPaymentMethod" NOT NULL,
  "paidAmount" INTEGER NOT NULL,
  "changeAmount" INTEGER NOT NULL DEFAULT 0,
  "paymentReference" TEXT,
  "status" "PosTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pos_transactions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "pos_transaction_items" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "productName" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pos_transaction_items_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "inventory_movements" ADD COLUMN "posTransactionId" TEXT;
CREATE INDEX "pos_transactions_cashierId_createdAt_idx" ON "pos_transactions"("cashierId", "createdAt");
CREATE INDEX "pos_transactions_customerId_createdAt_idx" ON "pos_transactions"("customerId", "createdAt");
CREATE INDEX "pos_transactions_status_createdAt_idx" ON "pos_transactions"("status", "createdAt");
CREATE UNIQUE INDEX "pos_transactions_transactionNumber_key" ON "pos_transactions"("transactionNumber");
CREATE INDEX "pos_transaction_items_transactionId_idx" ON "pos_transaction_items"("transactionId");
CREATE INDEX "pos_transaction_items_productId_createdAt_idx" ON "pos_transaction_items"("productId", "createdAt");
CREATE INDEX "inventory_movements_posTransactionId_idx" ON "inventory_movements"("posTransactionId");

ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pos_transaction_items" ADD CONSTRAINT "pos_transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "pos_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pos_transaction_items" ADD CONSTRAINT "pos_transaction_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_posTransactionId_fkey" FOREIGN KEY ("posTransactionId") REFERENCES "pos_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
