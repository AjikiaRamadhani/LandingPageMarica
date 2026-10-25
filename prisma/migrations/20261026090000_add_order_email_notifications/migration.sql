ALTER TABLE "orders"
ADD COLUMN "paymentEmailSentAt" TIMESTAMP(3),
ADD COLUMN "expirationEmailSentAt" TIMESTAMP(3);
