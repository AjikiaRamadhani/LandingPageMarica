CREATE TYPE "VoucherStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE');

ALTER TABLE "vouchers"
    ADD COLUMN "status" "VoucherStatus" NOT NULL DEFAULT 'DRAFT';

UPDATE "vouchers"
SET "status" = CASE WHEN "isActive" THEN 'ACTIVE'::"VoucherStatus" ELSE 'INACTIVE'::"VoucherStatus" END;

ALTER TABLE "vouchers"
    ALTER COLUMN "status" DROP DEFAULT;
