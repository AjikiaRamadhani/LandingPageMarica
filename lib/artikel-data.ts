import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  CalendarDays,
  Sparkles,
  Home,
  Puzzle,
  Lightbulb,
} from "lucide-react";

// ---------------------------------------------------------------------------
// NOTE: this file is mock data so the /artikel pages have something real to
// render. Swap `getAllArticles` / `getArticleBySlug` for calls to your CMS or
// API (mis. `fetch("/api/articles")`) whenever that's ready — the page
// components only depend on the `Article` / `ArticleCategory` shapes below.
// ---------------------------------------------------------------------------

export type CategoryColor = "rose" | "amber" | "emerald";

export type ArticleCategory = {
  slug: string;
  label: string;
  count: number;
  icon: LucideIcon;
  color: CategoryColor;
};

export const categories: ArticleCategory[] = [
  { slug: "trial-class", label: "Trial Class", count: 12, icon: GraduationCap, color: "rose" },
  { slug: "event", label: "Event", count: 8, icon: CalendarDays, color: "amber" },
  { slug: "event-tahunan", label: "Event Tahunan", count: 3, icon: Sparkles, color: "emerald" },
  { slug: "parenting", label: "Parenting", count: 24, icon: Home, color: "rose" },
  { slug: "ide-aktivitas-edukatif", label: "Ide Aktivitas Edukatif", count: 15, icon: Puzzle, color: "amber" },
  { slug: "info-ide-pembelajaran", label: "Info Ide Pembelajaran", count: 11, icon: Lightbulb, color: "emerald" },
];

// Free-form topic tags shown in the search bar — a different, looser taxonomy
// than the structured categories above (an article can carry several).
export const tags = ["Parenting", "Aktivitas Anak", "Edukasi", "Kreativitas", "Permainan", "Tips & Trik"];

export type ArticleComment = {
  id: string;
  name: string;
  date: string;
  message: string;
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  categorySlug: string;
  tags: string[];
  coverImage: string;
  badge?: "Featured" | "Baru";
  content: {
    heading: string;
    body: string[];
    list?: string[];
  }[];
  comments: ArticleComment[];
};

