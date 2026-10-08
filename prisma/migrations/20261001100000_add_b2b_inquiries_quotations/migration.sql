CREATE TYPE "B2BInquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

CREATE TABLE "b2b_inquiries" (
  "id" TEXT NOT NULL,
  "inquiryNumber" TEXT NOT NULL,
  "userId" TEXT,
  "organizationName" TEXT NOT NULL,
  "organizationType" TEXT NOT NULL,
  "contactName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "requestType" TEXT NOT NULL,
  "participantCount" INTEGER,
  "eventDate" TIMESTAMP(3),
  "budget" INTEGER,
  "notes" TEXT,
  "adminNotes" TEXT,
  "status" "B2BInquiryStatus" NOT NULL DEFAULT 'NEW',
  "quotationNumber" TEXT,
  "quotedTotal" INTEGER,
  "validUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "b2b_inquiries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "b2b_quotation_items" (
  "id" TEXT NOT NULL,
  "inquiryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "discount" INTEGER NOT NULL DEFAULT 0,
  "subtotal" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "b2b_quotation_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "b2b_inquiries_inquiryNumber_key" ON "b2b_inquiries"("inquiryNumber");
CREATE UNIQUE INDEX "b2b_inquiries_quotationNumber_key" ON "b2b_inquiries"("quotationNumber");
CREATE INDEX "b2b_inquiries_status_createdAt_idx" ON "b2b_inquiries"("status", "createdAt");
CREATE INDEX "b2b_inquiries_email_idx" ON "b2b_inquiries"("email");
CREATE INDEX "b2b_inquiries_organizationName_idx" ON "b2b_inquiries"("organizationName");
CREATE INDEX "b2b_quotation_items_inquiryId_idx" ON "b2b_quotation_items"("inquiryId");

ALTER TABLE "b2b_inquiries" ADD CONSTRAINT "b2b_inquiries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "b2b_quotation_items" ADD CONSTRAINT "b2b_quotation_items_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "b2b_inquiries"("id") ON DELETE CASCADE ON UPDATE CASCADE;
