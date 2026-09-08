// Data event/workshop untuk halaman Kalender Event & Workshop.
//
// Ini masih mock data lokal. Kalau company profile Navbar/Footer sudah
// ditarik dari /api/company, event ini sebaiknya juga ditarik dari API
// serupa (mis. /api/events) — tinggal ganti EVENTS di bawah dengan hasil
// fetch, tipe-tipe di bawah ini bisa dipakai apa adanya untuk shape-nya.

export type EventCategory = "workshop" | "parenting";

export type EventItem = {
  slug: string;
  category: EventCategory;
  title: string;
  /** ISO date, "YYYY-MM-DD" */
  date: string;
  timeStart: string;
  timeEnd: string;
  location: string;
  quota: number;
  quotaLeft: number;
  price: string;
  shortDescription: string;
  description: string[];
  agenda: { time: string; item: string }[];
  facilitator: {
    name: string;
    role: string;
  };
};

export const CATEGORY_LABEL: Record<EventCategory, string> = {
  workshop: "Weekend Workshop",
  parenting: "Sesi Parenting",
};

// Warna tag per kategori — dipetakan ke token brand yang sudah ada di
// globals.css, bukan warna baru.
export const CATEGORY_STYLE: Record<
  EventCategory,
  { bg: string; text: string; dot: string }
> = {
  workshop: {
    bg: "bg-marica-amber-dark",
    text: "text-white",
    dot: "bg-marica-amber-dark",
  },
  parenting: {
    bg: "bg-marica-teal",
    text: "text-white",
    dot: "bg-marica-teal",
  },
};

export const EVENTS: EventItem[] = [
  {
    slug: "workshop-kreasi-board-game",
    category: "workshop",
    title: "Workshop Kreasi Board Game",
    date: "2026-09-05",
    timeStart: "10:00",
    timeEnd: "12:00",
    location: "Marica Experience Store, Lt. 2",
    quota: 20,
    quotaLeft: 6,
    price: "Rp75.000 / anak",
    shortDescription:
      "Anak-anak merancang dan membuat board game sederhana dari kertas, sambil belajar konsep aturan main dan strategi dasar.",
    description: [
      "Di workshop ini, anak-anak diajak merancang board game mereka sendiri dari nol — mulai dari menentukan tema, membuat papan permainan, sampai menyusun aturan main yang masuk akal.",
      "Aktivitas dirancang untuk melatih logika, kreativitas, dan kemampuan bekerja sama, karena di akhir sesi setiap anak akan mencoba memainkan board game buatan teman-temannya.",
    ],
    agenda: [
      { time: "10:00", item: "Pembukaan & perkenalan tema" },
      { time: "10:15", item: "Mendesain papan & karakter" },
      { time: "11:00", item: "Menyusun aturan main" },
      { time: "11:30", item: "Sesi coba-main bersama" },
      { time: "11:50", item: "Penutupan & foto bersama" },
    ],
    facilitator: { name: "Kak Rani", role: "Fasilitator Edu-Kreatif Marica" },
  },
  {
    slug: "mendampingi-anak-belajar-tanpa-drama",
    category: "parenting",
    title: "Mendampingi Anak Belajar Tanpa Drama",
    date: "2026-09-06",
    timeStart: "10:00",
    timeEnd: "11:30",
    location: "Ruang Parenting, Marica Experience Store",
    quota: 30,
    quotaLeft: 14,
    price: "Gratis",
    shortDescription:
      "Sesi diskusi untuk orang tua tentang cara mendampingi anak belajar di rumah tanpa berujung tantrum atau tarik urat.",
    description: [
      "Banyak orang tua kesulitan mendampingi anak belajar tanpa berakhir dengan drama — baik dari sisi anak maupun orang tua sendiri. Sesi ini membahas penyebab umum di balik 'drama belajar' dan cara mengenalinya lebih awal.",
      "Peserta akan diajak mempraktikkan beberapa pendekatan komunikasi yang bisa langsung dicoba di rumah, disesuaikan dengan usia dan karakter anak masing-masing.",
    ],
    agenda: [
      { time: "10:00", item: "Registrasi & pembukaan" },
      { time: "10:10", item: "Mengenali pemicu drama belajar" },
      { time: "10:40", item: "Latihan komunikasi bersama fasilitator" },
      { time: "11:10", item: "Sesi tanya jawab" },
    ],
    facilitator: { name: "Kak Dinda", role: "Konselor Parenting" },
  },
  {
    slug: "workshop-eksperimen-sains-seru",
    category: "workshop",
    title: "Workshop Eksperimen Sains Seru",
    date: "2026-09-12",
    timeStart: "10:00",
    timeEnd: "12:00",
    location: "Marica Experience Store, Lt. 2",
    quota: 20,
    quotaLeft: 20,
    price: "Rp85.000 / anak",
    shortDescription:
      "Eksperimen sains sederhana dan aman untuk anak, dari reaksi kimia dapur sampai membuat lampu lava mini.",
    description: [
      "Workshop ini mengenalkan konsep sains dasar lewat eksperimen yang bisa dilihat dan dipegang langsung — bukan sekadar dijelaskan di papan tulis.",
      "Semua bahan yang digunakan aman untuk anak dan mudah ditemukan di rumah, supaya anak-anak juga bisa mengulang eksperimennya bersama keluarga setelah workshop selesai.",
    ],
    agenda: [
      { time: "10:00", item: "Pembukaan & pengenalan alat" },
      { time: "10:20", item: "Eksperimen reaksi warna" },
      { time: "11:00", item: "Membuat lampu lava mini" },
      { time: "11:40", item: "Diskusi 'kenapa ini bisa terjadi?'" },
    ],
    facilitator: { name: "Kak Bima", role: "Fasilitator Sains Marica" },
  },
  {
    slug: "membangun-kebiasaan-membaca",
    category: "parenting",
    title: "Membangun Kebiasaan Membaca",
    date: "2026-09-20",
    timeStart: "10:00",
    timeEnd: "11:30",
    location: "Ruang Parenting, Marica Experience Store",
    quota: 30,
    quotaLeft: 22,
    price: "Gratis",
    shortDescription:
      "Strategi praktis membangun kebiasaan membaca pada anak, dari memilih buku yang tepat sampai rutinitas harian yang realistis.",
    description: [
      "Membangun kebiasaan membaca bukan soal menyuruh anak membaca lebih lama, tapi soal membuat momen membaca terasa ringan dan konsisten.",
      "Sesi ini membahas cara memilih bacaan sesuai usia dan minat anak, serta menyusun rutinitas membaca harian yang realistis untuk keluarga yang sibuk.",
    ],
    agenda: [
      { time: "10:00", item: "Registrasi & pembukaan" },
      { time: "10:10", item: "Memilih buku sesuai usia & minat" },
      { time: "10:45", item: "Menyusun rutinitas membaca harian" },
      { time: "11:15", item: "Sesi tanya jawab" },
    ],
    facilitator: { name: "Kak Sari", role: "Pustakawan & Konselor Parenting" },
  },
];

export function getEventBySlug(slug: string) {
  return EVENTS.find((e) => e.slug === slug) ?? null;
}

export function getRelatedEvents(slug: string, limit = 3) {
  return EVENTS.filter((e) => e.slug !== slug).slice(0, limit);
}

const DAY_LABELS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_LABELS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export { DAY_LABELS_ID, MONTH_LABELS_ID };

export function formatLongDateID(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  const days = [
    "Minggu",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];
  return `${days[d.getDay()]}, ${d.getDate()} ${
    MONTH_LABELS_ID[d.getMonth()]
  } ${d.getFullYear()}`;
}