import {
  Rocket,
  Calculator,
  BookOpen,
  Puzzle,
  Palette,
  Eye,
  Scissors,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Category styling — one accent per subject area, drawn from the existing
// Marica token palette (globals.css) so new categories stay in-family
// without hardcoding a fresh palette.
// ---------------------------------------------------------------------------
export type CategoryKey =
  | "sains"
  | "matematika"
  | "bahasa"
  | "logika"
  | "motorik"
  | "kognitif"
  | "kreativitas";

export const CATEGORY_STYLES: Record<
  CategoryKey,
  { icon: LucideIcon; from: string; to: string; badgeBg: string; badgeText: string; iconColor: string }
> = {
  sains: { icon: Rocket, from: "#eaf5fb", to: "#cfe9f6", badgeBg: "#e3f4fb", badgeText: "#2f6a86", iconColor: "#3d84a6" },
  matematika: { icon: Calculator, from: "#fdf1da", to: "#fbe3b8", badgeBg: "#fdf1da", badgeText: "#7a4e04", iconColor: "#de8f0c" },
  bahasa: { icon: BookOpen, from: "#f3e8fc", to: "#e6d1f7", badgeBg: "#f3e8fc", badgeText: "#6b3fa0", iconColor: "#8b5cf6" },
  logika: { icon: Puzzle, from: "#e3f7f9", to: "#c9edf1", badgeBg: "#e3f7f9", badgeText: "#0e6b78", iconColor: "#15a8bc" },
  motorik: { icon: Palette, from: "#ffece4", to: "#ffd9c8", badgeBg: "#ffece4", badgeText: "#a3452b", iconColor: "#e8785a" },
  kognitif: { icon: Eye, from: "#f7e9f0", to: "#eed0e0", badgeBg: "#f7e9f0", badgeText: "#832d5f", iconColor: "#9d3872" },
  kreativitas: { icon: Scissors, from: "#e6f9ef", to: "#c8f0da", badgeBg: "#e6f9ef", badgeText: "#1c8a53", iconColor: "#29cc7a" },
};

export type Activity = {
  id: string;
  title: string;
  description: string;
  category: CategoryKey;
  categoryLabel: string;
  age: string;
  href: string;
  rating?: number;
};

export const EDUGAMES: Activity[] = [
  {
    id: "petualangan-antariksa",
    title: "Petualangan Antariksa",
    description: "Belajar tentang tata surya dan planet-planet sambil menyelesaikan misi luar angkasa.",
    category: "sains",
    categoryLabel: "Sains",
    age: "5-8 Thn",
    rating: 4.8,
    href: "/edugames/petualangan-antariksa",
  },
  {
    id: "ternak-berhitung",
    title: "Ternak Berhitung",
    description: "Latih kemampuan berhitung dasar dengan membantu paman petani mengumpulkan hasil panen.",
    category: "matematika",
    categoryLabel: "Matematika",
    age: "4-6 Thn",
    rating: 4.9,
    href: "/edugames/ternak-berhitung",
  },
  {
    id: "hutan-alfabet",
    title: "Hutan Alfabet",
    description: "Bantu si Kancil menemukan huruf-huruf yang hilang di dalam hutan ajaib.",
    category: "bahasa",
    categoryLabel: "Bahasa",
    age: "3-5 Thn",
    rating: 4.7,
    href: "/edugames/hutan-alfabet",
  },
  {
    id: "tebak-bentuk",
    title: "Tebak Bentuk",
    description: "Latih pengenalan bentuk dasar melalui permainan interaktif yang seru dan menantang.",
    category: "logika",
    categoryLabel: "Logika",
    age: "3-5 Thn",
    rating: 4.6,
    href: "/edugames/tebak-bentuk",
  },
  {
    id: "hitung-cepat",
    title: "Hitung Cepat",
    description: "Uji kecepatan berhitung si kecil dengan tantangan angka yang seru.",
    category: "matematika",
    categoryLabel: "Matematika",
    age: "6-8 Thn",
    rating: 4.8,
    href: "/edugames/hitung-cepat",
  },
  {
    id: "susun-pola",
    title: "Susun Pola",
    description: "Kembangkan logika dan pemecahan masalah dengan menyusun pola yang semakin menantang.",
    category: "logika",
    categoryLabel: "Logika",
    age: "5-7 Thn",
    rating: 4.7,
    href: "/edugames/susun-pola",
  },
];

export type Printable = Activity & {
  longDescription: string;
  format: string;
  fileSizeMb: number;
  points: number;
};

export const PRINTABLES: Printable[] = [
  {
    id: "mewarnai-karakter-marica",
    title: "Mewarnai Karakter Marica",
    description: "Lembar mewarnai karakter-karakter Marica bersama teman belajarnya di taman.",
    longDescription:
      "Dapatkan akses eksklusif ke lembar mewarnai resolusi tinggi (High-Res PDF) kami. Aktivitas ini dirancang khusus untuk melatih motorik halus dan kreativitas anak sambil bersenang-senang dengan karakter favorit mereka.",
    category: "motorik",
    categoryLabel: "Motorik Halus",
    age: "3-5 Thn",
    format: "PDF (A4)",
    fileSizeMb: 2.4,
    points: 20,
    href: "/aktivitas/printables-download?item=mewarnai-karakter-marica",
  },
  {
    id: "labirin-sederhana",
    title: "Labirin Sederhana",
    description: "Bantu si beruang menemukan jalan pulang lewat labirin yang seru.",
    longDescription:
      "Unduh lembar labirin cetak beresolusi tinggi ini untuk melatih logika dan kesabaran si kecil sambil membantu si beruang menemukan jalan pulang.",
    category: "logika",
    categoryLabel: "Logika & Pemecahan Masalah",
    age: "4-6 Thn",
    format: "PDF (A4)",
    fileSizeMb: 1.8,
    points: 15,
    href: "/aktivitas/printables-download?item=labirin-sederhana",
  },
  {
    id: "mencari-pasangan",
    title: "Mencari Pasangan",
    description: "Permainan mencocokkan gambar untuk melatih daya ingat dan ketelitian.",
    longDescription:
      "Lembar aktivitas mencocokkan gambar ini melatih daya ingat, ketelitian, dan kemampuan observasi anak lewat permainan yang menyenangkan.",
    category: "kognitif",
    categoryLabel: "Kognitif & Observasi",
    age: "3-5 Thn",
    format: "PDF (A4)",
    fileSizeMb: 2.1,
    points: 15,
    href: "/aktivitas/printables-download?item=mencari-pasangan",
  },
  {
    id: "hubungkan-titik-dino",
    title: "Hubungkan Titik (Dino)",
    description: "Sambungkan titik-titik dari 1 sampai 35 untuk menemukan wujud Dino.",
    longDescription:
      "Sambungkan titik-titik bernomor 1 sampai 35 untuk mengungkap wujud Dino, sambil melatih pengenalan angka dan motorik halus si kecil.",
    category: "motorik",
    categoryLabel: "Motorik Halus & Angka",
    age: "4-6 Thn",
    format: "PDF (A4)",
    fileSizeMb: 2.0,
    points: 15,
    href: "/aktivitas/printables-download?item=hubungkan-titik-dino",
  },
  {
    id: "mahkota-kertas",
    title: "Kerajinan: Mahkota Kertas",
    description: "Buat mahkota kertas berkilau lengkap dengan hiasan permata warna-warni.",
    longDescription:
      "Panduan kerajinan tangan lengkap untuk membuat mahkota kertas berkilau, lengkap dengan pola potong dan hiasan permata warna-warni.",
    category: "kreativitas",
    categoryLabel: "Kreativitas & Motorik",
    age: "5-7 Thn",
    format: "PDF (A4)",
    fileSizeMb: 3.1,
    points: 25,
    href: "/aktivitas/printables-download?item=mahkota-kertas",
  },
];

export function getPrintableById(id: string | null | undefined): Printable {
  return PRINTABLES.find((p) => p.id === id) ?? PRINTABLES[0];
}