CREATE TABLE "subscription_activities" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "videoUrl" TEXT,
  "guideUrl" TEXT,
  "thumbnailUrl" TEXT,
  "ageMin" INTEGER,
  "ageMax" INTEGER,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "subscription_activities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "subscription_activities_slug_key" ON "subscription_activities"("slug");
CREATE INDEX "subscription_activities_isPublished_sortOrder_idx" ON "subscription_activities"("isPublished", "sortOrder");