export const articles: Article[] = [
  {
    slug: "marica-mengadakan-trial-class-basic-coding-untuk-anak",
    title: "Marica Mengadakan Trial Class Basic Coding untuk Anak",
    excerpt:
      "Memperkenalkan dunia pemrograman sejak dini dengan cara yang menyenangkan. Trial class ini dirancang khusus untuk...",
    date: "Senin, 02 Februari 2026",
    categorySlug: "trial-class",
    tags: ["Edukasi", "Aktivitas Anak"],
    coverImage: "/images/benefit5.png",
    badge: "Featured",
    content: [
      {
        heading: "Mengapa Basic Coding Penting?",
        body: [
          "Coding mengajarkan anak cara berpikir dan bernalar secara terstruktur (Computational Thinking). Saat anak belajar menyusun perintah, mereka sedang berlatih memecah masalah besar menjadi langkah-langkah kecil yang mudah dipahami.",
          "Lewat kegiatan komputasi kreatif ini, Marica ingin membantu Ayah Bunda mengenalkan konsep dasar teknologi kepada anak sejak dini, tanpa membuatnya terasa berat atau membosankan.",
        ],
      },
      {
        heading: "Manfaat Coding untuk Si Kecil",
        body: ["Beberapa manfaat yang bisa didapatkan anak dari trial class ini antara lain:"],
        list: [
          "Meningkatkan kreativitas dan imajinasi",
          "Melatih kesabaran dan konsentrasi lewat trial-and-error",
          "Membantu mereka mengenal alat bantu \"logic\" sejak usia dini, sehingga mereka lebih siap menghadapi tantangan di masa depan",
        ],
      },
    ],
    comments: [
      {
        id: "c1",
        name: "Ayu Lestari",
        date: "3 Feb 2026",
        message: "Anak saya ikut trial class ini, seru banget dan pengajarnya sabar sekali!",
      },
    ],
  },
  {
    slug: "kolaborasi-erista-garden-belajar-alam-bersama",
    title: "Kolaborasi Erista Garden: Belajar Alam Bersama",
    excerpt: "Sebuah hari penuh petualangan di Erista Garden, mengenalkan anak pada keanekaragaman hayati.",
    date: "Senin, 02 Februari 2026",
    categorySlug: "event",
    tags: ["Aktivitas Anak"],
    coverImage: "/images/benefit5.png",
    badge: "Baru",
    content: [
      {
        heading: "Sehari Belajar di Alam Terbuka",
        body: [
          "Bersama Erista Garden, anak-anak diajak mengenal berbagai jenis tanaman, cara merawatnya, dan pentingnya menjaga lingkungan sejak dini lewat kegiatan langsung di kebun.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "kunjungan-edukatif-ke-dihstp-upi",
    title: "Kunjungan Edukatif ke DIHSTP UPI",
    excerpt: "Membuka wawasan sains dan teknologi anak-anak melalui kunjungan interaktif ke fasilitas...",
    date: "Senin, 02 Februari 2026",
    categorySlug: "info-ide-pembelajaran",
    tags: ["Edukasi"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Mengenal Energi Masa Depan",
        body: [
          "Dalam kunjungan ini, siswa diajak melihat langsung berbagai instalasi sains dan teknologi, mulai dari energi terbarukan hingga simulasi interaktif yang membuat belajar terasa lebih hidup.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "keseruan-day-4-gfk-puncak-kreativitas-anak",
    title: "Keseruan Day 4 GFK: Puncak Kreativitas Anak",
    excerpt: "Merayakan hasil karya luar biasa dari para peserta cilik di hari terakhir festival kami.",
    date: "Senin, 02 Februari 2026",
    categorySlug: "event-tahunan",
    tags: ["Kreativitas", "Aktivitas Anak"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Puncak Festival Kreativitas",
        body: [
          "Di hari terakhir Golden Festival Kreativitas, anak-anak memamerkan karya seni dan proyek yang telah mereka kerjakan sepanjang acara, disaksikan langsung oleh orang tua.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "pentingnya-mendongeng-untuk-kecerdasan-emosi",
    title: "Pentingnya Mendongeng untuk Kecerdasan Emosi",
    excerpt: "Bagaimana cerita pengantar tidur dapat membentuk empati dan pemahaman emosional...",
    date: "Senin, 02 Februari 2026",
    categorySlug: "parenting",
    tags: ["Parenting", "Tips & Trik"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Cerita Sebelum Tidur, Bekal Emosi Seumur Hidup",
        body: [
          "Mendongeng bukan sekadar rutinitas sebelum tidur. Lewat cerita, anak belajar mengenali beragam emosi, melatih empati, dan memperkuat kedekatan dengan orang tua.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "tips-mengembangkan-motorik-halus-anak",
    title: "Tips Mengembangkan Motorik Halus Anak",
    excerpt: "Aktivitas sederhana di rumah yang bisa melatih motorik halus buah hati setiap hari.",
    date: "Selasa, 03 Februari 2026",
    categorySlug: "ide-aktivitas-edukatif",
    tags: ["Aktivitas Anak", "Tips & Trik"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Melatih Jari-Jari Kecil Lewat Bermain",
        body: [
          "Aktivitas seperti meronce, menggunting, dan meremas playdough membantu memperkuat otot-otot kecil di tangan anak yang nantinya dibutuhkan saat menulis.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "beragam-aktivitas-marica-playdate-akhir-pekan",
    title: "Beragam Aktivitas Marica Playdate Akhir Pekan",
    excerpt: "Rangkuman keseruan playdate akhir pekan bersama teman-teman kecil Marica.",
    date: "Rabu, 04 Februari 2026",
    categorySlug: "event",
    tags: ["Aktivitas Anak"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Bermain Sambil Belajar Bersosialisasi",
        body: [
          "Playdate akhir pekan ini mengajak anak-anak bermain board game edukatif sekaligus belajar bergiliran dan bekerja sama dengan teman sebaya.",
        ],
      },
    ],
    comments: [],
  },
  {
    slug: "5-aktivitas-setiap-hari-untuk-anak-usia-dini",
    title: "5 Aktivitas Setiap Hari untuk Anak Usia Dini",
    excerpt: "Rutinitas harian sederhana yang bisa mendukung tumbuh kembang optimal si kecil.",
    date: "Kamis, 05 Februari 2026",
    categorySlug: "parenting",
    tags: ["Parenting", "Edukasi"],
    coverImage: "/images/benefit5.png",
    content: [
      {
        heading: "Rutinitas Kecil, Manfaat Besar",
        body: [
          "Membaca bersama, bermain peran, bernyanyi, menghitung benda di sekitar, dan waktu bebas eksplorasi adalah lima aktivitas harian yang mudah diterapkan tanpa perlu alat khusus.",
        ],
      },
    ],
    comments: [],
  },
];

// Pengaman dev-only: kalau ada slug yang kepakai lebih dari sekali (biasanya
// gara-gara copy-paste artikel baru), React key jadi tidak unik dan urutan
// render kartu artikel bisa kacau (persis gejala "bug" tampilan acak). Ini
// akan langsung teriak di console begitu itu terjadi lagi.
if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const article of articles) {
    if (seen.has(article.slug)) duplicates.add(article.slug);
    seen.add(article.slug);
  }
  if (duplicates.size > 0) {
    console.warn(
      `[artikel-data] Slug duplikat ditemukan: ${[...duplicates].join(", ")}. ` +
        "Setiap artikel wajib punya slug unik, atau kartu di /artikel bisa salah urutan/salah link."
    );
  }
}

export function getAllArticles() {
  return articles;
}

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug) ?? null;
}

export function getRelatedArticles(slug: string, limit = 3) {
  return articles.filter((article) => article.slug !== slug).slice(0, limit);
}

export const categoryColorClasses: Record<CategoryColor, { bg: string; text: string; iconBg: string }> = {
  rose: { bg: "bg-rose-50", text: "text-rose-600", iconBg: "bg-rose-100" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", iconBg: "bg-amber-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
};