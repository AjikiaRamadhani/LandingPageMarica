CREATE TYPE "CashierTransactionItemType" AS ENUM ('PRODUCT', 'PLAYPASS', 'TABLE_FEE');
CREATE TABLE "cashier_transactions" (
  "id" TEXT NOT NULL,
  "transactionNumber" TEXT NOT NULL,
  "cashierId" TEXT NOT NULL,
  "customerId" TEXT,
  "shiftId" TEXT,
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
  CONSTRAINT "cashier_transactions_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "cashier_transaction_items" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "type" "CashierTransactionItemType" NOT NULL,
  "productId" TEXT,
  "playpassPackageId" TEXT,
  "tableFeePackageId" TEXT,
  "itemName" TEXT NOT NULL,
  "tableNumber" TEXT,
  "unitPrice" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  CONSTRAINT "cashier_transaction_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "playpass_tickets" ADD COLUMN "cashierTransactionId" TEXT;
ALTER TABLE "table_fee_sessions" ADD COLUMN "cashierTransactionId" TEXT;
CREATE UNIQUE INDEX "cashier_transactions_transactionNumber_key" ON "cashier_transactions"("transactionNumber");
CREATE INDEX "cashier_transactions_cashierId_createdAt_idx" ON "cashier_transactions"("cashierId", "createdAt");
CREATE INDEX "cashier_transactions_customerId_createdAt_idx" ON "cashier_transactions"("customerId", "createdAt");
CREATE INDEX "cashier_transactions_shiftId_createdAt_idx" ON "cashier_transactions"("shiftId", "createdAt");
CREATE INDEX "cashier_transactions_status_createdAt_idx" ON "cashier_transactions"("status", "createdAt");
CREATE INDEX "cashier_transaction_items_transactionId_idx" ON "cashier_transaction_items"("transactionId");
CREATE INDEX "cashier_transaction_items_productId_idx" ON "cashier_transaction_items"("productId");
CREATE INDEX "playpass_tickets_cashierTransactionId_idx" ON "playpass_tickets"("cashierTransactionId");
CREATE INDEX "table_fee_sessions_cashierTransactionId_idx" ON "table_fee_sessions"("cashierTransactionId");
ALTER TABLE "cashier_transactions" ADD CONSTRAINT "cashier_transactions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cashier_transactions" ADD CONSTRAINT "cashier_transactions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cashier_transactions" ADD CONSTRAINT "cashier_transactions_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cashier_transaction_items" ADD CONSTRAINT "cashier_transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "cashier_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "cashier_transaction_items" ADD CONSTRAINT "cashier_transaction_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cashier_transaction_items" ADD CONSTRAINT "cashier_transaction_items_playpassPackageId_fkey" FOREIGN KEY ("playpassPackageId") REFERENCES "playpass_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "cashier_transaction_items" ADD CONSTRAINT "cashier_transaction_items_tableFeePackageId_fkey" FOREIGN KEY ("tableFeePackageId") REFERENCES "table_fee_packages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_cashierTransactionId_fkey" FOREIGN KEY ("cashierTransactionId") REFERENCES "cashier_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "table_fee_sessions" ADD CONSTRAINT "table_fee_sessions_cashierTransactionId_fkey" FOREIGN KEY ("cashierTransactionId") REFERENCES "cashier_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
