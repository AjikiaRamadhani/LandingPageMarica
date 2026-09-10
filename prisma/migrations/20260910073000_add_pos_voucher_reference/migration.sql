ALTER TABLE "pos_transactions" ADD COLUMN "userVoucherId" TEXT;
CREATE UNIQUE INDEX "pos_transactions_userVoucherId_key" ON "pos_transactions"("userVoucherId");
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_userVoucherId_fkey" FOREIGN KEY ("userVoucherId") REFERENCES "user_vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
