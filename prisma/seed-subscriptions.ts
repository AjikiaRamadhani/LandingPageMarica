import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

const plans = [
  {
    slug: "edu-kit-bulanan",
    name: "Edu-Kit Bulanan",
    description: "Paket aktivitas edukatif yang dikirim setiap bulan.",
    price: 199000,
    interval: "MONTHLY" as const,
  },
  {
    slug: "edu-kit-triwulan",
    name: "Edu-Kit Triwulan",
    description: "Paket aktivitas edukatif untuk tiga bulan dengan harga spesial.",
    price: 549000,
    interval: "QUARTERLY" as const,
  },
];

async function main() {
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { slug: plan.slug },
      update: { ...plan, isActive: true },
      create: { ...plan, isActive: true },
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
