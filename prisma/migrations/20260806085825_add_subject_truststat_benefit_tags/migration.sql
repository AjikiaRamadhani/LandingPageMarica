-- AlterTable
ALTER TABLE "benefits" ADD COLUMN     "category" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "tags" TEXT[];

-- AlterTable
ALTER TABLE "company_profile" ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "subjects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "mascotImageUrl" TEXT,
    "colorTag" TEXT,
    "cognitiveDomainTags" TEXT[],
    "contentDomainItems" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_stats" (
    "id" TEXT NOT NULL,
    "value" TEXT,
    "label" TEXT NOT NULL,
    "imageUrl" TEXT,
    "dotColor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trust_stats_pkey" PRIMARY KEY ("id")
);
