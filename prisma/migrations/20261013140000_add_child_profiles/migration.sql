CREATE TABLE "child_profiles" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "birthDate" TIMESTAMP(3),
  "gender" TEXT,
  "learningLevel" TEXT,
  "learningStyle" TEXT,
  "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "favoriteThemes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "allergies" TEXT,
  "personalizationNotes" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "child_profiles_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "child_profiles_userId_isActive_idx" ON "child_profiles"("userId", "isActive");

ALTER TABLE "child_profiles" ADD CONSTRAINT "child_profiles_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
