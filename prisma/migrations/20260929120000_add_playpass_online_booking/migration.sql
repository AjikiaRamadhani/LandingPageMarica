ALTER TABLE "playpass_packages" ADD COLUMN "slotCapacity" INTEGER;

ALTER TABLE "playpass_tickets" ALTER COLUMN "cashierId" DROP NOT NULL;
ALTER TABLE "playpass_tickets" ADD COLUMN "bookingId" TEXT;

CREATE TYPE "PlaypassBookingStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED');

CREATE TABLE "playpass_bookings" (
  "id" TEXT NOT NULL,
  "bookingNumber" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerPhone" TEXT,
  "visitDate" TIMESTAMP(3) NOT NULL,
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "quantity" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "status" "PlaypassBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "expiresAt" TIMESTAMP(3),
  "midtransOrderId" TEXT,
  "midtransTransactionId" TEXT,
  "midtransSnapToken" TEXT,
  "paidAt" TIMESTAMP(3),
  "ticketEmailSentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playpass_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "playpass_bookings_bookingNumber_key" ON "playpass_bookings"("bookingNumber");
CREATE UNIQUE INDEX "playpass_bookings_midtransOrderId_key" ON "playpass_bookings"("midtransOrderId");
CREATE INDEX "playpass_bookings_userId_createdAt_idx" ON "playpass_bookings"("userId", "createdAt");
CREATE INDEX "playpass_bookings_packageId_visitDate_idx" ON "playpass_bookings"("packageId", "visitDate");
CREATE INDEX "playpass_bookings_status_visitDate_idx" ON "playpass_bookings"("status", "visitDate");
CREATE INDEX "playpass_bookings_visitDate_startTime_endTime_idx" ON "playpass_bookings"("visitDate", "startTime", "endTime");
CREATE INDEX "playpass_tickets_bookingId_idx" ON "playpass_tickets"("bookingId");

ALTER TABLE "playpass_bookings" ADD CONSTRAINT "playpass_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "playpass_bookings" ADD CONSTRAINT "playpass_bookings_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "playpass_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "playpass_bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
