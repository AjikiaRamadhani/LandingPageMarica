CREATE TYPE "UserVoucherStatus" AS ENUM ('AVAILABLE', 'USED', 'EXPIRED');

CREATE TABLE "vouchers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pointsCost" INTEGER NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user_vouchers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "voucherId" TEXT NOT NULL,
    "status" "UserVoucherStatus" NOT NULL DEFAULT 'AVAILABLE',
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    CONSTRAINT "user_vouchers_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "orders" ADD COLUMN "userVoucherId" TEXT;

CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");
CREATE INDEX "vouchers_isActive_expiresAt_idx" ON "vouchers"("isActive", "expiresAt");
CREATE INDEX "user_vouchers_userId_status_idx" ON "user_vouchers"("userId", "status");
CREATE INDEX "user_vouchers_voucherId_idx" ON "user_vouchers"("voucherId");
CREATE UNIQUE INDEX "orders_userVoucherId_key" ON "orders"("userVoucherId");

ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_vouchers" ADD CONSTRAINT "user_vouchers_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "vouchers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "orders" ADD CONSTRAINT "orders_userVoucherId_fkey" FOREIGN KEY ("userVoucherId") REFERENCES "user_vouchers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
