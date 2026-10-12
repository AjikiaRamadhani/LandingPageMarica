CREATE TYPE "PreOrderCampaignStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CLOSED', 'COMPLETED');
CREATE TYPE "PreOrderReservationStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED');

CREATE TABLE "pre_order_campaigns" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "price" INTEGER NOT NULL,
  "preorderOpenAt" TIMESTAMP(3) NOT NULL,
  "preorderCloseAt" TIMESTAMP(3),
  "releaseAt" TIMESTAMP(3) NOT NULL,
  "stockLimit" INTEGER,
  "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
  "status" "PreOrderCampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pre_order_campaigns_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pre_order_campaigns_slug_key" ON "pre_order_campaigns"("slug");
CREATE UNIQUE INDEX "pre_order_campaigns_productId_key" ON "pre_order_campaigns"("productId");
CREATE INDEX "pre_order_campaigns_status_preorderOpenAt_preorderCloseAt_idx" ON "pre_order_campaigns"("status", "preorderOpenAt", "preorderCloseAt");
ALTER TABLE "pre_order_campaigns" ADD CONSTRAINT "pre_order_campaigns_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "pre_order_reservations" (
  "id" TEXT NOT NULL,
  "reservationNumber" TEXT NOT NULL,
  "campaignId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "customerName" TEXT NOT NULL,
  "customerEmail" TEXT NOT NULL,
  "customerWhatsapp" TEXT,
  "quantity" INTEGER NOT NULL,
  "totalPrice" INTEGER NOT NULL,
  "status" "PreOrderReservationStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
  "midtransOrderId" TEXT,
  "midtransSnapToken" TEXT,
  "midtransTransactionId" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "pre_order_reservations_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "pre_order_reservations_reservationNumber_key" ON "pre_order_reservations"("reservationNumber");
CREATE UNIQUE INDEX "pre_order_reservations_midtransOrderId_key" ON "pre_order_reservations"("midtransOrderId");
CREATE INDEX "pre_order_reservations_userId_createdAt_idx" ON "pre_order_reservations"("userId", "createdAt");
CREATE INDEX "pre_order_reservations_campaignId_status_idx" ON "pre_order_reservations"("campaignId", "status");
ALTER TABLE "pre_order_reservations" ADD CONSTRAINT "pre_order_reservations_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "pre_order_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pre_order_reservations" ADD CONSTRAINT "pre_order_reservations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
