ALTER TABLE "subscriptions" ADD COLUMN "childProfileId" TEXT;

CREATE INDEX "subscriptions_childProfileId_idx" ON "subscriptions"("childProfileId");

ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_childProfileId_fkey"
  FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
