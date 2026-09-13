CREATE TYPE "TableFeeSessionStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "table_fee_packages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "maxPlayers" INTEGER NOT NULL DEFAULT 4,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "table_fee_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "table_fee_sessions" (
  "id" TEXT NOT NULL,
  "sessionNumber" TEXT NOT NULL,
  "tableNumber" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "customerId" TEXT,
  "cashierId" TEXT NOT NULL,
  "total" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paidAmount" INTEGER NOT NULL,
  "changeAmount" INTEGER NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3) NOT NULL,
  "status" "TableFeeSessionStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "table_fee_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "table_fee_sessions_sessionNumber_key" ON "table_fee_sessions"("sessionNumber");
CREATE INDEX "table_fee_packages_isActive_idx" ON "table_fee_packages"("isActive");
CREATE INDEX "table_fee_sessions_tableNumber_status_idx" ON "table_fee_sessions"("tableNumber", "status");
CREATE INDEX "table_fee_sessions_customerId_createdAt_idx" ON "table_fee_sessions"("customerId", "createdAt");
ALTER TABLE "table_fee_sessions" ADD CONSTRAINT "table_fee_sessions_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "table_fee_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "table_fee_sessions" ADD CONSTRAINT "table_fee_sessions_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "table_fee_sessions" ADD CONSTRAINT "table_fee_sessions_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
