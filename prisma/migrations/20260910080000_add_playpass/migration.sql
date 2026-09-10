CREATE TYPE "PlaypassTicketStatus" AS ENUM ('ACTIVE', 'CHECKED_IN', 'EXPIRED', 'CANCELLED');

CREATE TABLE "playpass_packages" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  "maxParticipants" INTEGER NOT NULL DEFAULT 1,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playpass_packages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "playpass_tickets" (
  "id" TEXT NOT NULL,
  "ticketNumber" TEXT NOT NULL,
  "qrToken" TEXT NOT NULL,
  "packageId" TEXT NOT NULL,
  "customerId" TEXT,
  "cashierId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "total" INTEGER NOT NULL,
  "paymentMethod" TEXT NOT NULL,
  "paidAmount" INTEGER NOT NULL,
  "changeAmount" INTEGER NOT NULL DEFAULT 0,
  "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "status" "PlaypassTicketStatus" NOT NULL DEFAULT 'ACTIVE',
  "checkedInAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "playpass_tickets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "playpass_tickets_ticketNumber_key" ON "playpass_tickets"("ticketNumber");
CREATE UNIQUE INDEX "playpass_tickets_qrToken_key" ON "playpass_tickets"("qrToken");
CREATE INDEX "playpass_packages_isActive_idx" ON "playpass_packages"("isActive");
CREATE INDEX "playpass_tickets_customerId_createdAt_idx" ON "playpass_tickets"("customerId", "createdAt");
CREATE INDEX "playpass_tickets_status_expiresAt_idx" ON "playpass_tickets"("status", "expiresAt");
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "playpass_packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "playpass_tickets" ADD CONSTRAINT "playpass_tickets_cashierId_fkey" FOREIGN KEY ("cashierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
