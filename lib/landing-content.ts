/**
 * Konten landing page yang tidak membutuhkan CMS/database.
 * Perubahan copy cukup dilakukan di file ini, sedangkan data transaksi tetap
 * berada di database.
 */
export const landingCompany = {
  id: "static-company",
  name: "Marica",
  tagline: "Platform edukasi calistung terbaik untuk anak-anak Indonesia",
  description: "Marica Experience Store menghadirkan pengalaman belajar keluarga berbasis phygital.",
  phone: "+62 858 7045 9329",
  email: "pt.sebangku@gmail.com",
  instagram: "@kids.marica",
  tiktok: "@kids.marica",
  youtube: "@kids.marica",
  website: "toko.marica.id",
  logoUrl: "/images/logo.png",
  address: "Jl. Bakungan No.10A, Bakungan, Wedomartani, Kec. Ngemplak, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55584",
} as const;

export const landingHero = {
  id: "static-hero",
  headline: "Ciptakan Momen Belajar Ceria dan Bermakna Bersama Si Kecil Setiap Hari",
  subheadline: "Bingung mencari aktivitas bermanfaat untuk anak? Dari keseruan area bermain fisik, workshop akhir pekan, hingga paket edukasi rutin di rumah, Marica siap mendampingi tiap tahapan tumbuh kembang anak Anda.",
  imageUrl: "/images/hero-character.png",
  ctaText: "Eksplor Serunya Marica",
  ctaLink: "/belanja",
  badges: [
    { id: "board-game", label: "Board Game", icon: "dice", order: 1 },
    { id: "playpass", label: "Playpass", icon: "ticket", order: 2 },
    { id: "workshop", label: "Workshop", icon: "pencil", order: 3 },
    { id: "edu-kit", label: "Edu Kit", icon: "box", order: 4 },
  ],
} as const;

export const landingStatistics = [
  { id: "families", label: "Keluarga", value: "5000+", icon: "users", order: 1 },
  { id: "rating", label: "Rating Review", value: "4.9/5", icon: "star", order: 2 },
  { id: "activities", label: "Aktivitas", value: "100+", icon: "box", order: 3 },
] as const;

export const landingPainPoints = [
  { id: "pain-1", title: "Bingung Mau Ajak Anak Main ke Mana Lagi?", description: "Bosan dengan tempat rekreasi yang itu-itu saja dan cuma bikin anak muter-muter tanpa dapat manfaat atau stimulasi belajar yang berarti.", imageUrl: "/images/problemkids1.png", icon: null, order: 1 },
  { id: "pain-2", title: "Habis Ide Bikin Aktivitas Seru di Rumah", description: "Pengen banget dampingi anak main yang kreatif dan melatih logika, tapi sering kehabisan ide, bingung cari bahan mainnya, dan nggak ada waktu buat ngerancang sendiri dari nol.", imageUrl: "/images/problemkids2.png", icon: null, order: 2 },
  { id: "pain-3", title: "Mainan Anak Cuma Jadi Pajangan & Gampang Bikin Bosan", description: "Sudah beli banyak mainan, tapi cuma dimainkan sekali-dua kali lalu ditinggal begitu saja karena kurang interaktif dan nggak ada alur permainan yang seru untuk dimainkan bareng.", imageUrl: "/images/problemkids3.png", icon: null, order: 3 },
] as const;

