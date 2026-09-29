ALTER TABLE "table_fee_packages" ADD COLUMN "slotCapacity" INTEGER;

CREATE TYPE "TableReservationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CHECKED_IN', 'CANCELLED', 'EXPIRED');

CREATE TABLE "table_reservations" (
  "id" TEXT NOT NULL,
  "reservationNumber" TEXT NOT NULL,
  "qrToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "partySize" INTEGER NOT NULL,
  "visitDate" TIMESTAMP(3) NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "status" "TableReservationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "expiresAt" TIMESTAMP(3),
  "midtransOrderId" TEXT,
  "midtransTransactionId" TEXT,
  "midtransSnapToken" TEXT,
  "paidAt" TIMESTAMP(3),
  "checkedInAt" TIMESTAMP(3),
  "ticketEmailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "table_reservations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "table_reservations_reservationNumber_key" ON "table_reservations"("reservationNumber");
CREATE UNIQUE INDEX "table_reservations_qrToken_key" ON "table_reservations"("qrToken");
CREATE UNIQUE INDEX "table_reservations_midtransOrderId_key" ON "table_reservations"("midtransOrderId");
CREATE INDEX "table_reservations_userId_createdAt_idx" ON "table_reservations"("userId", "createdAt");
CREATE INDEX "table_reservations_packageId_visitDate_idx" ON "table_reservations"("packageId", "visitDate");
CREATE INDEX "table_reservations_status_visitDate_idx" ON "table_reservations"("status", "visitDate");
CREATE INDEX "table_reservations_visitDate_startTime_endTime_idx" ON "table_reservations"("visitDate", "startTime", "endTime");

ALTER TABLE "table_reservations" ADD CONSTRAINT "table_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "table_reservations" ADD CONSTRAINT "table_reservations_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "table_fee_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
