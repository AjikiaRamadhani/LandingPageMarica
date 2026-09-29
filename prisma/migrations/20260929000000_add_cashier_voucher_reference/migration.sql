ALTER TABLE "cashier_transactions" ADD COLUMN "userVoucherId" TEXT;
CREATE UNIQUE INDEX "cashier_transactions_userVoucherId_key" ON "cashier_transactions"("userVoucherId");
ALTER TABLE "cashier_transactions" ADD CONSTRAINT "cashier_transactions_userVoucherId_fkey" FOREIGN KEY ("userVoucherId") REFERENCES "user_vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
