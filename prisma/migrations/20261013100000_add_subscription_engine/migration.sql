CREATE TYPE "SubscriptionPlanInterval" AS ENUM ('MONTHLY', 'QUARTERLY');
CREATE TYPE "SubscriptionStatus" AS ENUM ('PENDING_PAYMENT', 'ACTIVE', 'PAST_DUE', 'PAUSED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "SubscriptionCycleStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'FAILED', 'SKIPPED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "SubscriptionDeliveryStatus" AS ENUM ('SCHEDULED', 'PREPARING', 'SHIPPED', 'DELIVERED', 'SKIPPED', 'CANCELLED');

CREATE TABLE "subscription_plans" (
  "id" TEXT NOT NULL, "slug" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT NOT NULL,
  "price" INTEGER NOT NULL, "interval" "SubscriptionPlanInterval" NOT NULL, "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscription_plans_slug_key" ON "subscription_plans"("slug");

CREATE TABLE "subscriptions" (
  "id" TEXT NOT NULL, "subscriptionNumber" TEXT NOT NULL, "userId" TEXT NOT NULL, "planId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'PENDING_PAYMENT', "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextBillingAt" TIMESTAMP(3) NOT NULL, "nextDeliveryAt" TIMESTAMP(3) NOT NULL, "pausedUntil" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
  "shippingName" TEXT NOT NULL, "shippingPhone" TEXT NOT NULL, "shippingAddress" TEXT NOT NULL, "shippingCity" TEXT NOT NULL,
  "shippingProvince" TEXT NOT NULL, "shippingPostalCode" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscriptions_subscriptionNumber_key" ON "subscriptions"("subscriptionNumber");
CREATE INDEX "subscriptions_userId_status_idx" ON "subscriptions"("userId", "status");
CREATE INDEX "subscriptions_status_nextBillingAt_idx" ON "subscriptions"("status", "nextBillingAt");
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "subscription_plans"("id") ON UPDATE CASCADE;

CREATE TABLE "subscription_cycles" (
  "id" TEXT NOT NULL, "cycleNumber" TEXT NOT NULL, "subscriptionId" TEXT NOT NULL, "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL, "billingDueAt" TIMESTAMP(3) NOT NULL, "amount" INTEGER NOT NULL,
  "status" "SubscriptionCycleStatus" NOT NULL DEFAULT 'PENDING_PAYMENT', "midtransOrderId" TEXT, "midtransSnapToken" TEXT,
  "midtransTransactionId" TEXT, "paidAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_cycles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscription_cycles_cycleNumber_key" ON "subscription_cycles"("cycleNumber");
CREATE UNIQUE INDEX "subscription_cycles_midtransOrderId_key" ON "subscription_cycles"("midtransOrderId");
CREATE INDEX "subscription_cycles_subscriptionId_periodStart_idx" ON "subscription_cycles"("subscriptionId", "periodStart");
CREATE INDEX "subscription_cycles_status_billingDueAt_idx" ON "subscription_cycles"("status", "billingDueAt");
ALTER TABLE "subscription_cycles" ADD CONSTRAINT "subscription_cycles_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "subscription_deliveries" (
  "id" TEXT NOT NULL, "deliveryNumber" TEXT NOT NULL, "subscriptionId" TEXT NOT NULL, "cycleId" TEXT NOT NULL,
  "status" "SubscriptionDeliveryStatus" NOT NULL DEFAULT 'SCHEDULED', "scheduledAt" TIMESTAMP(3) NOT NULL, "shippedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3), "trackingNumber" TEXT, "courier" TEXT, "fulfillmentNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_deliveries_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscription_deliveries_deliveryNumber_key" ON "subscription_deliveries"("deliveryNumber");
CREATE UNIQUE INDEX "subscription_deliveries_cycleId_key" ON "subscription_deliveries"("cycleId");
CREATE INDEX "subscription_deliveries_subscriptionId_scheduledAt_idx" ON "subscription_deliveries"("subscriptionId", "scheduledAt");
CREATE INDEX "subscription_deliveries_status_scheduledAt_idx" ON "subscription_deliveries"("status", "scheduledAt");
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "subscription_deliveries" ADD CONSTRAINT "subscription_deliveries_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "subscription_cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
