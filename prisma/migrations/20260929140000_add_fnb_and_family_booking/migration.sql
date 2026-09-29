CREATE TYPE "FnbOrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED');

CREATE TABLE "fnb_products" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fnb_products_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fnb_order_items" (
  "id" TEXT NOT NULL,
  "fnbProductId" TEXT NOT NULL,
  "playpassBookingId" TEXT,
  "tableReservationId" TEXT,
  "quantity" INTEGER NOT NULL,
  "unitPrice" INTEGER NOT NULL,
  "subtotal" INTEGER NOT NULL,
  "status" "FnbOrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fnb_order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "booking_participants" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "age" INTEGER,
  "relationship" TEXT,
  "playpassBookingId" TEXT,
  "tableReservationId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "booking_participants_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fnb_products_isActive_idx" ON "fnb_products"("isActive");
CREATE INDEX "fnb_order_items_playpassBookingId_idx" ON "fnb_order_items"("playpassBookingId");
CREATE INDEX "fnb_order_items_tableReservationId_idx" ON "fnb_order_items"("tableReservationId");
CREATE INDEX "fnb_order_items_status_createdAt_idx" ON "fnb_order_items"("status", "createdAt");
CREATE INDEX "booking_participants_playpassBookingId_idx" ON "booking_participants"("playpassBookingId");
CREATE INDEX "booking_participants_tableReservationId_idx" ON "booking_participants"("tableReservationId");

ALTER TABLE "fnb_order_items" ADD CONSTRAINT "fnb_order_items_fnbProductId_fkey" FOREIGN KEY ("fnbProductId") REFERENCES "fnb_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "fnb_order_items" ADD CONSTRAINT "fnb_order_items_playpassBookingId_fkey" FOREIGN KEY ("playpassBookingId") REFERENCES "playpass_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fnb_order_items" ADD CONSTRAINT "fnb_order_items_tableReservationId_fkey" FOREIGN KEY ("tableReservationId") REFERENCES "table_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_playpassBookingId_fkey" FOREIGN KEY ("playpassBookingId") REFERENCES "playpass_bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "booking_participants" ADD CONSTRAINT "booking_participants_tableReservationId_fkey" FOREIGN KEY ("tableReservationId") REFERENCES "table_reservations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