export const landingBenefits = [
  { id: "benefit-1", category: "LOGIKA & KREATIVITAS", icon: "💡", title: "Bermain Sambil Melatih Logika & Kreativitas", description: "Anak-anak diajak berpikir kritis, memecahkan masalah, dan mengasah imajinasi lewat ratusan board game pilihan, buku interaktif, dan workshop sains serta kriya (craft kit).", imageUrl: "/images/benefit1.png", tags: ["Board Game", "Buku Interaktif", "Workshop", "Craft Kit"], order: 1 },
  { id: "benefit-2", category: "FAMILY BONDING", icon: "🤝", title: "Menguatkan Bonding Ibu & Anak", description: "Menciptakan quality time yang hangat dan penuh tawa bersama keluarga melalui sesi bermain meja (Table-fee) dan kelas edukasi interaktif.", imageUrl: "/images/benefit2.png", tags: ["Quality Time", "Kelas Edukasi"], order: 2 },
  { id: "benefit-3", category: "EDU-RECREATION", icon: "🎉", title: "Rekreasi Seru yang Berbobot Edukasi", description: "Alternatif tempat main fisik (Playpass) yang tidak hanya menyenangkan, tetapi juga aman, nyaman, dan mendukung perkembangan karakter serta sosialisasi anak.", imageUrl: "/images/benefit3.png", tags: ["Playpass", "Aman", "Sosialisasi", "Karakter Positif"], order: 3 },
  { id: "benefit-4", category: "HOME LEARNING", icon: "📦", title: "Praktis! Inspirasi Main Tanpa Ribet di Rumah", description: "Lewat layanan Edu-Kit & Langganan Bulanan, Bunda tak perlu pusing lagi memikirkan ide permainan kreatif—bahan dan panduan aktivitas langsung dikirim rapi ke rumah.", imageUrl: "/images/benefit4.png", tags: ["Edu Kit", "Langganan", "Aktivitas Rumah", "Panduan"], order: 4 },
  { id: "benefit-5", category: "HOLISTIC SUPPORT", icon: "🏠", title: "Dukungan Tumbuh Kembang Terpadu", description: "Menyediakan wadah sharing session / parenting class untuk orang tua, paket perayaan ulang tahun edukatif, hingga pelatihan media ajar untuk guru dan sekolah.", imageUrl: "/images/benefit5.png", tags: ["Parenting Class", "Birthday Package", "Pelatihan Guru", "Sekolah"], order: 5 },
] as const;

export const landingTestimonials = [
  { id: "testimonial-1", customerName: "Bunda Sarah Melati", role: "Ibu Rumah Tangga & Ibu dari 2 Anak", avatarUrl: "/images/testimoni1.png", message: "Akhirnya ketemu tempat main yang bikin anak betah berjam-jam tanpa perlu main HP! Tempatnya bersih, pilihan board game-nya banyak banget, dan stafnya telaten ngajarin cara mainnya. Jadi punya tempat quality time favorit baru bareng anak di akhir pekan.", order: 1 },
  { id: "testimonial-2", customerName: "Bunda Anita Rahma, S.T.", role: "Ibu Bekerja & Penggemar Edukasi Anak", avatarUrl: "/images/testimoni2.png", message: "Workshop sains dan kriya mingguan di Marica selalu bikin si kecil antusias! Materi belajar yang biasanya membosankan di sekolah, di sini malah disajikan seru banget lewat praktik langsung. Sepulang dari workshop, anaknya makin kritis dan kreatif.", order: 2 },
  { id: "testimonial-3", customerName: "Bunda Citra Kirana", role: "Ibu Bekerja & Pelanggan Edu-Kit Bulanan", avatarUrl: "/images/testimoni3.png", message: "Jujur sebagai working mom, saya sering kehabisan waktu dan ide buat ngerancang permainan edukatif di rumah. Berlangganan Edu-Kit Marica bener-bener menyelamatkan! Tiap bulan tinggal tunggu paket datang, semua bahan & panduannya sudah lengkap dan siap pakai.", order: 3 },
  { id: "testimonial-4", customerName: "Bunda Maya Indah", role: "Content Creator & Pegiat Parenting", avatarUrl: "/images/testimoni4.png", message: "Koleksi buku cerita dan edugame dari Marica desainnya bagus-bagus banget dan alur permainannya edukatif. Anak saya jadi lebih cepat paham konsep logika sederhana lewat cara yang menyenangkan. Recommended banget buat koleksi di rumah!", order: 4 },
  { id: "testimonial-5", customerName: "Ibu Ratna Dewi, S.Pd.", role: "Kepala Sekolah & Pendidik PAUD/TK", avatarUrl: "/images/testimoni5.png", message: "Siswa-siswi kami sangat antusias saat ikutan acara kunjungan dan pelatihan media ajar edugame dari Marica. Konsep belajar sambil bermainnya sangat pas untuk membantu anak-anak memahami materi dengan lebih cepat dan ceria!", order: 5 },
] as const;
