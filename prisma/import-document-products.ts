import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "WORKSHEET", slug: "worksheet", colorTag: "green", order: 1 },
  { name: "ENSIKLOPEDIA", slug: "ensiklopedia", colorTag: "blue", order: 2 },
  {
    name: "Buku Rasa Majalah",
    slug: "buku-rasa-majalah",
    colorTag: "orange",
    order: 3,
  },
  {
    name: "Cerita Bergambar Marica",
    slug: "cerita-bergambar-marica",
    colorTag: "purple",
    order: 4,
  },
] as const;

const products = [
  ["Worksheet Ramadhan Activity for Kids", "worksheet-ramadhan-activity-for-kids", "worksheet", 49000, "Lembar kerja interaktif bertema Ramadhan dengan jurnal ibadah harian, aktivitas mewarnai, labirin, dan tantangan kebaikan untuk membantu anak memahami makna puasa dengan cara yang menyenangkan."],
  ["Buku Ensiklopedia Bangun Ruang", "buku-ensiklopedia-bangun-ruang", "ensiklopedia", 49000, "Buku visual interaktif untuk membantu anak memahami konsep bangun ruang dan membangun fondasi matematika dengan cara yang nyata dan menyenangkan."],
  ["Buku Ensiklopedia Mengenal Bilangan", "buku-ensiklopedia-mengenal-bilangan", "ensiklopedia", 29000, "Buku visual dengan ilustrasi dan penjelasan interaktif untuk mengenalkan angka kepada anak melalui petualangan belajar yang seru dan mudah dipahami."],
  ["Buku Ensiklopedia Belajar Panjang & Perkalian", "buku-ensiklopedia-belajar-panjang-perkalian", "ensiklopedia", 29000, "Buku visual yang mengubah konsep panjang dan perkalian menjadi aktivitas belajar yang seru sehingga anak lebih mudah memahami logika hitungan."],
  ["Terbang Ke Luar Angkasa", "terbang-ke-luar-angkasa", "buku-rasa-majalah", 29000, "Majalah edukasi visual berisi fakta astronomi dan ilustrasi memukau yang mengajak anak menjelajahi galaksi dan mengenal dunia luar angkasa."],
  ["Penemuan Robot Masa Depan", "penemuan-robot-masa-depan", "buku-rasa-majalah", 29000, "Majalah visual tentang inovasi robotika yang memicu kreativitas dan imajinasi anak untuk menjadi penemu hebat di masa depan."],
  ["Kreasi Bangun Ruang", "kreasi-bangun-ruang", "buku-rasa-majalah", 29000, "Buku aktivitas interaktif untuk melatih kecerdasan spasial anak melalui kegiatan melipat, menempel, dan merakit bentuk tiga dimensi."],
  ["Ayo Mengenal Anatomi", "ayo-mengenal-anatomi", "buku-rasa-majalah", 29000, "Majalah visual yang mengenalkan organ dan sistem tubuh manusia melalui ilustrasi detail agar belajar biologi terasa seperti petualangan."],
  ["Ibadah Ke Tanah Suci", "ibadah-ke-tanah-suci", "buku-rasa-majalah", 29000, "Majalah visual interaktif yang mengenalkan tata cara haji dan umrah serta menanamkan rasa cinta kepada Baitullah sejak dini."],
  ["Petualangan Di Dunia Dinosaurus", "petualangan-di-dunia-dinosaurus", "buku-rasa-majalah", 29000, "Majalah visual berisi fakta seru dan ilustrasi dinosaurus yang mengajak anak menjelajahi dunia prasejarah."],
  ["Jelajahi Dunia Dengan Transportasi (Bonus Video)", "jelajahi-dunia-dengan-transportasi", "buku-rasa-majalah", 29000, "Majalah visual tentang berbagai kendaraan di dunia yang dilengkapi bonus video interaktif untuk membuat pengalaman belajar semakin nyata."],
  ["Memilih Keputusan Terbaik", "memilih-keputusan-terbaik", "cerita-bergambar-marica", 19000, "Cerita visual yang melatih kemampuan berpikir kritis dan karakter anak melalui skenario pengambilan keputusan dalam kehidupan sehari-hari."],
  ["Pemilihan Hewan Terbaik (Bonus Video)", "pemilihan-hewan-terbaik", "cerita-bergambar-marica", 19000, "Cerita visual tentang keunikan fauna yang dilengkapi bonus video interaktif untuk membantu anak mengenal karakter dan kelebihan setiap hewan."],
  ["Sahabat Baru dari Zaman Purba", "sahabat-baru-dari-zaman-purba", "cerita-bergambar-marica", 19000, "Cerita visual tentang persahabatan dengan makhluk purbakala yang memicu imajinasi dan empati anak."],
  ["CIT CIT CIT", "cit-cit-cit", "cerita-bergambar-marica", 19000, "Kisah Mari dan Caca tentang mengembalikan anak burung ke sarangnya sekaligus mengajarkan kasih sayang dan kepedulian terhadap makhluk hidup."],
  ["Kunjungan ke Rumah Bibi Megi (Bonus Video)", "kunjungan-ke-rumah-bibi-megi", "cerita-bergambar-marica", 19000, "Cerita visual dengan bonus video yang mengajarkan etika bertamu dan kebersamaan melalui kisah keluarga yang ceria."],
  ["Petualangan Mari Menuju Rumah Jaja (Bonus Video)", "petualangan-mari-menuju-rumah-jaja", "cerita-bergambar-marica", 19000, "Cerita visual dengan bonus video yang melatih kemandirian dan kecerdasan spasial melalui rute perjalanan penuh warna."],
  ["Perjalanan Tarsius Kecil", "perjalanan-tarsius-kecil", "cerita-bergambar-marica", 19000, "Cerita visual tentang petualangan tarsius di hutan yang mengenalkan keajaiban satwa langka Indonesia dan pentingnya menjaga alam."],
  ["Merawat Bunga Matahari", "merawat-bunga-matahari", "cerita-bergambar-marica", 19000, "Cerita visual dengan panduan praktis yang mengajarkan tanggung jawab, cara menanam, dan kecintaan terhadap alam."],
] as const;

async function main() {
  const categoryIds = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: { ...category, isActive: true },
      create: { ...category, isActive: true },
    });
    categoryIds.set(category.slug, record.id);
  }

  for (const [name, slug, category, price, description] of products) {
    await prisma.product.upsert({
      where: { slug },
      update: {
        name,
        description,
        price,
        stock: 100,
        categoryId: categoryIds.get(category),
        isActive: true,
      },
      create: {
        name,
        slug,
        description,
        price,
        stock: 100,
        categoryId: categoryIds.get(category),
        highlights: [],
        isActive: true,
      },
    });
  }

  console.log(`Imported ${products.length} products with stock 100.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
