-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('EARN', 'REDEEM', 'ADJUSTMENT', 'REVERSAL');

-- AlterTable
ALTER TABLE "printables" ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "point_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "point_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "pointsDelta" INTEGER NOT NULL,
    "reason" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "point_accounts_userId_key" ON "point_accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "point_transactions_idempotencyKey_key" ON "point_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "point_transactions_userId_createdAt_idx" ON "point_transactions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_accountId_createdAt_idx" ON "point_transactions"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "point_transactions_referenceType_referenceId_idx" ON "point_transactions"("referenceType", "referenceId");

-- AddForeignKey
ALTER TABLE "point_accounts" ADD CONSTRAINT "point_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "point_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
