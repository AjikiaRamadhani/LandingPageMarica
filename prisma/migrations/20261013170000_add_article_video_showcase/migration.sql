ALTER TABLE "articles"
  ADD COLUMN "videoUrl" TEXT,
  ADD COLUMN "videoProvider" TEXT,
  ADD COLUMN "videoDurationSeconds" INTEGER,
  ADD COLUMN "isVideoFeatured" BOOLEAN NOT NULL DEFAULT false;
