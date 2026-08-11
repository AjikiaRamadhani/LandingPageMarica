import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Bersihin data lama
  await prisma.testimonial.deleteMany();
  await prisma.heroBadge.deleteMany();
  await prisma.heroSection.deleteMany();
  await prisma.statistic.deleteMany();
  await prisma.painPoint.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.howItWorksStep.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.companyProfile.deleteMany();

  // 1. Company Profile
  await prisma.companyProfile.create({
    data: {
      name: "Marica",
      tagline: "Platform edukasi calistung terbaik untuk anak-anak Indonesia",
      description:
        "Marica Experience Store menghadirkan pengalaman belajar keluarga berbasis phygital.",
      phone: "+62 822 2149 1429",
      email: "pt.sebangku@gmail.com",
      instagram: "@kids.marica",
      tiktok: "@kids.marica",
      youtube: "@kids.marica",
      website: "www.marica.id",
    },
  });

  // 2. Hero Section + Badges
  await prisma.heroSection.create({
    data: {
      headline: "Ciptakan Momen Belajar Ceria dan Bermakna Bersama Si Kecil Setiap Hari",
      subheadline:
        "Bingung mencari aktivitas bermanfaat untuk anak? Dari keseruan area bermain fisik, workshop akhir pekan, hingga paket edukasi rutin di rumah, Marica siap mendampingi tiap tahapan tumbuh kembang anak Anda.",
      imageUrl: "/images/hero-character.png",
      ctaText: "Eksplor Serunya Marica",
      ctaLink: "#program",
      badges: {
        create: [
          { label: "Board Game", icon: "dice", order: 1 },
          { label: "Playpass", icon: "ticket", order: 2 },
          { label: "Workshop", icon: "pencil", order: 3 },
          { label: "Edu Kit", icon: "box", order: 4 },
        ],
      },
    },
  });

  // 3. Statistics (hero)
  await prisma.statistic.createMany({
    data: [
      { label: "Keluarga", value: "5000+", icon: "users", order: 1 },
      { label: "Rating Review", value: "4.9/5", icon: "star", order: 2 },
      { label: "Aktivitas", value: "100+", icon: "box", order: 3 },
    ],
  });

  // 4. Pain Points (Problem)
  await prisma.painPoint.createMany({
    data: [
      {
        title: "Bingung Mau Ajak Anak Main ke Mana Lagi?",
        description:
          "Bosan dengan tempat rekreasi yang itu-itu saja dan cuma bikin anak muter-muter tanpa dapat manfaat atau stimulasi belajar yang berarti.",
        imageUrl: "/images/problem-playground.png",
        order: 1,
      },
      {
        title: "Habis Ide Bikin Aktivitas Seru di Rumah",
        description:
          "Pengen banget dampingi anak main yang kreatif dan melatih logika, tapi sering kehabisan ide, bingung cari bahan mainnya, dan nggak ada waktu buat ngerancang sendiri dari nol.",
        imageUrl: "/images/problem-athome.png",
        order: 2,
      },
      {
        title: "Mainan Anak Cuma Jadi Pajangan & Gampang Bikin Bosan",
        description:
          "Sudah beli banyak mainan, tapi cuma dimainkan sekali-dua kali lalu ditinggal begitu saja karena kurang interaktif dan nggak ada alur permainan yang seru untuk dimainkan bareng.",
        imageUrl: "/images/problem-bored.png",
        order: 3,
      },
    ],
  });

  // 7. Benefits ("Apa yang Didapatkan Bunda & Si Kecil?")
  await prisma.benefit.createMany({
    data: [
      {
        category: "LOGIKA & KREATIVITAS",
        icon: "💡",
        title: "Bermain Sambil Melatih Logika & Kreativitas",
        description:
          "Anak-anak diajak berpikir kritis, memecahkan masalah, dan mengasah imajinasi lewat ratusan board game pilihan, buku interaktif, dan workshop sains serta kriya (craft kit).",
        imageUrl: "/images/manfaat1.png",
        tags: ["Board Game", "Buku Interaktif", "Workshop", "Craft Kit"],
        order: 1,
      },
      {
        category: "FAMILY BONDING",
        icon: "🤝",
        title: "Menguatkan Bonding Ibu & Anak",
        description:
          "Menciptakan quality time yang hangat dan penuh tawa bersama keluarga melalui sesi bermain meja (Table-fee) dan kelas edukasi interaktif.",
        imageUrl: "/images/manfaat2.png",
        tags: ["Quality Time", "Table Fee", "Kelas Edukasi"],
        order: 2,
      },
      {
        category: "EDU-RECREATION",
        icon: "🎉",
        title: "Rekreasi Seru yang Berbobot Edukasi",
        description:
          "Alternatif tempat main fisik (Playpass) yang tidak hanya menyenangkan, tetapi juga aman, nyaman, dan mendukung perkembangan karakter serta sosialisasi anak.",
        imageUrl: "/images/manfaat3.png",
        tags: ["Playpass", "Aman", "Sosialisasi", "Karakter Positif"],
        order: 3,
      },
      {
        category: "HOME LEARNING",
        icon: "📦",
        title: "Praktis! Inspirasi Main Tanpa Ribet di Rumah",
        description:
          "Lewat layanan Edu-Kit & Langganan Bulanan, Bunda tak perlu pusing lagi memikirkan ide permainan kreatif—bahan dan panduan aktivitas langsung dikirim rapi ke rumah.",
        imageUrl: "/images/mkids-marica4.png",
        tags: ["Edu Kit", "Langganan", "Aktivitas Rumah", "Panduan"],
        order: 4,
      },
      {
        category: "HOLISTIC SUPPORT",
        icon: "🏠",
        title: "Dukungan Tumbuh Kembang Terpadu",
        description:
          "Menyediakan wadah sharing session / parenting class untuk orang tua, paket perayaan ulang tahun edukatif, hingga pelatihan media ajar untuk guru dan sekolah.",
        imageUrl: "/images/manfaat5.png",
        tags: ["Parenting Class", "Birthday Package", "Pelatihan Guru", "Sekolah"],
        order: 5,
      },
    ],
  });

  // 8. How It Works Steps
  await prisma.howItWorksStep.createMany({
    data: [
      {
        stepNumber: 1,
        title: "Pilih Aktivitas Favorit",
        description:
          "Jelajahi Pilihan Bermain & Belajar > Pilih pengalaman yang cocok untuk Si Kecil melalui situs web kami—mulai dari main di area Playpass, ikutan Workshop akhir pekan, atau berlangganan Edu-Kit bulanan untuk di rumah.",
        order: 1,
      },
      {
        stepNumber: 2,
        title: "Datang Lansung atau Terima di Rumah",
        description:
          "Fleksibel Sesuai Kebutuhan Bunda > Datang langsung ke toko fisik Marica Experience Store untuk seru-seruan bersama, atau cukup duduk manis di rumah menunggu paket Edu-Kit dikirim langsung ke depan pintu.",
        order: 2,
      },
      {
        stepNumber: 3,
        title: "Nikmati Momen Belajar Ceria",
        description:
          "Lihat Si Kecil Tumbuh Makin Kreatif & Cerdas > Nikmati momen quality time yang hangat, bebas pusing, dan penuh tawa saat melihat anak aktif mengeksplorasi imajinasi serta logikanya lewat cara yang menyenangkan.",
        order: 3,
      },
    ],
  });

  // 9. Testimoni
  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "Bunda Sarah Melati",
        role: "Ibu Rumah Tangga & Ibu dari 2 Anak",
        message:
          "Akhirnya ketemu tempat main yang bikin anak betah berjam-jam tanpa perlu main HP! Tempatnya bersih, pilihan board game-nya banyak banget, dan stafnya telaten ngajarin cara mainnya. Jadi punya tempat quality time favorit baru bareng anak di akhir pekan.",
        order: 1,
      },
      {
        customerName: "Bunda Anita Rahma, S.T.",
        role: "Ibu Bekerja & Penggemar Edukasi Anak",
        message:
          "Workshop sains dan kriya mingguan di Marica selalu bikin si kecil antusias! Materi belajar yang biasanya membosankan di sekolah, di sini malah disajikan seru banget lewat praktik langsung. Sepulang dari workshop, anaknya makin kritis dan kreatif.",
        order: 2,
      },
      {
        customerName: "Bunda Citra Kirana",
        role: "Ibu Bekerja & Pelanggan Edu-Kit Bulanan",
        message:
          "Jujur sebagai working mom, saya sering kehabisan waktu dan ide buat ngerancang permainan edukatif di rumah. Berlangganan Edu-Kit Marica bener-bener menyelamatkan! Tiap bulan tinggal tunggu paket datang, semua bahan & panduannya sudah lengkap dan siap pakai.",
        order: 3,
      },
      {
        customerName: "Bunda Maya Indah",
        role: "Content Creator & Pegiat Parenting",
        message:
          "Koleksi buku cerita dan edugame dari Marica desainnya bagus-bagus banget dan alur permainannya edukatif. Anak saya jadi lebih cepat paham konsep logika sederhana lewat cara yang menyenangkan. Recommended banget buat koleksi di rumah!",
        order: 4,
      },
      {
        customerName: "Ibu Ratna Dewi, S.Pd.",
        role: "Kepala Sekolah & Pendidik PAUD/TK",
        message:
          "Siswa-siswi kami sangat antusias saat ikutan acara kunjungan dan pelatihan media ajar edugame dari Marica. Konsep belajar sambil bermainnya sangat pas untuk membantu anak-anak memahami materi dengan lebih cepat dan ceria!",
        order: 5,
      },
    ],
  });

  // 14. FAQ
  await prisma.faq.createMany({
    data: [
      {
        question: "Untuk anak usia berapa saja aktivitas dan produk di Marica?",
        answer: "Aktivitas dan produk Marica dirancang khusus untuk anak usia 2 hingga 12 tahun, mulai dari balita (pendampingan orang tua) hingga anak usia sekolah dasar.",
        order: 1,
      },
      {
        question: "Apakah harus reservasi terlebih dahulu jika ingin datang main ke Marica Experience Store?",
        answer: "Bunda bisa langsung datang (walk-in) untuk area bermain (Playpass) dan sewa meja board game. Namun, untuk Weekend Workshop dan kelas khusus, kami menyarankan reservasi terlebih dahulu agar kepastian slot tempat terjamin.",
        order: 2,
      },
      {
        question: "Apa isi dari paket berlangganan Edu-Kit bulanan Marica?",
        answer: "Paket Edu-Kit berisi kotak aktivitas mandiri terstruktur (craft kit, permainan logika/sains, atau board game) yang dilengkapi panduan belajar interaktif dan dikirim rutin langsung ke rumah setiap bulan.",
        order: 3,
      },
      {
        question: "Apakah tempatnya nyaman dan aman untuk balita dan keluarga?",
        answer: "Sangat aman dan nyaman! Seluruh area bermain fisik, fasilitas meja, dan alat peraga kami selalu dibersihkan secara berkala, ramah anak, serta didampingi oleh staf/fasilitator yang telaten.",
        order: 4,
      },
      {
        question: "Bisakah Marica menyelenggarkan acara sekolah, privat, atau ulang tahun?",
        answer: "Sangat bisa! Kami menyediakan paket perayaan ulang tahun edukatif, penyewaan seluruh area toko (space renting), hingga program pelatihan media ajar edugame untuk guru dan sekolah.",
        order: 5,
      },
    ],
  });

  console.log("Seed selesai ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });