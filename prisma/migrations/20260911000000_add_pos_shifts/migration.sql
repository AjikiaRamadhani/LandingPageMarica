CREATE TYPE "PosShiftStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TABLE "pos_shifts" (
  "id" TEXT NOT NULL,
  "cashierId" TEXT NOT NULL,
  "openingCash" INTEGER NOT NULL,
  "closingCash" INTEGER,
  "expectedCash" INTEGER,
  "status" "PosShiftStatus" NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closedAt" TIMESTAMP(3),
  CONSTRAINT "pos_shifts_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "pos_transactions" ADD COLUMN "shiftId" TEXT;
ALTER TABLE "playpass_tickets" ADD COLUMN "shiftId" TEXT;
ALTER TABLE "table_fee_sessions" ADD COLUMN "shiftId" TEXT;
CREATE INDEX "pos_shifts_cashierId_status_idx" ON "pos_shifts"("cashierId", "status");
CREATE INDEX "pos_shifts_status_openedAt_idx" ON "pos_shifts"("status", "openedAt");
CREATE INDEX "pos_transactions_shiftId_idx" ON "pos_transactions"("shiftId");
CREATE INDEX "playpass_tickets_shiftId_idx" ON "playpass_tickets"("shiftId");
CREATE INDEX "table_fee_sessions_shiftId_idx" ON "table_fee_sessions"("shiftId");
ALTER TABLE "pos_shifts" ADD CONSTRAINT "pos_shifts_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "table_fee_sessions" ADD CONSTRAINT "table_fee_sessions_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "pos_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
