// Sebelumnya tiap halaman (artikel/page.tsx, artikel/[slug]/page.tsx,
// admin/artikel/page.tsx) langsung memakai `category.colorTag` mentah-mentah
// sebagai nilai CSS (mis. `style={{ backgroundColor: category.colorTag }}`).
// Kalau colorTag kosong/null (kategori dibuat lewat API tanpa isi field ini,
// karena sebelumnya belum ada form admin buat kategori), ATAU nilainya bukan
// hex yang valid, hasilnya semua badge kategori jatuh ke satu warna yang
// sama (atau rusak) — inilah sebabnya di tampilan artikel semua kategori
// terlihat "cuma kartu ungu doang".
//
// Helper ini dipakai di semua tempat yang menampilkan badge kategori supaya:
// 1. Kalau colorTag adalah hex valid ("#RRGGBB" atau "#RGB"), dipakai apa adanya.
// 2. Kalau tidak valid/kosong, tiap kategori tetap dapat warna yang BEDA-BEDA
//    (bukan warna default yang sama semua) dengan cara di-hash dari
//    slug/id/nama kategori, diambil dari palet warna brand Marica.

const HEX_COLOR_RE = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

// Diambil dari token warna brand di globals.css supaya konsisten dengan
// identitas visual Marica, dan cukup kontras satu sama lain.
const FALLBACK_PALETTE = [
  "#66a7c7", // marica-blue
  "#8b5cf6", // marica-violet-deep
  "#e8785a", // marica-rose-deep
  "#f8a81c", // marica-amber
  "#15a8bc", // marica-teal
  "#9d3872", // marica-maroon
  "#29cc7a", // marica-green
  "#b18843", // marica-tan
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // convert ke 32-bit integer
  }
  return Math.abs(hash);
}

export function isValidHexColor(value?: string | null): value is string {
  return !!value && HEX_COLOR_RE.test(value.trim());
}

/**
 * Tentukan warna hex final buat sebuah kategori.
 * @param colorTag nilai colorTag dari database (bisa null/kosong/invalid)
 * @param seed nilai unik buat kategori ini (slug/id/nama) supaya fallback-nya konsisten & beda antar-kategori
 */
export function resolveCategoryColor(colorTag: string | null | undefined, seed: string): string {
  if (isValidHexColor(colorTag)) return colorTag.trim();
  return FALLBACK_PALETTE[hashString(seed || "kategori") % FALLBACK_PALETTE.length];
}

/**
 * Style siap pakai buat badge kategori: background transparan lembut dari
 * warna kategori + teks warna solid, mirip pola yang sudah dipakai di
 * seluruh halaman artikel.
 */
export function categoryBadgeStyle(
  colorTag: string | null | undefined,
  seed: string
): { backgroundColor: string; color: string } {
  const hex = resolveCategoryColor(colorTag, seed);
  return { backgroundColor: `${hex}1A`, color: hex };
}

export { FALLBACK_PALETTE };
