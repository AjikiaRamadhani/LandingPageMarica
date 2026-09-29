import { PrismaClient } from "@/app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Saat schema/client digenerate ulang dalam mode development, Next.js dapat
// mempertahankan instance lama di globalThis. Pastikan cache tersebut sudah
// memiliki delegate yang ditambahkan oleh schema booking terbaru.
const cachedPrisma = globalForPrisma.prisma;
const hasBookingDelegates =
  cachedPrisma &&
  typeof cachedPrisma.playpassBooking !== "undefined" &&
  typeof cachedPrisma.tableReservation !== "undefined";

export const prisma =
  (hasBookingDelegates ? cachedPrisma : undefined) ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
