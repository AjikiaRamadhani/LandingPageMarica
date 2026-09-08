/*
  Warnings:

  - Added the required column `customerEmail` to the `event_bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `event_bookings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "event_bookings" ADD COLUMN     "customerEmail" TEXT NOT NULL,
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "participantNames" TEXT[];
