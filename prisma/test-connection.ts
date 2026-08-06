import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
    const company = await prisma.companyProfile.findFirst();
    const heroCount = await prisma.heroSection.count();
    const benefitCount = await prisma.benefit.count();

    console.log("Company profile:", company?.name);
    console.log("Hero sections:", heroCount);
    console.log("Benefits:", benefitCount);
    console.log("✅ lib/prisma.ts jalan normal, koneksi ke database sukses.");
}

main()
    .catch((e) => {
        console.error("❌ Ada error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });