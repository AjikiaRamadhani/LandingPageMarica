CREATE TYPE "RecommendationEventType" AS ENUM ('VIEW', 'CLICK', 'CART', 'PURCHASE');

CREATE TABLE "recommendation_events" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "productId" TEXT NOT NULL,
    "type" "RecommendationEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recommendation_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recommendation_events_userId_createdAt_idx" ON "recommendation_events"("userId", "createdAt");
CREATE INDEX "recommendation_events_sessionId_createdAt_idx" ON "recommendation_events"("sessionId", "createdAt");
CREATE INDEX "recommendation_events_productId_type_createdAt_idx" ON "recommendation_events"("productId", "type", "createdAt");

ALTER TABLE "recommendation_events"
    ADD CONSTRAINT "recommendation_events_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "recommendation_events"
    ADD CONSTRAINT "recommendation_events_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
