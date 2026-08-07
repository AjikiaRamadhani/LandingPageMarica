import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Bersihin data lama biar seed bisa dijalanin ulang tanpa duplikat
  await prisma.testimonial.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.heroBadge.deleteMany();
  await prisma.heroSection.deleteMany();
  await prisma.statistic.deleteMany();
  await prisma.painPoint.deleteMany();
  await prisma.solution.deleteMany();
  await prisma.learningCategory.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.benefit.deleteMany();
  await prisma.howItWorksStep.deleteMany();
  await prisma.trustStat.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.programDetail.deleteMany();
  await prisma.program.deleteMany();
  await prisma.event.deleteMany();
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
        "Bingung mencari aktivitas bermanfaat untuk anak? Dari area bermain fisik, workshop akhir pekan, hingga Edu-Kit bulanan, Marica hadir menemani perjalanan belajar keluarga.",
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

  // 4. Pain Points (Problem) - sekarang dengan imageUrl asli
  await prisma.painPoint.createMany({
    data: [
      {
        title: "Bingung Mau Ajak Anak Main?",
        description:
          "Bosan dengan tempat rekreasi yang itu-itu saja dan cuma bikin anak muter-muter tanpa dapat manfaat atau stimulasi belajar yang berarti.",
        imageUrl: "/images/problem-playground.png",
        order: 1,
      },
      {
        title: "Habis Ide Aktivitas di Rumah",
        description:
          "Pengen banget dampingi anak main yang kreatif dan melatih logika, tapi sering kehabisan ide, bingung cari bahan mainnya, dan nggak ada waktu buat ngerancang sendiri.",
        imageUrl: "/images/problem-athome.png",
        order: 2,
      },
      {
        title: "Mainan Cepat Membosankan",
        description:
          "Sudah beli banyak mainan, tapi cuma dimainkan sekali-dua kali lalu ditinggal begitu saja karena kurang interaktif dan nggak ada alur permainan yang seru untuk dimainkan bareng.",
        imageUrl: "/images/problem-bored.png",
        order: 3,
      },
    ],
  });

  // 5. Learning Categories ("Mengapa Memilih Marica?") - dengan imageUrl asli
  await prisma.learningCategory.createMany({
    data: [
      {
        name: "Story Telling",
        colorTag: "purple",
        imageUrl: "/images/why-story-telling.png",
        order: 1,
      },
      {
        name: "Play Based Learning",
        colorTag: "teal",
        imageUrl: "/images/why-play-based-learning.png",
        order: 2,
      },
      {
        name: "Problem Solving",
        colorTag: "pink",
        imageUrl: "/images/why-problem-solving.png",
        order: 3,
      },
    ],
  });

  // 6. Subjects ("Apa yang Ingin Dipelajari Si Kecil?") - dengan mascotImageUrl asli
  await prisma.subject.createMany({
    data: [
      {
        title: "Matematika",
        colorTag: "purple",
        mascotImageUrl: "/images/program-matematika-mascot.png",
        cognitiveDomainTags: ["Knowing", "Applying", "Reasoning"],
        contentDomainItems: [
          "Number & Operation",
          "Algebra",
          "Geometry",
          "Measurement",
          "Data Analysis & Probability",
        ],
        order: 1,
      },
      {
        title: "Bahasa",
        colorTag: "pink",
        mascotImageUrl: "/images/program-bahasa-mascot.png",
        cognitiveDomainTags: ["Pre Reading", "Reading", "Post Reading"],
        contentDomainItems: [
          "Six Syllables",
          "A I U E O",
          "Sound Recognition",
          "Reading Stories",
          "Upper & Lower Letters",
        ],
        order: 2,
      },
    ],
  });

  // 7. Benefits ("Apa yang Didapatkan Bunda & Si Kecil?") - dengan imageUrl asli
  await prisma.benefit.createMany({
    data: [
      {
        category: "LOGIKA & KREATIVITAS",
        icon: "💡",
        title: "Bermain Sambil Melatih Logika & Kreativitas",
        description:
          "Anak-anak diajak berpikir kritis, memecahkan masalah, dan mengasah imajinasi melalui board game, buku interaktif, workshop sains, dan craft kit.",
        imageUrl: "/images/benefit-logika-kreativitas.png",
        tags: ["Board Game", "Buku Interaktif", "Workshop", "Craft Kit"],
        order: 1,
      },
      {
        category: "FAMILY BONDING",
        icon: "🤝",
        title: "Menguatkan Bonding Ibu & Anak",
        description:
          "Menciptakan quality time yang hangat dan menyenangkan melalui sesi bermain meja serta kelas edukasi interaktif.",
        imageUrl: "/images/benefit-family-bonding.png",
        tags: ["Quality Time", "Table Fee", "Kelas Edukasi"],
        order: 2,
      },
      {
        category: "EDU-RECREATION",
        icon: "🎉",
        title: "Rekreasi Seru yang Berbobot Edukasi",
        description:
          "Playpass menghadirkan pengalaman bermain yang aman, nyaman, dan mendukung perkembangan karakter anak.",
        imageUrl: "/images/benefit-edu-recreation.png",
        tags: ["Playpass", "Aman", "Sosialisasi", "Karakter Positif"],
        order: 3,
      },
      {
        category: "HOME LEARNING",
        icon: "📦",
        title: "Praktis! Inspirasi Main Tanpa Ribet di Rumah",
        description:
          "Edu-Kit bulanan menghadirkan aktivitas kreatif lengkap langsung ke rumah dengan panduan yang mudah diikuti.",
        imageUrl: "/images/benefit-home-learning.png",
        tags: ["Edu Kit", "Langganan", "Aktivitas Rumah", "Panduan"],
        order: 4,
      },
      {
        category: "HOLISTIC SUPPORT",
        icon: "🏠",
        title: "Dukungan Tumbuh Kembang Terpadu",
        description:
          "Parenting class, ulang tahun edukatif, dan pelatihan guru untuk mendukung tumbuh kembang anak secara menyeluruh.",
        imageUrl: "/images/benefit-holistic-support.png",
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
        title: "Pilih Aktivitas",
        description:
          "Jelajahi berbagai modul pembelajaran dan pilih aktivitas yang paling sesuai dengan minat anak.",
        order: 1,
      },
      {
        stepNumber: 2,
        title: "Datang atau Terima Kit",
        description:
          "Kunjungi Experience Store kami atau tunggu Edu Kit premium kami tiba langsung di depan pintu rumah Anda.",
        order: 2,
      },
      {
        stepNumber: 3,
        title: "Nikmati Momen Belajar",
        description:
          "Ciptakan momen berharga saat mendampingi anak bermain sambil belajar dengan materi berkualitas tinggi.",
        order: 3,
      },
    ],
  });

  // 9a. Testimoni UMUM ("Apa Kata Bunda?") - standalone, activityId null, pakai field role
  await prisma.testimonial.createMany({
    data: [
      {
        customerName: "Bunda Sarah",
        role: "Ibu Rumah Tangga",
        message:
          "Marica benar-benar jadi penyelamat di akhir pekan! Si Kecil betah banget main board game dan workshop-nya sangat edukatif.",
        order: 1,
      },
      {
        customerName: "Bunda Maya",
        role: "Working Mom",
        message:
          "Edu-Kit bulanannya sangat membantu saya yang sibuk untuk tetap bisa memberikan aktivitas berkualitas di rumah.",
        order: 2,
      },
      {
        customerName: "Bunda Rina",
        role: "Guru PAUD",
        message:
          "Standar keamanannya luar biasa. Saya merasa tenang membiarkan anak bereksplorasi di Experience Store Marica.",
        order: 3,
      },
      {
        customerName: "Bunda Ani",
        role: "Entrepreneur",
        message:
          "Konsep phygital-nya keren banget. Anak belajar mandiri tapi tetap ada interaksi nyata.",
        order: 4,
      },
    ],
  });

  // 9b. Activities + nested Testimonials ("Aktivitas Seru di Marica")
  await prisma.activity.create({
    data: {
      title: "Area Bermain",
      description:
        "Akhirnya ketemu tempat main yang bikin anak betah berjam-jam tanpa perlu main HP! Tempatnya bersih, pilihan board game-nya banyak banget, dan stafnya telaten ngajarin cara mainnya. Jadi punya tempat quality time favorit baru bareng anak di akhir pekan.",
      order: 1,
      testimonials: {
        create: [{ customerName: "Bunda Sarah Melati", message: "Area Bermain", order: 1 }],
      },
    },
  });

  await prisma.activity.create({
    data: {
      title: "Weekend Workshop & Aktivitas Anak",
      description:
        "Workshop sains dan kriya mingguan di Marica selalu bikin si kecil antusias! Materi belajar yang biasanya membosankan di sekolah, di sini malah disajikan seru banget lewat praktik langsung. Sepulang dari workshop, anaknya makin kritis dan kreatif.",
      order: 2,
      testimonials: {
        create: [
          { customerName: "Bunda Anita Rahma, S.T.", message: "Weekend Workshop & Aktivitas Anak", order: 1 },
        ],
      },
    },
  });

  await prisma.activity.create({
    data: {
      title: "Edu-Kit & Langganan Bulanan",
      description:
        "Jujur sebagai working mom, saya sering kehabisan waktu dan ide buat ngerancang permainan edukatif di rumah. Berlangganan Edu-Kit Marica bener-bener menyelamatkan! Tiap bulan tinggal tunggu paket datang, semua bahan & panduannya sudah lengkap dan siap pakai.",
      order: 3,
      testimonials: {
        create: [{ customerName: "Bunda Citra Kirana", message: "Edu-Kit & Langganan Bulanan", order: 1 }],
      },
    },
  });

  await prisma.activity.create({
    data: {
      title: "Ritel Buku & Self-Published Edugames",
      description:
        "Jujur sebagai working mom, saya sering kehabisan waktu dan ide buat ngerancang permainan edukatif di rumah. Berlangganan Edu-Kit Marica bener-bener menyelamatkan! Tiap bulan tinggal tunggu paket datang, semua bahan & panduannya sudah lengkap dan siap pakai.",
      order: 4,
      testimonials: {
        create: [{ customerName: "Bunda Maya Indah", message: "Ritel Buku & Self-Published Edugames", order: 1 }],
      },
    },
  });

  await prisma.activity.create({
    data: {
      title: "Kemitraan Sekolah & Pelatihan Guru",
      description:
        "Siswa-siswi kami sangat antusias saat ikutan acara kunjungan dan pelatihan media ajar edugame dari Marica. Konsep belajar sambil bermainnya sangat pas untuk membantu anak-anak memahami materi dengan lebih cepat dan ceria!",
      order: 5,
      testimonials: {
        create: [{ customerName: "Ibu Ratna Dewi, S.Pd.", message: "Kemitraan Sekolah & Pelatihan Guru", order: 1 }],
      },
    },
  });

  // 10. Trust Stats ("Dipercaya oleh Mitra & Institusi Terkemuka")
  // order 1-2 = kartu angka, order 3 = kartu foto (imageUrl diisi), order 4 = kartu angka lagi
  await prisma.trustStat.createMany({
    data: [
      { value: "4 dari 5", label: "Tingkat kepuasan pelanggan", dotColor: "purple", order: 1 },
      { value: "90%", label: "Tingkat kepuasan pelanggan", dotColor: "pink", order: 2 },
      {
        label: "Tim Marica berkolaborasi dengan mitra",
        imageUrl: "/images/trust-team-photo.png",
        dotColor: "teal",
        order: 3,
      },
      {
        value: "100",
        label: "Validasi ahli untuk Marica Kit, yang mencakup kontribusi dari psikolog, guru, dan dosen.",
        dotColor: "teal",
        order: 4,
      },
    ],
  });

  // 11. Partners - 15 logo asli dari public/images/partners/
  await prisma.partner.createMany({
    data: Array.from({ length: 15 }, (_, i) => ({
      name: `Mitra Institusi ${i + 1}`,
      logoUrl: `/images/partners/logo-${i + 1}.png`,
      order: i + 1,
    })),
  });

  // 12. Programs + Program Details ("Detail Program")
  const program = await prisma.program.create({
    data: {
      name: "Program Marica",
      description:
        "Program Marica membantu anak menguasai Matematika & Bahasa dengan cara yang menyenangkan.",
      order: 1,
    },
  });

  await prisma.programDetail.createMany({
    data: [
      {
        title: "Event",
        description: "Free trial dengan kit belajar mingguan dan mentoring profesional",
        features: ["1 Kit pembelajaran per minggu", "Mentoring", "Workshop & acara"],
        ctaText: "Daftar Sekarang",
        order: 1,
        programId: program.id,
      },
      {
        title: "Olimpiade",
        description: "Program intensif persiapan lomba dengan bimbingan expert",
        features: ["24 kali pertemuan intensif", "30 kit pembelajaran premium", "Expert mentoring"],
        ctaText: "Daftar Sekarang",
        order: 2,
        programId: program.id,
      },
    ],
  });

  // 13. Events ("Event Kami")
  await prisma.event.createMany({
    data: [
      {
        title: "Serunya PlayDay: Marica X Oddish Family Hub Hadirkan Inovasi Dalam Bermain",
        excerpt: "Marica Kembali Menghadirkan Inovasi Dalam Bermain",
        category: "Event",
        eventDate: new Date("2025-09-08"),
        ctaText: "Lihat Selengkapnya",
        order: 1,
      },
      {
        title: "Serunya Trial Class Talking Dino Di TK Kikoku",
        excerpt: "Marica Kembali Menghadirkan Inovasi Dalam Bermain",
        category: "Event",
        eventDate: new Date("2025-09-04"),
        ctaText: "Lihat Selengkapnya",
        order: 2,
      },
      {
        title: "Marica Hadir Di KidsLand Galeria Mall: Meramaikan Akhir Pekan Ceria",
        excerpt: "Marica Kembali Hadir Menebarkan Semangat Kreativitas",
        category: "Event",
        eventDate: new Date("2025-09-17"),
        ctaText: "Lihat Selengkapnya",
        order: 3,
      },
    ],
  });

  // 14. FAQ (belum ada di desain, isi generic dulu - bisa diedit nanti)
  await prisma.faq.createMany({
    data: [
      {
        question: "Apa itu Marica Experience Store?",
        answer:
          "Marica adalah platform edukasi calistung berbasis phygital yang menggabungkan aktivitas bermain fisik, workshop, dan Edu-Kit bulanan untuk anak usia TK.",
        order: 1,
      },
      {
        question: "Untuk usia berapa program Marica ini?",
        answer: "Program calistung Marica dirancang khusus untuk anak usia TK.",
        order: 2,
      },
      {
        question: "Bagaimana cara mendaftar program Marica?",
        answer:
          "Kamu bisa klik tombol 'Eksplor Serunya Marica' atau 'Daftar Sekarang' di halaman program untuk mulai mendaftar.",
        order: 3,
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