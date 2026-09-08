-- CreateEnum
CREATE TYPE "EventBookingStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('ACTIVE', 'CHECKED_IN', 'CANCELLED');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "benefits" TEXT[],
    "imageUrl" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "locationName" TEXT NOT NULL,
    "locationAddress" TEXT,
    "quota" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_bookings" (
    "id" TEXT NOT NULL,
    "bookingNumber" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "status" "EventBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "midtransOrderId" TEXT,
    "midtransTransactionId" TEXT,
    "midtransSnapToken" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tickets" (
    "id" TEXT NOT NULL,
    "ticketCode" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "participantName" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'ACTIVE',
    "checkedInAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printables" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "ageMin" INTEGER,
    "ageMax" INTEGER,
    "thumbnailUrl" TEXT,
    "fileUrl" TEXT NOT NULL,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "printables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printable_leads" (
    "id" TEXT NOT NULL,
    "printableId" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "childAge" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "printable_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_slug_key" ON "events"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "event_bookings_bookingNumber_key" ON "event_bookings"("bookingNumber");

-- CreateIndex
CREATE UNIQUE INDEX "event_bookings_midtransOrderId_key" ON "event_bookings"("midtransOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "event_tickets_ticketCode_key" ON "event_tickets"("ticketCode");

-- CreateIndex
CREATE UNIQUE INDEX "event_tickets_qrToken_key" ON "event_tickets"("qrToken");

-- CreateIndex
CREATE UNIQUE INDEX "printables_slug_key" ON "printables"("slug");

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_bookings" ADD CONSTRAINT "event_bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tickets" ADD CONSTRAINT "event_tickets_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "event_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "printable_leads" ADD CONSTRAINT "printable_leads_printableId_fkey" FOREIGN KEY ("printableId") REFERENCES "printables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "printable_leads" ADD CONSTRAINT "printable_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
